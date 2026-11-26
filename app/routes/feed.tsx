import { createRoute } from 'honox/factory'
import { getBlogPosts } from '../utils/blog'
import { resolvePostDate, resolvePubDate } from '../lib/dateUtils'

export default createRoute(async (c) => {
  const posts = getBlogPosts().flatMap(({ slug, module }) => {
    const { title = '', description = '', pubDate = '', updatedDate } = module.frontmatter ?? {}
    // An invalid date would make toISOString() throw and break the whole feed.
    const date = resolvePostDate(pubDate, updatedDate)
    // pubDate is the publication date; the resolved date is only a fallback.
    const published = resolvePubDate(pubDate, updatedDate)
    return date && published ? [{ slug, title, description, date, published }] : []
  }).sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 20)

  const baseUrl = 'https://yumenomatayume.net'
  const lastBuildDate = new Date().toUTCString()
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>yumenomatayume</title>
    <description>SRE / Infrastructure Engineer</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/feed" rel="self" type="application/rss+xml"/>
    <language>ja</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    ${posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description || ''}]]></description>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${post.published.toUTCString()}</pubDate>
      <atom:updated>${post.date.toISOString()}</atom:updated>
    </item>`).join('')}
  </channel>
</rss>`

  return c.text(rss, 200, {
    'Content-Type': 'application/rss+xml; charset=utf-8'
  })
})
