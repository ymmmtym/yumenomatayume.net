import type { ExternalPost } from '../components/ExternalPosts'

const modules = import.meta.glob('../content/blog/*.md', { eager: true })

export interface LocalPost {
  slug: string
  title: string
  description: string
  pubDate: string
  tags?: string[]
}

export function getLocalPosts(): LocalPost[] {
  return Object.entries(modules).map(([path, module]: [string, any]) => {
    const slug = path.split('/').pop()?.replace('.md', '') || ''
    return {
      slug,
      title: module.frontmatter?.title || slug,
      description: module.frontmatter?.description || '',
      pubDate: module.frontmatter?.pubDate || new Date().toISOString(),
      tags: module.frontmatter?.tags || [],
    }
  }).sort((a, b) =>
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  )
}

export function getLocalPostsAsExternalPosts(): ExternalPost[] {
  const baseUrl = 'https://yumenomatayume.net'
  return getLocalPosts().map(post => ({
    title: post.title,
    link: `${baseUrl}/blog/${post.slug}`,
    pubDate: post.pubDate,
    source: '個人ブログ',
    icon: '📋',
  }))
}
