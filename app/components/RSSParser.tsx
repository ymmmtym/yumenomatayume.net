import { DOMParser, type Element } from '@xmldom/xmldom'

export interface RSSItem {
  title: string
  link: string
  pubDate: string
}

const ATOM_NAMESPACE = 'http://www.w3.org/2005/Atom'

function collection(parent: Element, name: string, atom = false): Element[] {
  return Array.from(parent.getElementsByTagName('*')).filter(element =>
    element.tagName === name ||
    (atom && element.localName === name && element.namespaceURI === ATOM_NAMESPACE)
  )
}

function elements(parent: Element, name: string, atom = false): Element[] {
  return collection(parent, name, atom).filter(element => element.parentNode === parent)
}

function value(parent: Element, name: string, atom = false): string {
  return elements(parent, name, atom)[0]?.textContent?.trim() ?? ''
}

/**
 * RSS/Atomフィードをパースしてアイテムのリストを返す
 */
export async function parseRSS(xml: string): Promise<RSSItem[]> {
  const document = new DOMParser({
    onError: () => { throw new Error('Invalid XML format') },
  }).parseFromString(xml.trim(), 'application/xml')
  const root = document.documentElement
  if (!root || !(
    /^(rss|feed|rdf:RDF)$/i.test(root.tagName) ||
    (root.localName === 'feed' && root.namespaceURI === ATOM_NAMESPACE)
  )) {
    throw new Error('Invalid XML format: missing RSS or Atom root tag')
  }

  const items: RSSItem[] = []
  for (const item of collection(root, 'item')) {
    const title = value(item, 'title')
    const guid = value(item, 'guid')
    const link = value(item, 'link') || (/^https?:\/\//.test(guid) ? guid : '')
    const pubDate = value(item, 'pubDate') || value(item, 'dc:date') || value(item, 'date')
    if (title && link) items.push({ title, link, pubDate })
  }

  if (items.length === 0) {
    for (const entry of collection(root, 'entry', true)) {
      const title = value(entry, 'title', true)
      const linkElement = elements(entry, 'link', true).find(element => {
        const rel = element.getAttribute('rel')?.trim()
        const type = element.getAttribute('type')?.split(';')[0].trim().toLowerCase()
        return (!rel || rel === 'alternate') &&
          (!type || type === 'text/html' || type === 'application/xhtml+xml') &&
          !!element.getAttribute('href')?.trim()
      })
      const link = linkElement?.getAttribute('href')?.trim() || value(entry, 'link', true)
      const pubDate = value(entry, 'published', true) || value(entry, 'updated', true)
      if (title && link) items.push({ title, link, pubDate })
    }
  }
  return items
}
