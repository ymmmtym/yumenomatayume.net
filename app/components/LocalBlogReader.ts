import type { ExternalPost } from './ExternalPosts'

const blogModules = import.meta.glob('../content/blog/*.md', { eager: true })

/**
 * ローカルのブログ記事から外部投稿形式のデータを生成する
 * Cloudflare Workersでの自己参照fetch問題を回避するために使用
 */
export function getLocalBlogPosts(maxPosts: number = 10): ExternalPost[] {
  const posts = Object.entries(blogModules).map(([path, module]: [string, any]) => {
    const slug = path.split('/').pop()?.replace('.md', '')
    const { title, pubDate, description } = module.frontmatter || {}
    
    return {
      title: title || '',
      link: `https://yumenomatayume.net/blog/${slug}`,
      pubDate: pubDate || new Date().toISOString(),
      source: '個人ブログ',
      icon: '📋',
    }
  })
  
  return posts
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, maxPosts)
}
