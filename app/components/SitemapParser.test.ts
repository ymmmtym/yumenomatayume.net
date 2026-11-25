import { describe, expect, test } from 'bun:test'
import { parseSitemap, toSitemapPosts } from './SitemapParser'

const url = (loc: string, lastmod: string) => `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`
const sitemap = (...urls: string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`

describe('parseSitemap', () => {
  test('extracts loc and lastmod', () => {
    expect(parseSitemap(sitemap(url('https://example.com/note', '2026-11-04T00:00:00.000Z')))).toEqual([
      { loc: 'https://example.com/note', lastmod: '2026-11-04T00:00:00.000Z' },
    ])
  })

  test('keeps entries without lastmod', () => {
    expect(parseSitemap(sitemap('<url><loc>https://example.com/note</loc></url>'))).toEqual([
      { loc: 'https://example.com/note', lastmod: '' },
    ])
  })

  test('rejects documents without a urlset root', () => {
    expect(() => parseSitemap('<rss><channel></channel></rss>')).toThrow()
  })
})

describe('toSitemapPosts', () => {
  const entries = parseSitemap(sitemap(
    url('https://example.com/', '2026-11-25T00:00:00.000Z'),
    url('https://example.com/tags/ai', '2026-11-25T00:00:00.000Z'),
    url('https://example.com/old-note', '2025-09-04T00:00:00.000Z'),
    url('https://example.com/new-note', '2026-11-04T00:00:00.000Z'),
    url('https://example.com/no-date', ''),
  ))

  test('keeps notes only and sorts by lastmod descending', () => {
    expect(toSitemapPosts(entries)).toEqual([
      { title: 'new-note', link: 'https://example.com/new-note', pubDate: '2026-11-04T00:00:00.000Z' },
      { title: 'old-note', link: 'https://example.com/old-note', pubDate: '2025-09-04T00:00:00.000Z' },
    ])
  })

  test('prefers contentIndex titles and decodes percent-encoded slugs', () => {
    const encoded = `https://example.com/${encodeURIComponent('日本語のノート')}`
    const posts = toSitemapPosts(
      parseSitemap(sitemap(url(encoded, '2026-11-04T00:00:00.000Z'))),
      { '日本語のノート': { title: '日本語のノート' } },
    )
    expect(posts).toEqual([
      { title: '日本語のノート', link: encoded, pubDate: '2026-11-04T00:00:00.000Z' },
    ])
  })

  test('falls back to the decoded slug when contentIndex has no title', () => {
    const encoded = `https://example.com/${encodeURIComponent('日本語のノート')}`
    const posts = toSitemapPosts(parseSitemap(sitemap(url(encoded, '2026-11-04T00:00:00.000Z'))), {})
    expect(posts[0].title).toBe('日本語のノート')
  })

  test('applies the limit', () => {
    expect(toSitemapPosts(entries, {}, 1)).toHaveLength(1)
  })
})
