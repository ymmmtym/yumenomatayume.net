import { parseRSS, type RSSItem } from './RSSParser'
import { getLocalBlogPosts, type LocalBlogPost } from '../utils/localBlogPosts'

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

/**
 * ローカルブログ記事をExternalPost形式に変換
 */
function localBlogToExternalPost(post: LocalBlogPost): ExternalPost {
  return {
    title: post.title,
    link: `https://yumenomatayume.net/blog/${post.slug}`,
    pubDate: post.pubDate,
    source: '個人ブログ',
    icon: '📋',
  }
}

/**
 * 外部RSSフィードから記事を取得する
 * 個人ブログはローカルファイルから直接読み込むため、自己参照フェッチの問題を回避
 */
export async function fetchExternalPosts(maxPosts: number = 10): Promise<ExternalPost[]> {
  const allPosts: ExternalPost[] = []

  // 個人ブログはローカルファイルから直接読み込み（自己参照フェッチ回避）
  const localPosts = getLocalBlogPosts()
  allPosts.push(...localPosts.map(localBlogToExternalPost))

  // 外部RSSフィードを取得
  for (const feed of RSS_FEEDS) {
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
        continue
      }
      
      const xml = await response.text()
      
      if (xml.length === 0) {
        console.error(`Empty response for ${feed.name}`)
        continue
      }
      
      const items = await parseRSS(xml)
      
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
