import { describe, expect, test } from 'bun:test'
import { isBlockedBot } from './botFilter'

describe('isBlockedBot', () => {
  test('blocks AI crawlers', () => {
    for (const ua of [
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)',
      'ClaudeBot/1.0',
      'Mozilla/5.0 (compatible; Google-Extended/1.0)',
      'CCBot/2.0 (https://commoncrawl.org/faq/)',
      'PerplexityBot/1.0',
      'meta-externalagent/1.1'
    ]) {
      expect(isBlockedBot(ua)).toBe(true)
    }
  })

  test('blocks SEO crawlers and scrapers', () => {
    for (const ua of ['SemrushBot/7~bl', 'Mozilla/5.0 (compatible; AhrefsBot/7.0)', 'Scrapy/2.11 (+https://scrapy.org)', 'zgrab/0.x']) {
      expect(isBlockedBot(ua)).toBe(true)
    }
  })

  test('allows search engines and link previews', () => {
    for (const ua of [
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
      'Mozilla/5.0 (compatible; Applebot/0.1; +http://www.apple.com/go/applebot)',
      'Twitterbot/1.0',
      'facebookexternalhit/1.1',
      'Slackbot-LinkExpanding 1.0'
    ]) {
      expect(isBlockedBot(ua)).toBe(false)
    }
  })

  test('allows normal browsers and missing user agents', () => {
    expect(isBlockedBot('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36')).toBe(false)
    expect(isBlockedBot(undefined)).toBe(false)
    expect(isBlockedBot('')).toBe(false)
  })

  test('distinguishes Applebot from Applebot-Extended', () => {
    expect(isBlockedBot('Mozilla/5.0 (compatible; Applebot/0.1)')).toBe(false)
    expect(isBlockedBot('Mozilla/5.0 (compatible; Applebot-Extended/0.1)')).toBe(true)
  })
})
