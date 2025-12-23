import { createRoute } from 'honox/factory'

interface LinkMetadata {
  url: string
  title?: string
  description?: string
  image?: string
  favicon?: string
  domain: string
}

async function fetchLinkMetadata(url: string): Promise<LinkMetadata> {
  const domain = new URL(url).hostname
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkCard/1.0)'
      }
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
  } catch (error) {
    console.warn(`Failed to fetch metadata for ${url}:`, error)
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
    new URL(url)
    
    const metadata = await fetchLinkMetadata(url)
    return c.json(metadata)
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return c.json({ 
      url,
      title: new URL(url).hostname,
      domain: new URL(url).hostname
    })
  }
})
