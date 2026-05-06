export const blogModules = import.meta.glob('../content/blog/*.{md,mdx}', { eager: true })

export interface LocalPost {
  slug: string
  title: string
  pubDate: string
  description?: string
  tags?: string[]
  heroImage?: string
}

/**
 * ローカルのブログ記事を取得する
 */
export function getLocalPosts(): LocalPost[] {
  return Object.entries(blogModules).map(([path, module]: [string, any]) => {
    const slug = path.split('/').pop()?.replace(/\.(md|mdx)$/, '')
    return { slug, ...module.frontmatter }
  }).sort((a, b) =>
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  )
}

/**
 * 最新のローカルブログ記事を取得する
 */
export function getRecentLocalPosts(limit: number = 20): LocalPost[] {
  return getLocalPosts().slice(0, limit)
}
