import { parseRSS } from './RSSParser'
import { getBlogPosts } from '../utils/blog'

export interface ExternalPost {
  title: string
  link: string
  pubDate: string
  source: string
  icon: string
}

export interface RSSFeed {
  name: string
  url: string
  icon: string
}

interface ExternalPostsResult {
  posts: ExternalPost[]
  isFallback: boolean
}

interface CachedExternalPosts {
  posts: ExternalPost[]
  cachedAt: number
}

const RSS_FEEDS: RSSFeed[] = [
  { name: '個人ブログ', url: 'https://yumenomatayume.net/feed', icon: '📋' },
  { name: 'Zenn', url: 'https://zenn.dev/ymmmtym/feed', icon: '📝' },
  { name: 'Qiita', url: 'https://qiita.com/yumenomatayume/feed', icon: '📚' },
  { name: 'はてな', url: 'https://ymmmtym.hateblo.jp/feed', icon: '📖' },
]

const CACHE_KEY = 'https://yumenomatayume.net/__cache/external-posts'
const CACHE_TTL_MS = 10 * 60 * 1000
// Retain stale posts for recovery when a feed refresh fails.
const CACHE_RETENTION_SECONDS = 24 * 60 * 60

function getLocalBlogPosts(): ExternalPost[] {
  return getBlogPosts().map(({ slug, module }) => {
    const frontmatter = module.frontmatter ?? {}
    return {
      title: frontmatter.title ?? '',
      link: `https://yumenomatayume.net/blog/${slug}`,
      pubDate: typeof frontmatter.pubDate === 'string' ? frontmatter.pubDate : '',
      source: '個人ブログ',
      icon: '📋',
    }
  }).filter(p => p.title && p.link && p.pubDate && Number.isFinite(Date.parse(p.pubDate)))
}

const FALLBACK_POSTS: ExternalPost[] = RSS_FEEDS.map(feed => ({
  title: `${feed.name} の記事一覧`,
  link: feed.url.replace(/\/feed$/, ''),
  pubDate: new Date().toISOString(),
  source: feed.name,
  icon: feed.icon,
}))

function mergeAndSortPosts(localPosts: ExternalPost[], externalPosts: ExternalPost[], maxPosts: number): ExternalPost[] {
  return [...localPosts, ...externalPosts]
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, maxPosts)
}

async function readCache(): Promise<CachedExternalPosts | null> {
  const cache = (globalThis as any).caches?.default
  if (!cache) return null
  try {
    const res = await cache.match(CACHE_KEY)
    if (!res) return null
    const data = await res.json() as CachedExternalPosts
    if (!data || !Array.isArray(data.posts) || typeof data.cachedAt !== 'number') return null
    return data
  } catch {
    return null
  }
}

async function writeCache(posts: ExternalPost[]): Promise<void> {
  const cache = (globalThis as any).caches?.default
  if (!cache) return
  try {
    const body = JSON.stringify({ posts, cachedAt: Date.now() } satisfies CachedExternalPosts)
    const res = new Response(body, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': `public, max-age=${CACHE_RETENTION_SECONDS}`,
      },
    })
    await cache.put(CACHE_KEY, res)
  } catch {
    // ignore cache write failures
  }
}

async function fetchFeedPosts(feed: RSSFeed): Promise<ExternalPost[]> {
  try {
    const response = await fetch(feed.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; yumenomatayume.net RSS Reader)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      console.error(`HTTP error for ${feed.name}: ${response.status} ${response.statusText}`)
      return []
    }

    const xml = await response.text()
    if (xml.length === 0) {
      console.error(`Empty response for ${feed.name}`)
      return []
    }

    const items = await parseRSS(xml)
    if (items.length === 0) {
      console.warn(`No items parsed from ${feed.name}`)
      return []
    }

    return items.map(item => ({
      title: item.title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
      link: item.link,
      pubDate: item.pubDate,
      source: feed.name,
      icon: feed.icon,
    }))
  } catch (error) {
    console.error(`Failed to fetch ${feed.name}:`, error)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn(`Possible CORS issue for ${feed.name} - this may be expected in Cloudflare Workers environment`)
    }
    return []
  }
}

/**
 * 外部RSSフィードから記事を取得する
 * 個人ブログはローカルファイルから直接読み込み、他はHTTPフェッチ（並列化・キャッシュ）
 */
export async function fetchExternalPosts(maxPosts = 10): Promise<ExternalPostsResult> {
  const localPosts = getLocalBlogPosts()

  const cached = await readCache()
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return {
      posts: mergeAndSortPosts(localPosts, cached.posts, maxPosts),
      isFallback: false,
    }
  }

  const externalFeeds = RSS_FEEDS.filter(feed => feed.name !== '個人ブログ')
  const results = await Promise.allSettled(externalFeeds.map(feed => fetchFeedPosts(feed)))
  const externalPosts = results.flatMap(result => result.status === 'fulfilled' ? result.value : [])

  if (externalPosts.length > 0) {
    await writeCache(externalPosts)
    return {
      posts: mergeAndSortPosts(localPosts, externalPosts, maxPosts),
      isFallback: false,
    }
  }

  if (cached && cached.posts.length > 0) {
    return {
      posts: mergeAndSortPosts(localPosts, cached.posts, maxPosts),
      isFallback: false,
    }
  }

  if (localPosts.length > 0) {
    return {
      posts: mergeAndSortPosts(localPosts, [], maxPosts),
      isFallback: false,
    }
  }

  return {
    posts: FALLBACK_POSTS.slice(0, maxPosts),
    isFallback: true,
  }
}
