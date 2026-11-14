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

const MAX_HTML_BYTES = 1_000_000

function findOpeningTags(html: string, targetName: string): string[] {
  const tags: string[] = []
  const lowerHtml = html.toLowerCase()
  const target = targetName.toLowerCase()
  let position = 0

  while (position < html.length) {
    const opening = html.indexOf('<', position)
    if (opening === -1) break

    if (html.startsWith('<!--', opening)) {
      const commentEnd = html.indexOf('-->', opening + 4)
      if (commentEnd === -1) break
      position = commentEnd + 3
      continue
    }

    let nameStart = opening + 1
    if (html[nameStart] === '/' || html[nameStart] === '!' || html[nameStart] === '?') {
      position = nameStart + 1
      continue
    }

    let nameEnd = nameStart
    while (nameEnd < html.length && !/[\s/>]/.test(html[nameEnd])) {
      nameEnd++
    }
    if (nameEnd === nameStart) {
      position = nameStart + 1
      continue
    }

    const name = lowerHtml.slice(nameStart, nameEnd)
    let quote = ''
    let tagEnd = -1
    for (let index = nameEnd; index < html.length; index++) {
      const character = html[index]
      if (quote) {
        if (character === quote) quote = ''
      } else if (character === '"' || character === "'") {
        quote = character
      } else if (character === '>') {
        tagEnd = index
        break
      }
    }
    if (tagEnd === -1) break

    if (name === target) tags.push(html.slice(opening, tagEnd + 1))

    if (name === 'script' || name === 'style') {
      const closingStart = lowerHtml.indexOf(`</${name}`, tagEnd + 1)
      if (closingStart === -1) break
      const closingEnd = html.indexOf('>', closingStart)
      if (closingEnd === -1) break
      position = closingEnd + 1
    } else {
      position = tagEnd + 1
    }
  }

  return tags
}

function parseAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {}
  let index = 1

  while (index < tag.length && !/[\s/>]/.test(tag[index])) index++

  while (index < tag.length) {
    while (index < tag.length && /[\s/]/.test(tag[index])) index++
    if (index >= tag.length || tag[index] === '>') break

    const nameStart = index
    while (index < tag.length && !/[\s=/>]/.test(tag[index])) index++
    if (index === nameStart) {
      index++
      continue
    }

    const name = tag.slice(nameStart, index).toLowerCase()
    while (index < tag.length && /\s/.test(tag[index])) index++

    let value = ''
    if (tag[index] === '=') {
      index++
      while (index < tag.length && /\s/.test(tag[index])) index++

      const quote = tag[index] === '"' || tag[index] === "'" ? tag[index++] : ''
      const valueStart = index
      if (quote) {
        while (index < tag.length && tag[index] !== quote) index++
      } else {
        while (index < tag.length && !/[\s>]/.test(tag[index])) index++
      }
      value = tag.slice(valueStart, index)
      if (quote) index++
    }

    if (!(name in attributes)) attributes[name] = value
  }

  return attributes
}

async function readHtml(response: Response): Promise<string> {
  const reader = response.body?.getReader()
  if (!reader) return ''

  const decoder = new TextDecoder()
  let html = ''
  let bytesRead = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const bytesToRead = Math.min(value.byteLength, MAX_HTML_BYTES - bytesRead)
      html += decoder.decode(value.subarray(0, bytesToRead), { stream: true })
      bytesRead += bytesToRead

      if (bytesToRead < value.byteLength || bytesRead >= MAX_HTML_BYTES) {
        await reader.cancel()
        break
      }
    }

    return html + decoder.decode()
  } finally {
    reader.releaseLock()
  }
}

async function fetchMetadata(url: string): Promise<Metadata | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: controller.signal
    })

    if (!response.ok) {
      await response.body?.cancel()
      return null
    }

    const html = await readHtml(response)
    const headEnd = html.toLowerCase().indexOf('</head>')
    const head = headEnd === -1 ? html : html.slice(0, headEnd)
    const baseUrl = new URL(response.url || url)
    const metaTags = findOpeningTags(head, 'meta').map(parseAttributes)
    const linkTags = findOpeningTags(head, 'link').map(parseAttributes)
    const getMeta = (names: string[]): string | undefined => {
      for (const name of names) {
        const match = metaTags.find((attributes) =>
          (attributes.property?.toLowerCase() === name ||
            attributes.name?.toLowerCase() === name) &&
          Boolean(attributes.content?.trim())
        )
        if (match?.content?.trim()) return match.content.trim()
      }
      return undefined
    }
    const titleTag = findOpeningTags(head, 'title')[0]
    const titleTagEnd = titleTag ? head.indexOf(titleTag) + titleTag.length : -1
    const titleEnd = titleTagEnd === -1 ? -1 : head.toLowerCase().indexOf('</title>', titleTagEnd)
    const documentTitle = titleEnd === -1
      ? undefined
      : head.slice(titleTagEnd, titleEnd).replace(/<[^>]*>/g, '').trim()
    const favicon = linkTags.find((attributes) =>
      attributes.rel?.toLowerCase().split(/\s+/).some((value) =>
        value === 'icon' || value === 'apple-touch-icon'
      )
    )?.href
    const resolveUrl = (value: string): string => new URL(value, baseUrl).href
    const title = getMeta(['og:title', 'twitter:title']) || documentTitle
    const description = getMeta(['og:description', 'twitter:description', 'description'])
    const image = getMeta(['og:image', 'twitter:image'])

    return {
      title: title || baseUrl.hostname,
      description,
      image: image ? resolveUrl(image) : undefined,
      favicon: favicon ? resolveUrl(favicon) : `${baseUrl.origin}/favicon.ico`,
      domain: baseUrl.hostname
    }
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
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
        type: 'mdxJsxFlowElement' as const,
        name: 'LinkCard',
        attributes: attrs,
        children: []
      }
    }
  }
}
