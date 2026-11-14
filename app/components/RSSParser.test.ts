import { describe, expect, test } from 'bun:test'
import { parseRSS } from './RSSParser'

const item = '<item><title><![CDATA[An article]]></title><link>https://example.com/post</link><pubDate>today</pubDate></item>'
const expected = [{ title: 'An article', link: 'https://example.com/post', pubDate: 'today' }]

describe('parseRSS', () => {
  test('accepts RSS and RDF roots', async () => {
    expect(await parseRSS(`<rss><channel>${item}</channel></rss>`)).toEqual(expected)
    expect(await parseRSS(`<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">${item}</rdf:RDF>`)).toEqual(expected)
  })

  for (const prefix of ['', 'atom:', 'custom:']) {
    test(`extracts Atom entries with prefix "${prefix}"`, async () => {
      const namespace = prefix ? `xmlns:${prefix.slice(0, -1)}` : 'xmlns'
      expect(await parseRSS(`<?xml version="1.0"?>
        <${prefix}feed ${namespace}="http://www.w3.org/2005/Atom">
          <${prefix}entry><${prefix}title>An article</${prefix}title>
          <${prefix}link href="https://example.com/post"/>
          <${prefix}updated>today</${prefix}updated></${prefix}entry>
        </${prefix}feed>`)).toEqual(expected)
    })
  }

  test('preserves namespace-free Atom and field fallbacks', async () => {
    expect(await parseRSS('<feed><entry><title>An article</title><link>https://example.com/post</link><published>today</published></entry></feed>')).toEqual(expected)
    expect(await parseRSS('<rss xmlns:dc="http://purl.org/dc/elements/1.1/"><item><title>An article</title><guid>https://example.com/post</guid><dc:date>today</dc:date></item></rss>')).toEqual(expected)
  })

  test('ignores commented items and entries', async () => {
    expect(await parseRSS(`<rss><!-- ${item} --></rss>`)).toEqual([])
    expect(await parseRSS('<feed><!-- <entry><title>Fake</title><link href="https://example.com"/></entry> --></feed>')).toEqual([])
    expect(await parseRSS(`<!-- <rss/> --><rss><channel><!-- ${item} -->${item}</channel></rss>`)).toEqual(expected)
  })

  for (const xml of [
    `<html><rss>${item}</rss></html>`,
    `<!-- <rss>${item}</rss> --><html/>`,
    `<rssish>${item}</rssish>`,
    `<feed-other>${item}</feed-other>`,
    '<rss><item></rss>',
    '<rss/><feed/>',
    '',
  ]) {
    test(`rejects invalid document ${xml.slice(0, 35)}`, async () => {
      await expect(parseRSS(xml)).rejects.toThrow()
    })
  }
})
