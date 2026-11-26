import { createRoute } from 'honox/factory'
import { getBlogPosts } from '../utils/blog'
import { PRIVACY_LAST_UPDATED } from '../utils/privacy'
import { resolvePostDate } from '../lib/dateUtils'

export default createRoute(async (c) => {
  const posts = getBlogPosts().map(({ slug, module }) => {
    const { pubDate = '', updatedDate } = module.frontmatter ?? {}
    return { slug, lastmod: resolvePostDate(pubDate, updatedDate) }
  })

  const baseUrl = 'https://yumenomatayume.net'
  // リクエスト時刻を使うと毎日更新に見えるため、最新記事の日付に固定する
  const latest = posts.reduce<Date | null>((acc, post) => {
    if (!post.lastmod) return acc
    return !acc || post.lastmod > acc ? post.lastmod : acc
  }, null)
  const latestLastmod = (latest ?? new Date(PRIVACY_LAST_UPDATED)).toISOString()
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${latestLastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${latestLastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${PRIVACY_LAST_UPDATED}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  ${posts.map(post => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    ${post.lastmod ? `<lastmod>${post.lastmod.toISOString()}</lastmod>` : ''}
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`

  return c.text(sitemap, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600'
  })
})
