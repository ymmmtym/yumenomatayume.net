import { DOMParser } from '@xmldom/xmldom'

export interface SitemapEntry {
  loc: string
  lastmod: string
}

export interface SitemapPost {
  title: string
  link: string
  pubDate: string
}

interface ContentIndexEntry {
  title?: string
}

/**
 * sitemap.xml から URL と最終更新日を取り出す
 */
export function parseSitemap(xml: string): SitemapEntry[] {
  const document = new DOMParser({
    onError: () => { throw new Error('Invalid XML format') },
  }).parseFromString(xml.trim(), 'application/xml')
  const root = document.documentElement
  if (!root || root.tagName.toLowerCase() !== 'urlset') {
    throw new Error('Invalid XML format: missing urlset root tag')
  }

  const entries: SitemapEntry[] = []
  for (const url of Array.from(root.getElementsByTagName('url'))) {
    const loc = url.getElementsByTagName('loc')[0]?.textContent?.trim() ?? ''
    const lastmod = url.getElementsByTagName('lastmod')[0]?.textContent?.trim() ?? ''
    if (loc) entries.push({ loc, lastmod })
  }
  return entries
}

function pathOf(loc: string): string | null {
  try {
    return decodeURIComponent(new URL(loc).pathname)
  } catch {
    return null
  }
}

/**
 * sitemap と contentIndex.json を突き合わせてノートだけを新しい順に返す。
 * Quartz の RSS はトップ/タグページしか含まず pubDate もビルド時刻なので、
 * 日付は sitemap の lastmod、タイトルは contentIndex から取る。
 */
export function toSitemapPosts(
  entries: SitemapEntry[],
  contentIndex: Record<string, ContentIndexEntry> = {},
  limit = 20,
): SitemapPost[] {
  const posts: SitemapPost[] = []
  for (const entry of entries) {
    const path = pathOf(entry.loc)
    if (!path || path === '/' || path.startsWith('/tags/')) continue
    if (!Number.isFinite(Date.parse(entry.lastmod))) continue

    const slug = path.replace(/^\/|\/$/g, '')
    posts.push({
      title: contentIndex[slug]?.title?.trim() || slug,
      link: entry.loc,
      pubDate: entry.lastmod,
    })
  }

  return posts
    .sort((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate))
    .slice(0, limit)
}
