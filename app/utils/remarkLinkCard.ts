import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Root } from 'mdast'

interface Metadata {
  title: string
  description?: string
  image?: string
  favicon?: string
  domain: string
}

async function fetchMetadata(url: string): Promise<Metadata | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: controller.signal
    })
    clearTimeout(timeout)

    if (!response.ok) return null

    const html = await response.text()
    const baseUrl = new URL(url)

    const resolveUrl = (urlStr: string): string => {
      if (/^https?:\/\//.test(urlStr)) return urlStr
      if (urlStr.startsWith('/')) return baseUrl.origin + urlStr
      return baseUrl.origin + '/' + urlStr
    }

    const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1]
    const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1]
    const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1]
    const favicon = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i)?.[1]
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]

    return {
      title: ogTitle || title || baseUrl.hostname,
      description: ogDesc || undefined,
      image: ogImage ? resolveUrl(ogImage) : undefined,
      favicon: favicon ? resolveUrl(favicon) : `${baseUrl.origin}/favicon.ico`,
      domain: baseUrl.hostname
    }
  } catch {
    return null
  }
}

export const remarkLinkCard: Plugin<[], Root> = () => {
  return async (tree) => {
    const nodesToConvert: Array<{ parent: any; index: number; url: string }> = []

    visit(tree, 'paragraph', (node: any, index, parent) => {
      if (!parent || index === undefined) return
      if (node.children.length !== 1) return

      const child = node.children[0]
      const urlRegex = /^https?:\/\/[^\s<>"']+$/
      let urlToConvert: string | undefined

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
        nodesToConvert.push({ parent, index, url: urlToConvert })
      }
    })

    const results = await Promise.allSettled(
      nodesToConvert.map(async ({ url }) => ({
        url,
        metadata: await fetchMetadata(url)
      }))
    )

    for (let i = 0; i < nodesToConvert.length; i++) {
      const { parent, index, url } = nodesToConvert[i]
      const result = results[i]
      const metadata = result.status === 'fulfilled' ? result.value.metadata : null

      const attrs: any[] = [
        { type: 'mdxJsxAttribute', name: 'url', value: url }
      ]

      if (metadata) {
        attrs.push({ type: 'mdxJsxAttribute', name: 'title', value: metadata.title })
        if (metadata.description) {
          attrs.push({ type: 'mdxJsxAttribute', name: 'description', value: metadata.description })
        }
        if (metadata.image) {
          attrs.push({ type: 'mdxJsxAttribute', name: 'image', value: metadata.image })
        }
        if (metadata.favicon) {
          attrs.push({ type: 'mdxJsxAttribute', name: 'favicon', value: metadata.favicon })
        }
        attrs.push({ type: 'mdxJsxAttribute', name: 'domain', value: metadata.domain })
      }

      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'LinkCard',
        attributes: attrs,
        children: []
      }
    }
  }
}
