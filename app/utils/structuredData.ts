const SITE_NAME = 'yumenomatayume'

const AUTHOR = {
  '@type': 'Person',
  name: SITE_NAME,
  url: 'https://yumenomatayume.net',
}

/** 不正な日付は undefined を返す（JSON-LD に Invalid Date を出さない） */
export function toIsoDate(value?: string): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

export interface BlogPostingInput {
  url: string
  title: string
  description?: string
  image: string
  pubDate?: string
  updatedDate?: string
  tags?: string[]
}

export function buildBlogPosting(input: BlogPostingInput): Record<string, unknown> {
  const published = toIsoDate(input.pubDate)
  const modified = toIsoDate(input.updatedDate)
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    ...(input.description ? { description: input.description } : {}),
    image: [input.image],
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
    ...(input.tags && input.tags.length > 0 ? { keywords: input.tags.join(',') } : {}),
    author: AUTHOR,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: input.image },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
  }
}

export interface WebSiteInput {
  url: string
  description?: string
}

export function buildWebSite(input: WebSiteInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: input.url,
    ...(input.description ? { description: input.description } : {}),
    // /?q=... で検索結果を開けるようにしてある（SearchBox 側で処理）
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${input.url}/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}
