import type { FC } from 'hono/jsx'

export interface BlogFrontmatter {
  title?: string
  description?: string
  pubDate?: string
  tags?: string[]
  heroImage?: string
}

export interface BlogModule {
  frontmatter?: BlogFrontmatter
  default?: FC
}
