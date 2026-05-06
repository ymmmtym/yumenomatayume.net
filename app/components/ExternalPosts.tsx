import { parseRSS, type RSSItem } from './RSSParser'

const blogModules = import.meta.glob('../content/blog/*.md', { eager: true })

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

function getLocalBlogPosts(): ExternalPost[] {
  const baseUrl = 'https://yumenomatayume.net'
  
  return Object.entries(blogModules).map(([path, module]: [string, any]) => {
    const slug = path.split('/').pop()?.replace('.md', '')
    const frontmatter = module.frontmatter
    
    return {
      title: frontmatter.title || '',
      link: `${baseUrl}/blog/${slug}`,
      pubDate: frontmatter.pubDate || '',
      source: '個人ブログ',
      icon: '📋',
    }
  }).sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
}

/**
 * 外部RSSフィードから記事を取得する
 * 個人ブログはローカルファイルから直接読み込み、他のフィードはHTTPフェッチを使用
 */
export async function fetchExternalPosts(maxPosts: number = 10): Promise<ExternalPost[]> {
  const allPosts: ExternalPost[] = [...getLocalBlogPosts()]

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
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn(`Possible CORS issue for ${feed.name}`)
      }
    }
  }
  
  return allPosts
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, maxPosts)
}
