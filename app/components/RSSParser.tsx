export interface RSSItem {
  title: string
  link: string
  pubDate: string
}

/**
 * RSS/Atomフィードをパースしてアイテムのリストを返す
 */
export async function parseRSS(xml: string): Promise<RSSItem[]> {
  const items: RSSItem[] = []
  
  // Try <item> tags (RSS 2.0)
  let itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g
  let match
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1]
    
    // より柔軟なタイトル抽出
    const titleMatch = item.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ||
                      item.match(/<title[^>]*>([\s\S]*?)<\/title>/)
    const title = titleMatch ? titleMatch[1].trim() : ''
    
    // より柔軟なリンク抽出
    const linkMatch = item.match(/<link[^>]*>([\s\S]*?)<\/link>/) ||
                     item.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/)
    const link = linkMatch ? linkMatch[1].trim() : ''
    
    // より柔軟な日付抽出
    const dateMatch = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/) ||
                     item.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/) ||
                     item.match(/<date[^>]*>([\s\S]*?)<\/date>/)
    const pubDate = dateMatch ? dateMatch[1].trim() : ''
    
    if (title && link) {
      items.push({ title, link, pubDate })
    }
  }
  
  // Try <entry> tags (Atom) if no RSS items found
  if (items.length === 0) {
    itemRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/g
    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1]
      
      const titleMatch = item.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ||
                        item.match(/<title[^>]*>([\s\S]*?)<\/title>/)
      const title = titleMatch ? titleMatch[1].trim() : ''
      
      const linkMatch = item.match(/<link[^>]*href=["']([^"']*)["'][^>]*>/) || 
                       item.match(/<link[^>]*>([\s\S]*?)<\/link>/)
      const link = linkMatch ? linkMatch[1].trim() : ''
      
      const dateMatch = item.match(/<published[^>]*>([\s\S]*?)<\/published>/) || 
                       item.match(/<updated[^>]*>([\s\S]*?)<\/updated>/)
      const pubDate = dateMatch ? dateMatch[1].trim() : ''
      
      if (title && link) {
        items.push({ title, link, pubDate })
      }
    }
  }
  
  return items
}
