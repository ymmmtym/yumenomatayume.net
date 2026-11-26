import { createRoute } from 'honox/factory'
import { getBlogPosts } from '../../utils/blog'
import { formatDate, getUpdateStatus } from '../../lib/dateUtils'

export default createRoute(async (c) => {
  const posts = getBlogPosts().map(({ slug, module }) => {
    const { title = '', description = '', pubDate = '', updatedDate, tags = [], heroImage = '', readingTime } = module.frontmatter ?? {}
    return { slug, title, description, pubDate, updatedDate, tags, heroImage, readingTime }
  }).sort((a, b) => 
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  )

  const allTags = [...new Set(posts.flatMap(post => post.tags || []))].sort()

  return c.render(
    <main id="main" class="mx-auto max-w-6xl px-4 py-10">
      <div class="mb-8">
        <h1 class="text-4xl font-extrabold tracking-tight">Blog</h1>
        <p class="mt-2 text-lg text-gray-500 dark:text-gray-400">{posts.length}件の記事</p>
      </div>
      
      <details class="mb-10 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
        <summary class="cursor-pointer text-sm font-semibold text-gray-700 transition-colors hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-300">タグ一覧を表示 ({allTags.length}個)</summary>
        <div class="mt-3 flex flex-wrap gap-2">
          {allTags.map(tag => (
            <a href={`/blog/tag/${tag}`} class="rounded-full bg-white px-3 py-1 text-sm text-gray-800 shadow-sm transition-colors hover:bg-brand-50 hover:text-brand-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-brand-500/15 dark:hover:text-brand-300">{tag}</a>
          ))}
        </div>
      </details>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(post => (
          <article class="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/60 dark:hover:border-brand-500/50">
            <a href={`/blog/${post.slug}`} class="absolute inset-0 z-0"></a>
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
            </div>
            <div class="px-6 pb-6">
              <div class="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-2 mb-2">
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
                {post.readingTime != null && (
                  <span class="text-xs text-gray-500 dark:text-gray-500">
                    📖 {post.readingTime >= 1 ? `約${post.readingTime}分で読めます` : '1分未満で読めます'}
                  </span>
                )}
              </div>
              {post.tags && (
                <div class="flex gap-1 flex-wrap mt-3">
                  {post.tags.slice(0, 3).map((tag: string) => (
                    <a href={`/blog/tag/${tag}`} class="relative z-10 rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 transition-colors hover:bg-brand-100 hover:text-brand-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-brand-500/15 dark:hover:text-brand-300">{tag}</a>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>,
    { title: 'Blog', description: 'SREやインフラエンジニア向けの技術記事から、趣味や日々の気付きまで' }
  )
})
