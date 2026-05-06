export interface LocalBlogPost {
  slug: string
  title: string
  pubDate: string
  description?: string
}

export function getLocalBlogPosts(): LocalBlogPost[] {
  const modules = import.meta.glob('../content/blog/*.md', { eager: true })
  
  return Object.entries(modules).map(([path, module]: [string, any]) => {
    const slug = path.split('/').pop()?.replace('.md', '') || ''
    return {
      slug,
      title: module.frontmatter?.title || '',
      pubDate: module.frontmatter?.pubDate || '',
      description: module.frontmatter?.description,
    }
  }).sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
}
