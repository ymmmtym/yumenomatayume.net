import { parseRSS, type RSSItem } from './RSSParser'
import { getRecentLocalPosts } from '../lib/blog'

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
 * 外部RSSフィードから記事を取得する
 * 個人ブログはローカルファイルから直接取得するため、CORS問題を回避
 */
export async function fetchExternalPosts(maxPosts: number = 10): Promise<ExternalPost[]> {
  const allPosts: ExternalPost[] = []

  // 個人ブログはローカルファイルから直接取得
  const localPosts = getRecentLocalPosts(5)
  for (const post of localPosts) {
    allPosts.push({
      title: post.title,
      link: `https://yumenomatayume.net/blog/${post.slug}`,
      pubDate: post.pubDate,
      source: '個人ブログ',
      icon: '📋',
    })
  }

  // 他のRSSはHTTPフェッチ
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
