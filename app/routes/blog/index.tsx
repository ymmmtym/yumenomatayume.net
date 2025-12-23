import { createRoute } from 'honox/factory'

const modules = import.meta.glob('../../content/blog/*.md', { eager: true })

export default createRoute(async (c) => {
  const posts = Object.entries(modules).map(([path, module]: [string, any]) => {
    const slug = path.split('/').pop()?.replace('.md', '')
    return { slug, ...module.frontmatter }
  }).sort((a, b) => 
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  )

  const allTags = [...new Set(posts.flatMap(post => post.tags || []))].sort()

  return c.render(
    <main class="max-w-6xl mx-auto py-8 px-4">
      <div class="mb-4">
        <h1 class="text-4xl font-bold">Blog</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">{posts.length}件の記事</p>
      </div>
      
      <details class="mb-8 p-4 bg-gray-50 dark:bg-purple-900/20 rounded-lg">
        <summary class="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors">タグ一覧を表示 ({allTags.length}個)</summary>
        <div class="flex gap-2 flex-wrap mt-3">
          {allTags.map(tag => (
            <a href={`/blog/tag/${tag}`} class="px-3 py-1 bg-white dark:bg-purple-900/30 rounded-full text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-purple-900/40 transition-colors shadow-sm">{tag}</a>
          ))}
        </div>
      </details>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <article class="bg-white dark:bg-purple-900/20 rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 overflow-hidden relative">
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
              <time class="text-xs text-gray-500 dark:text-gray-500">{post.pubDate}</time>
              {post.tags && (
                <div class="flex gap-1 flex-wrap mt-3">
                  {post.tags.slice(0, 3).map((tag: string) => (
                    <a href={`/blog/tag/${tag}`} class="relative z-10 px-2 py-1 bg-gray-100 dark:bg-purple-900/30 rounded text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-purple-900/40 transition-colors">{tag}</a>
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
