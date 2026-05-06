import { createRoute } from 'honox/factory'

interface LinkMetadata {
  url: string
  title?: string
  description?: string
  image?: string
  favicon?: string
  domain: string
}

// SSRF対策: プライベートIPアドレスや内部ホストをブロック
function isPrivateUrl(url: URL): boolean {
  const hostname = url.hostname
  
  // localhost のチェック
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return true
  }
  
  // プライベートIPアドレスのチェック (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
  if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(hostname)) {
    return true
  }
  
  // リンクローカルアドレス (169.254.x.x)
  if (/^169\.254\./.test(hostname)) {
    return true
  }
  
  return false
}

async function fetchLinkMetadata(url: string): Promise<LinkMetadata> {
  const parsedUrl = new URL(url)
  const domain = parsedUrl.hostname
  
  // HTTPスキームを拒否（HTTPSのみ許可）
  if (parsedUrl.protocol !== 'https:') {
    throw new Error('HTTP scheme not allowed')
  }
  
  // プライベートURLをブロック
  if (isPrivateUrl(parsedUrl)) {
    throw new Error('Private URL not allowed')
  }
  
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10秒タイムアウト
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
      },
      signal: controller.signal as any
    })
    
    clearTimeout(timeout)
    
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
  } catch (error) {
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
  if (url.startsWith('//')) {
    return `https:${url}`
  } else if (url.startsWith('/')) {
    return `${new URL(baseUrl).origin}${url}`
  } else if (!url.startsWith('http')) {
    return `${new URL(baseUrl).origin}/${url}`
  }
  return url
}

export default createRoute(async (c) => {
  const url = c.req.query('url')
  
  if (!url) {
    return c.json({ error: 'URL parameter is required' }, 400)
  }
  
  try {
    // URLの妥当性をチェック
    const parsedUrl = new URL(url)
    
    // セキュリティチェック（二重にチェック）
    if (parsedUrl.protocol !== 'https:') {
      return c.json({ error: 'HTTPS URLs only' }, 403)
    }
    
    if (isPrivateUrl(parsedUrl)) {
      return c.json({ error: 'Private URLs not allowed' }, 403)
    }
    
    const metadata = await fetchLinkMetadata(url)
    return c.json(metadata)
  } catch (error) {
    console.error('Error fetching metadata:', error)
    try {
      const hostname = new URL(url).hostname
      return c.json({ 
        url,
        title: hostname,
        domain: hostname
      })
    } catch {
      return c.json({ 
        url,
        title: 'Invalid URL',
        domain: 'Invalid URL'
      }, 400)
    }
  }
})
