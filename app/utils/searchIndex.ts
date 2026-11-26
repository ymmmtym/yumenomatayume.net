import searchBodies from 'virtual:search-bodies'
import { getBlogPosts } from './blog'

export interface SearchIndexEntry {
  slug: string
  title: string
  description: string
  tags: string[]
  pubDate: string
  updatedDate?: string
  body: string
}

// Search bodies are stripped of frontmatter and HTML at build time (see
// vite.config.ts / viteSearchBodies.ts), so this is a cheap lookup rather than
// re-parsing every article's Markdown on each request.
export function getSearchIndex(): SearchIndexEntry[] {
  try {
    return getBlogPosts().map(({ slug, module }) => ({
      slug,
      title: module.frontmatter?.title ?? '',
      description: module.frontmatter?.description ?? '',
      tags: module.frontmatter?.tags ?? [],
      pubDate: module.frontmatter?.pubDate ?? '',
      body: searchBodies[slug] ?? '',
      updatedDate: module.frontmatter?.updatedDate || ''
    }))
  } catch {
    return []
  }
}
