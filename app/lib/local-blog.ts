const modules = import.meta.glob('../content/blog/*.md', { eager: true })

export interface LocalBlogPost {
  title: string
  link: string
  pubDate: string
  source: string
  icon: string
}

/**
 * ローカルのブログ記事を取得する
 * Cloudflare Workers環境での自己参照fetch問題を回避するため、
 * HTTPフェッチせずに直接import.meta.globで読み込む
 */
export function getLocalBlogPosts(): LocalBlogPost[] {
  const baseUrl = 'https://yumenomatayume.net'

  return Object.entries(modules).map(([path, module]: [string, any]) => {
    const slug = path.split('/').pop()?.replace('.md', '')
    return {
      title: module.frontmatter.title,
      link: `${baseUrl}/blog/${slug}`,
      pubDate: module.frontmatter.pubDate,
      source: '個人ブログ',
      icon: '📋',
    }
  })
}
