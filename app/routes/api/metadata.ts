import { createRoute } from 'honox/factory'

interface LinkMetadata {
  url: string
  title?: string
  description?: string
  image?: string
  favicon?: string
  domain: string
}

const FETCH_TIMEOUT_MS = 5000
const CACHE_MAX_AGE_SECONDS = 300

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.')
  if (parts.length !== 4) return null
  let value = 0
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null
    const n = Number(part)
    if (n < 0 || n > 255) return null
    value = (value << 8) + n
  }
  return value >>> 0
}

function isPrivateIpv4(hostname: string): boolean {
  const n = ipv4ToInt(hostname)
  if (n === null) return false
  const inRange = (start: string, end: string) => {
    const s = ipv4ToInt(start)!
    const e = ipv4ToInt(end)!
    return n >= s && n <= e
  }
  return (
    inRange('0.0.0.0', '0.255.255.255') ||
    inRange('10.0.0.0', '10.255.255.255') ||
    inRange('100.64.0.0', '100.127.255.255') ||
    inRange('127.0.0.0', '127.255.255.255') ||
    inRange('169.254.0.0', '169.254.255.255') ||
    inRange('172.16.0.0', '172.31.255.255') ||
    inRange('192.0.0.0', '192.0.0.255') ||
    inRange('192.0.2.0', '192.0.2.255') ||
    inRange('192.88.99.0', '192.88.99.255') ||
    inRange('192.168.0.0', '192.168.255.255') ||
    inRange('198.18.0.0', '198.19.255.255') ||
    inRange('198.51.100.0', '198.51.100.255') ||
    inRange('203.0.113.0', '203.0.113.255') ||
    inRange('224.0.0.0', '255.255.255.255')
  )
}

function isPrivateIpv6(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (h === '::' || h === '::1') return true
  if (h.startsWith('fc') || h.startsWith('fd')) return true // fc00::/7
  if (/^fe[89ab]/.test(h)) return true // fe80::/10 link-local
  if (h.startsWith('ff')) return true // multicast
  if (h.startsWith('2001:db8')) return true // documentation
  // IPv4-mapped/compatible forms like ::ffff:127.0.0.1 or ::127.0.0.1
  const v4Mapped = h.match(/(?::ffff:|::)(\d+\.\d+\.\d+\.\d+)$/)
  if (v4Mapped) return isPrivateIpv4(v4Mapped[1])
  return false
}

function isBlockedHostname(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return true
  if (h === 'metadata.google.internal' || h === 'instance-data') return true
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) return isPrivateIpv4(h)
  if (h.includes(':')) return isPrivateIpv6(h)
  return false
}

function validateTargetUrl(rawUrl: string): { ok: true; url: URL } | { ok: false; status: 400 | 403; error: string } {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return { ok: false, status: 400, error: 'Invalid URL' }
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, status: 400, error: 'Only http and https URLs are allowed' }
  }

  if (!parsed.hostname || isBlockedHostname(parsed.hostname)) {
    return { ok: false, status: 403, error: 'URL host is not allowed' }
  }

  return { ok: true, url: parsed }
}

async function fetchLinkMetadata(targetUrl: URL): Promise<LinkMetadata> {
  const url = targetUrl.toString()
  const domain = targetUrl.hostname

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()

    const title = extractMetaContent(html, ['og:title', 'twitter:title', 'title']) || domain
    const description = extractMetaContent(html, ['og:description', 'twitter:description', 'description'])
    const image = extractMetaContent(html, ['og:image', 'twitter:image'])
    const favicon = extractFavicon(html, url)

    return {
      url,
      title,
      description,
      image: image ? resolveUrl(image, url) : undefined,
      favicon: favicon ? resolveUrl(favicon, url) : undefined,
      domain
    }
  } catch {
    return {
      url,
      title: domain,
      domain
    }
  }
}

function extractMetaContent(html: string, properties: string[]): string | undefined {
  for (const prop of properties) {
    const metaRegex = new RegExp(`<meta[^>]*(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*?)["']`, 'i')
    const match = html.match(metaRegex)
    if (match && match[1]) {
      return match[1].trim()
    }

    if (prop === 'title') {
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
      if (titleMatch && titleMatch[1]) {
        return titleMatch[1].trim()
      }
    }
  }
  return undefined
}

function extractFavicon(html: string, baseUrl: string): string | undefined {
  const faviconRegex = /<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*href=["']([^"']*?)["']/i
  const match = html.match(faviconRegex)

  if (match && match[1]) {
    return match[1]
  }

  return `${new URL(baseUrl).origin}/favicon.ico`
}

function resolveUrl(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).toString()
  } catch {
    return url
  }
}

export default createRoute(async (c) => {
  const rawUrl = c.req.query('url')

  if (!rawUrl) {
    return c.json({ error: 'URL parameter is required' }, 400)
  }

  const validation = validateTargetUrl(rawUrl)
  if (!validation.ok) {
    return c.json({ error: validation.error }, validation.status)
  }

  const metadata = await fetchLinkMetadata(validation.url)
  c.header('Cache-Control', `public, max-age=${CACHE_MAX_AGE_SECONDS}`)
  return c.json(metadata)
})
