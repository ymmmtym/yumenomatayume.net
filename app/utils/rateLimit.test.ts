import { describe, expect, test } from 'bun:test'
import { isRateLimited, rateLimitKey } from './rateLimit'

describe('rateLimitKey', () => {
  test('combines path and IP', () => {
    expect(rateLimitKey('/contact', '203.0.113.5')).toBe('/contact:203.0.113.5')
  })

  test('trims the IP and falls back to unknown when missing', () => {
    expect(rateLimitKey('/contact', ' 203.0.113.5 ')).toBe('/contact:203.0.113.5')
    expect(rateLimitKey('/contact', null)).toBe('/contact:unknown')
    expect(rateLimitKey('/contact', '')).toBe('/contact:unknown')
    expect(rateLimitKey('/contact', '   ')).toBe('/contact:unknown')
  })

  test('keeps different paths in separate buckets', () => {
    expect(rateLimitKey('/contact', '203.0.113.5')).not.toBe(rateLimitKey('/api', '203.0.113.5'))
  })
})

describe('isRateLimited', () => {
  test('allows the request when no binding is configured', async () => {
    expect(await isRateLimited(undefined, 'k')).toBe(false)
  })

  test('allows while the limiter reports success', async () => {
    const limiter = { limit: async () => ({ success: true }) }
    expect(await isRateLimited(limiter, 'k')).toBe(false)
  })

  test('blocks once the limiter reports failure', async () => {
    const limiter = { limit: async () => ({ success: false }) }
    expect(await isRateLimited(limiter, 'k')).toBe(true)
  })

  test('passes the key through to the binding', async () => {
    const keys: string[] = []
    const limiter = {
      limit: async ({ key }: { key: string }) => {
        keys.push(key)
        return { success: true }
      }
    }
    await isRateLimited(limiter, '/contact:203.0.113.5')
    expect(keys).toEqual(['/contact:203.0.113.5'])
  })

  test('fails open so a broken binding does not block submissions', async () => {
    const limiter = {
      limit: async () => {
        throw new Error('boom')
      }
    }
    expect(await isRateLimited(limiter, 'k')).toBe(false)
  })
})
