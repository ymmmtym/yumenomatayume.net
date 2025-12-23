interface LinkMetadata {
  url: string
  title?: string
  description?: string
  image?: string
  favicon?: string
  domain?: string
}

// URLからメタデータを取得する関数（ビルド時用）
export async function fetchLinkMetadata(url: string): Promise<LinkMetadata> {
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
    const domain = new URL(url).hostname
    
    // 基本的なメタデータを抽出
    const title = extractMetaContent(html, ['og:title', 'twitter:title', 'title'])
    const description = extractMetaContent(html, ['og:description', 'twitter:description', 'description'])
    const image = extractMetaContent(html, ['og:image', 'twitter:image'])
    const favicon = extractFavicon(html, url)
    
    return {
      url,
      title: title || domain,
      description,
      image,
      favicon,
      domain
    }
  } catch (error) {
    console.warn(`Failed to fetch metadata for ${url}:`, error)
    return {
      url,
      title: new URL(url).hostname,
      domain: new URL(url).hostname
    }
  }
}

function extractMetaContent(html: string, properties: string[]): string | undefined {
  for (const prop of properties) {
    // og:title, twitter:title などのメタタグを検索
    const metaRegex = new RegExp(`<meta[^>]*(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*?)["']`, 'i')
    const match = html.match(metaRegex)
    if (match && match[1]) {
      return match[1].trim()
    }
    
    // titleタグの場合
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
  // link rel="icon" を検索
  const faviconRegex = /<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']*?)["']/i
  const match = html.match(faviconRegex)
  
  if (match && match[1]) {
    const href = match[1]
    // 相対URLの場合は絶対URLに変換
    if (href.startsWith('//')) {
      return `https:${href}`
    } else if (href.startsWith('/')) {
      return `${new URL(baseUrl).origin}${href}`
    } else if (!href.startsWith('http')) {
      return `${new URL(baseUrl).origin}/${href}`
    }
    return href
  }
  
  // デフォルトのfavicon.icoを試す
  return `${new URL(baseUrl).origin}/favicon.ico`
}

// URLパターンを検出する正規表現
export const URL_REGEX = /https?:\/\/[^\s<>"']+/g

// テキスト内のURLを検出してリンクカードに変換
export function processUrls(content: string): string {
  return content.replace(URL_REGEX, (url) => {
    // 既にリンクタグ内にある場合はスキップ
    const beforeUrl = content.substring(0, content.indexOf(url))
    if (beforeUrl.match(/<a[^>]*$/)) {
      return url
    }
    
    // リンクカードコンポーネントに置換
    return `<LinkCard url="${url}" />`
  })
}
