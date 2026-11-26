import { expect, test } from 'bun:test'
import { buildBlogPosting, buildWebSite, toIsoDate } from './structuredData'

test('toIsoDate rejects invalid values', () => {
  expect(toIsoDate('2026-11-25')).toBe('2026-11-25T00:00:00.000Z')
  expect(toIsoDate('')).toBeUndefined()
  expect(toIsoDate('not-a-date')).toBeUndefined()
  expect(toIsoDate()).toBeUndefined()
})

test('buildBlogPosting includes article metadata', () => {
  const json = buildBlogPosting({
    url: 'https://yumenomatayume.net/blog/example',
    title: 'Example',
    description: 'Example description',
    image: 'https://yumenomatayume.net/og-image.png',
    pubDate: '2026-11-01',
    updatedDate: '2026-11-25',
    tags: ['aws', 'kubernetes'],
  })
  expect(json['@type']).toBe('BlogPosting')
  expect(json.headline).toBe('Example')
  expect(json.datePublished).toBe('2026-11-01T00:00:00.000Z')
  expect(json.dateModified).toBe('2026-11-25T00:00:00.000Z')
  expect(json.keywords).toBe('aws,kubernetes')
  expect(json.mainEntityOfPage).toEqual({
    '@type': 'WebPage',
    '@id': 'https://yumenomatayume.net/blog/example',
  })
})

test('buildBlogPosting omits invalid or missing dates', () => {
  const json = buildBlogPosting({
    url: 'https://yumenomatayume.net/blog/broken',
    title: 'Broken',
    image: 'https://yumenomatayume.net/og-image.png',
    pubDate: '',
    updatedDate: 'nope',
    tags: [],
  })
  expect(json).not.toHaveProperty('datePublished')
  expect(json).not.toHaveProperty('dateModified')
  expect(json).not.toHaveProperty('keywords')
  expect(JSON.stringify(json)).not.toContain('Invalid Date')
})

test('buildWebSite advertises the site search endpoint', () => {
  const json = buildWebSite({ url: 'https://yumenomatayume.net', description: 'SRE' })
  expect(json['@type']).toBe('WebSite')
  expect(json.url).toBe('https://yumenomatayume.net')
  expect(json.potentialAction).toMatchObject({
    '@type': 'SearchAction',
    target: { urlTemplate: 'https://yumenomatayume.net/?q={search_term_string}' },
  })
})
