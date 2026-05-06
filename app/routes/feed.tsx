import { createRoute } from 'honox/factory'
import { getLocalPosts } from '../utils/local-posts'

export default createRoute(async (c) => {
  const posts = getLocalPosts().slice(0, 20)

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
      <pubDate>${new Date(post.pubDate).toUTCString()}</pubDate>
    </item>`).join('')}
  </channel>
</rss>`

  return c.text(rss, 200, {
    'Content-Type': 'application/rss+xml; charset=utf-8'
  })
})
