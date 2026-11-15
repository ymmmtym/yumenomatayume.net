import { createRoute } from 'honox/factory'
import { getBlogPosts } from '../../../utils/blog'
import { formatDate, getUpdateStatus } from '../../../lib/dateUtils'

export default createRoute(async (c) => {
  const tag = c.req.param('tag')
  if (!tag) return c.notFound()
  
  const posts = getBlogPosts()
    .map(({ slug, module }) => {
      const { title = '', description = '', pubDate = '', updatedDate, tags = [], heroImage = '' } = module.frontmatter ?? {}
      return { slug, title, description, pubDate, updatedDate, tags, heroImage }
    })
    .filter(post => post.tags.includes(tag))
    .sort((a, b) => 
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    )

  if (posts.length === 0) return c.notFound()

  return c.render(
    <main class="mx-auto max-w-6xl px-4 py-10">
      <div class="mb-8">
        <a href="/blog" class="text-sm font-medium text-brand-600 no-underline transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200">← Blog</a>
        <h1 class="mt-4 text-4xl font-extrabold tracking-tight">Tag: {tag}</h1>
        <p class="mt-2 text-lg text-gray-500 dark:text-gray-400">{posts.length}件の記事</p>
      </div>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(post => (
          <article class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/60 dark:hover:border-brand-500/50">
            <a href={`/blog/${post.slug}`} class="block">
              {post.heroImage && (
                <img 
                  src={post.heroImage} 
                  alt={post.title}
                  class="w-full h-48 object-cover"
                />
              )}
              <div class="p-6">
                <h2 class="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{post.title}</h2>
                <p class="text-gray-600 dark:text-gray-400 mb-3 text-sm line-clamp-3">{post.description}</p>
                <div class="text-xs text-gray-500 dark:text-gray-500">
                  <time>{formatDate(post.pubDate)}</time>
                  {(() => {
                    const { showUpdated, isRecent } = getUpdateStatus(post.pubDate, post.updatedDate)
                    if (!showUpdated) return null
                    return (
                      <>
                        <span class="mx-1">(更新: <time>{formatDate(post.updatedDate ?? '')}</time>)</span>
                        {isRecent && (
                          <span class="ml-1 inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                            最近更新
                          </span>
                        )}
                      </>
                    )
                  })()}
                </div>
                {post.tags && (
                  <div class="flex gap-1 flex-wrap mt-3">
                    {post.tags.slice(0, 3).map((t: string) => (
                      <span class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </a>
          </article>
        ))}
      </div>
    </main>,
    { title: `Tag: ${tag}`, description: `${tag}タグの記事一覧` }
  )
})
