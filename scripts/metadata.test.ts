import { afterEach, expect, test } from 'bun:test'
import { Hono } from 'hono'
import metadataRoute from '../app/routes/api/metadata'

const app = new Hono().get('/metadata', ...metadataRoute)
const originalFetch = globalThis.fetch
const request = (url: string) => app.request(`/metadata?url=${encodeURIComponent(url)}`)
afterEach(() => { globalThis.fetch = originalFetch })

test('rejects private IPv4 tails in dotted, hexadecimal, compressed and expanded IPv6', async () => {
  let calls = 0
  globalThis.fetch = (async () => { calls++; throw new Error('Unexpected fetch') }) as typeof fetch
  for (const ip of ['127.0.0.1', '10.0.0.1', '172.16.0.1', '192.168.0.1', '169.254.169.254', '0.0.0.10', '255.255.255.255']) {
    const bytes = ip.split('.').map(Number)
    const tail = `${((bytes[0] << 8) | bytes[1]).toString(16)}:${((bytes[2] << 8) | bytes[3]).toString(16)}`
    for (const host of [`::ffff:${ip}`, `::${ip}`, `::ffff:${tail}`, `::${tail}`, `0:0:0:0:0:ffff:${tail}`, `0:0:0:0:0:0:${tail}`]) {
      expect((await request(`http://[${host}]/`)).status).toBe(403)
    }
  }
  expect(calls).toBe(0)
})

test('allows public IPv4 tails and ordinary public IPv6 and extracts metadata', async () => {
  globalThis.fetch = (async () => new Response('<title>Public page</title>')) as typeof fetch
  for (const host of ['::ffff:8.8.8.8', '::8.8.8.8', '::ffff:808:808', '::808:808', '2606:4700:4700::1111']) {
    const response = await request(`https://[${host}]/`)
    expect(response.status).toBe(200)
    expect((await response.json()).title).toBe('Public page')
  }
})

test('rejects redirects without contacting the destination and retains timeout and fallback', async () => {
  let destinationRequests = 0
  const destination = Bun.serve({ port: 0, fetch() { destinationRequests++; return new Response('<title>Private page</title>') } })
  const redirector = Bun.serve({ port: 0, fetch() { return Response.redirect(destination.url) } })
  try {
    globalThis.fetch = (async (_url, options) => {
      expect(options?.redirect).toBe('error')
      expect(options?.signal).toBeInstanceOf(AbortSignal)
      expect(options?.signal?.aborted).toBe(false)
      return originalFetch(redirector.url, options)
    }) as typeof fetch
    const response = await request('https://example.com/redirect')
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ url: 'https://example.com/redirect', title: 'example.com', domain: 'example.com' })
    expect(destinationRequests).toBe(0)
  } finally {
    redirector.stop(true)
    destination.stop(true)
  }
})
