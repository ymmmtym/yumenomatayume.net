import { parseRSS, type RSSItem } from './RSSParser'

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

const RSS_FEEDS: RSSFeed[] = [
  { name: 'Zenn', url: 'https://zenn.dev/ymmmtym/feed', icon: '📝' },
  { name: 'Qiita', url: 'https://qiita.com/yumenomatayume/feed', icon: '📚' },
  { name: 'はてな', url: 'https://ymmmtym.hateblo.jp/feed', icon: '📖' },
]

interface BlogPost {
  title: string
  date: string
  slug: string
}

/**
 * ローカルのブログ記事を読み込む（外部fetchを使わずに解決）
 */
async function loadLocalBlogPosts(): Promise<ExternalPost[]> {
  const posts: ExternalPost[] = []
  const modules = import.meta.glob('../content/blog/*.md', { query: '?raw', import: 'default' })

  for (const [path, loader] of Object.entries(modules)) {
    try {
      const content = await loader() as string
      const slug = path.split('/').pop()?.replace('.md', '') || ''

      const titleMatch = content.match(/^title:\s*(.+)$/m)
      const dateMatch = content.match(/^date:\s*(.+)$/m)

      if (titleMatch && dateMatch) {
        posts.push({
          title: titleMatch[1].trim(),
          link: `https://yumenomatayume.net/blog/${slug}`,
          pubDate: dateMatch[1].trim(),
          source: '個人ブログ',
          icon: '📋',
        })
      }
    } catch (error) {
      console.error(`Failed to load local blog post ${path}:`, error)
    }
  }

  return posts
}

/**
 * 外部RSSフィードから記事を取得する
 */
export async function fetchExternalPosts(maxPosts: number = 10): Promise<ExternalPost[]> {
  const allPosts: ExternalPost[] = []

  // ローカルのブログ記事を読み込み（CORS問題を回避）
  const localPosts = await loadLocalBlogPosts()
  allPosts.push(...localPosts)

  // 外部RSSフィードを取得
  for (const feed of RSS_FEEDS) {
    try {
      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; yumenomatayume.net RSS Reader)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(8000),
      })

      if (!response.ok) {
        console.error(`HTTP error for ${feed.name}: ${response.status} ${response.statusText}`)
        continue
      }

      const xml = await response.text()

      if (xml.length === 0) {
        console.error(`Empty response for ${feed.name}`)
        continue
      }

      const items = await parseRSS(xml)

      if (items.length === 0) {
        console.warn(`No items parsed from ${feed.name}`)
      }

      const posts = items.map(item => ({
        title: item.title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
        link: item.link,
        pubDate: item.pubDate,
        source: feed.name,
        icon: feed.icon,
      }))

      allPosts.push(...posts)
    } catch (error) {
      console.error(`Failed to fetch ${feed.name}:`, error)
    }
  }

  return allPosts
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, maxPosts)
}
