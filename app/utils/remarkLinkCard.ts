import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Root } from 'mdast'

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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const html = await response.text()
    const title = extractMeta(html, ['og:title', 'twitter:title', 'title']) || domain
    const description = extractMeta(html, ['og:description', 'twitter:description', 'description'])
    const image = extractMeta(html, ['og:image', 'twitter:image'])
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
    return { url, title: domain, domain }
  }
}

function extractMeta(html: string, props: string[]): string | undefined {
  for (const prop of props) {
    const match = html.match(new RegExp(`<meta[^>]*(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*?)["']`, 'i'))
    if (match?.[1]) return match[1].trim()
    if (prop === 'title') {
      const t = html.match(/<title[^>]*>([^<]*)<\/title>/i)
      if (t?.[1]) return t[1].trim()
    }
  }
  return undefined
}

function extractFavicon(html: string, baseUrl: string): string | undefined {
  const match = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']*?)["']/i)
  return match?.[1] || `${new URL(baseUrl).origin}/favicon.ico`
}

function resolveUrl(url: string, base: string): string {
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/')) return `${new URL(base).origin}${url}`
  if (!url.startsWith('http')) return `${new URL(base).origin}/${url}`
  return url
}

// MDXでリンクカードを自動変換するプラグイン（remarkGfmより前に実行）
export const remarkLinkCard: Plugin<[], Root> = () => {
  return async (tree) => {
    const promises: Promise<void>[] = []

    visit(tree, 'paragraph', (node, index, parent) => {
      if (!parent || index === undefined) return

      if (node.children.length === 1) {
        const child = node.children[0]
        let urlToConvert: string | undefined

        const urlRegex = /^https?:\/\/[^\s<>"']+$/

        if (child.type === 'text') {
          const text = child.value.trim()
          if (urlRegex.test(text)) urlToConvert = text
        } else if (child.type === 'link') {
          if (child.children.length === 1 && child.children[0].type === 'text') {
            if (child.url.trim() === child.children[0].value.trim() && urlRegex.test(child.url.trim())) {
              urlToConvert = child.url.trim()
            }
          } else if (child.children.length === 0) {
            const url = child.url.trim()
            if (urlRegex.test(url)) urlToConvert = url
          }
        }

        if (urlToConvert) {
          const promise = fetchLinkMetadata(urlToConvert).then(metadata => {
            const attrs = [
              { type: 'mdxJsxAttribute' as const, name: 'url', value: metadata.url },
              metadata.title ? { type: 'mdxJsxAttribute' as const, name: 'title', value: metadata.title } : null,
              metadata.description ? { type: 'mdxJsxAttribute' as const, name: 'description', value: metadata.description } : null,
              metadata.image ? { type: 'mdxJsxAttribute' as const, name: 'image', value: metadata.image } : null,
              metadata.favicon ? { type: 'mdxJsxAttribute' as const, name: 'favicon', value: metadata.favicon } : null,
              { type: 'mdxJsxAttribute' as const, name: 'domain', value: metadata.domain }
            ].filter(Boolean)

            parent.children[index] = {
              type: 'mdxJsxFlowElement',
              name: 'LinkCard',
              attributes: attrs,
              children: []
            }
          })
          promises.push(promise)
        }
      }
    })

    await Promise.all(promises)
  }
}
