import type { FC } from 'hono/jsx'

export interface BlogFrontmatter {
  title?: string
  description?: string
  pubDate?: string
  updatedDate?: string
  tags?: string[]
  heroImage?: string
}

export interface BlogModule {
  frontmatter?: BlogFrontmatter
  default?: FC
}

export interface BlogPost {
  path: string
  slug: string
  module: BlogModule
}

const modules = import.meta.glob<BlogModule>('../content/blog/*.{md,mdx}', { eager: true })

export function getBlogPosts(): BlogPost[] {
  return Object.entries(modules).map(([path, module]) => ({
    path,
    slug: path.split('/').pop()?.replace(/\.(md|mdx)$/, '') ?? '',
    module,
  }))
}
