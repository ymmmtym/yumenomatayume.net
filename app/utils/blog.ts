const modules = import.meta.glob('../content/blog/*.md', { eager: true })

export interface BlogPost {
  slug: string
  title: string
  pubDate: string
  description?: string
}

export function loadBlogPosts(limit: number = 20): BlogPost[] {
  return Object.entries(modules)
    .map(([path, module]: [string, any]) => {
      const slug = path.split('/').pop()?.replace('.md', '')
      return { slug, ...module.frontmatter }
    })
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, limit)
}
