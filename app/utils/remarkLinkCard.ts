import { visit } from 'unist-util-visit'
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import type { Plugin } from 'unified'
import type { Paragraph, Root } from 'mdast'
import type { Parent } from 'unist'

interface Metadata {
  title: string
  description?: string
  image?: string
  favicon?: string
  domain: string
}

const MAX_HTML_BYTES = 1_000_000

function findCommentEnd(html: string, start: number): number {
  const end = html.indexOf('-->', start + 4)
  return end === -1 ? -1 : end + 3
}

function readTagName(html: string, lowerHtml: string, opening: number) {
  const start = opening + 1
  if (['/', '!', '?'].includes(html[start])) return undefined

  let end = start
  while (end < html.length && !/[\s/>]/.test(html[end])) end++
  return end === start ? undefined : { name: lowerHtml.slice(start, end), end }
}

function findTagEnd(html: string, start: number): number {
  let quote = ''

  for (let index = start; index < html.length; index++) {
    const character = html[index]
    if (quote) {
      if (character === quote) quote = ''
    } else if (character === '"' || character === "'") {
      quote = character
    } else if (character === '>') {
      return index
    }
  }

  return -1
}

function findRawTextEnd(html: string, tagName: string, start: number): number {
  const closingStart = html.toLowerCase().indexOf(`</${tagName}`, start)
  if (closingStart === -1) return -1
  const closingEnd = html.indexOf('>', closingStart)
  return closingEnd === -1 ? -1 : closingEnd + 1
}

function findOpeningTags(html: string, targetName: string): string[] {
  const tags: string[] = []
  const lowerHtml = html.toLowerCase()
  const target = targetName.toLowerCase()
  let position = 0

  while (position < html.length) {
    const opening = html.indexOf('<', position)
    if (opening === -1) break

    if (html.startsWith('<!--', opening)) {
      const commentEnd = findCommentEnd(html, opening)
      if (commentEnd === -1) break
      position = commentEnd
      continue
    }

    const tag = readTagName(html, lowerHtml, opening)
    if (!tag) {
      position = opening + 2
      continue
    }

    const tagEnd = findTagEnd(html, tag.end)
    if (tagEnd === -1) break

    if (tag.name === target) tags.push(html.slice(opening, tagEnd + 1))

    if (tag.name === 'script' || tag.name === 'style') {
      position = findRawTextEnd(html, tag.name, tagEnd + 1)
      if (position === -1) break
    } else {
      position = tagEnd + 1
    }
  }

  return tags
}

function skipWhitespace(value: string, index: number): number {
  while (index < value.length && /\s/.test(value[index])) index++
  return index
}

function findAttributeEnd(tag: string, start: number): number {
  let end = start
  while (end < tag.length && !/[\s=/>]/.test(tag[end])) end++
  return end
}

function readAttributeValue(tag: string, start: number): { value: string; end: number } {
  if (tag[start] !== '=') return { value: '', end: start }

  let valueStart = skipWhitespace(tag, start + 1)
  const quote = tag[valueStart] === '"' || tag[valueStart] === "'" ? tag[valueStart++] : ''
  let valueEnd = valueStart

  if (quote) {
    while (valueEnd < tag.length && tag[valueEnd] !== quote) valueEnd++
  } else {
    while (valueEnd < tag.length && !/[\s>]/.test(tag[valueEnd])) valueEnd++
  }

  const end = quote && tag[valueEnd] === quote ? valueEnd + 1 : valueEnd
  return { value: tag.slice(valueStart, valueEnd), end }
}

function parseAttributes(tag: string): Map<string, string> {
  const attributes = new Map<string, string>()
  let index = findAttributeEnd(tag, 1)

  while (index < tag.length) {
    index = skipWhitespace(tag, index)
    if (index >= tag.length || tag[index] === '>') break

    const nameEnd = findAttributeEnd(tag, index)
    if (nameEnd === index) {
      index++
      continue
    }

    const name = tag.slice(index, nameEnd).toLowerCase()
    const parsedValue = readAttributeValue(tag, nameEnd)
    if (!attributes.has(name)) attributes.set(name, parsedValue.value)
    index = parsedValue.end
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

function getMetaContent(metaTags: Map<string, string>[], names: string[]): string | undefined {
  for (const name of names) {
    const match = metaTags.find((attributes) =>
      attributes.get('property')?.toLowerCase() === name ||
      attributes.get('name')?.toLowerCase() === name
    )
    const content = match?.get('content')?.trim()
    if (content) return content
  }
}

function getDocumentTitle(head: string): string | undefined {
  const titleTag = findOpeningTags(head, 'title')[0]
  if (!titleTag) return undefined

  const titleStart = head.indexOf(titleTag) + titleTag.length
  const titleEnd = head.toLowerCase().indexOf('</title>', titleStart)
  if (titleEnd === -1) return undefined

  const title = head.slice(titleStart, titleEnd).replace(/<[^>]*>/g, '').trim()
  return title.length > 0 ? title : undefined
}

function getFavicon(linkTags: Map<string, string>[]): string | undefined {
  return linkTags.find((attributes) =>
    attributes.get('rel')?.toLowerCase().split(/\s+/).some((value) =>
      value === 'icon' || value === 'apple-touch-icon'
    )
  )?.get('href')
}

function extractMetadata(html: string, url: string): Metadata {
  const headEnd = html.toLowerCase().indexOf('</head>')
  const head = headEnd === -1 ? html : html.slice(0, headEnd)
  const baseUrl = new URL(url)
  const metaTags = findOpeningTags(head, 'meta').map(parseAttributes)
  const linkTags = findOpeningTags(head, 'link').map(parseAttributes)
  const title = getMetaContent(metaTags, ['og:title', 'twitter:title']) ??
    getDocumentTitle(head) ??
    baseUrl.hostname
  const description = getMetaContent(metaTags, ['og:description', 'twitter:description', 'description'])
  const image = getMetaContent(metaTags, ['og:image', 'twitter:image'])
  const favicon = getFavicon(linkTags)
  const resolveUrl = (value: string): string => new URL(value, baseUrl).href

  return {
    title,
    description,
    image: image ? resolveUrl(image) : undefined,
    favicon: favicon ? resolveUrl(favicon) : `${baseUrl.origin}/favicon.ico`,
    domain: baseUrl.hostname
  }
}

async function fetchMetadata(url: string): Promise<Metadata | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, 5000)

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
    const finalUrl = response.url.trim().length > 0 ? response.url : url
    return extractMetadata(html, finalUrl)
  } catch (error) {
    console.warn(`Failed to fetch link metadata for ${url}:`, error)
    return null
  } finally {
    clearTimeout(timeout)
  }
}

function getLinkCardUrl(node: Paragraph): string | undefined {
  if (node.children.length !== 1) return undefined

  const child = node.children[0]
  if (child.type === 'text') {
    const url = child.value.trim()
    return /^https?:\/\/[^\s<>"']+$/.test(url) ? url : undefined
  }
  if (child.type !== 'link') return undefined

  const url = child.url.trim()
  if (!/^https?:\/\/[^\s<>"']+$/.test(url)) return undefined
  if (child.children.length === 0) return url

  const label = child.children.length === 1 && child.children[0].type === 'text'
    ? child.children[0].value.trim()
    : undefined
  return label === url ? url : undefined
}

function createAttribute(name: string, value: string): MdxJsxAttribute {
  return { type: 'mdxJsxAttribute', name, value }
}

function createLinkCardNode(url: string, metadata: Metadata | null): MdxJsxFlowElement {
  const attributes = [createAttribute('url', url)]

  if (metadata) {
    attributes.push(createAttribute('title', metadata.title))
    if (metadata.description) attributes.push(createAttribute('description', metadata.description))
    if (metadata.image) attributes.push(createAttribute('image', metadata.image))
    if (metadata.favicon) attributes.push(createAttribute('favicon', metadata.favicon))
    attributes.push(createAttribute('domain', metadata.domain))
  }

  return {
    type: 'mdxJsxFlowElement',
    name: 'LinkCard',
    attributes,
    children: []
  }
}

export const remarkLinkCard: Plugin<[], Root> = () => {
  return async (tree) => {
    const nodesToConvert: { parent: Parent; index: number; url: string }[] = []

    visit(tree, 'paragraph', (node, index, parent) => {
      const url = getLinkCardUrl(node)
      if (parent && index !== undefined && url) {
        nodesToConvert.push({ parent, index, url })
      }
    })

    const results = await Promise.all(nodesToConvert.map(async (candidate) => ({
      candidate,
      metadata: await fetchMetadata(candidate.url)
    })))

    for (const { candidate, metadata } of results) {
      candidate.parent.children.splice(
        candidate.index,
        1,
        createLinkCardNode(candidate.url, metadata)
      )
    }
  }
}
