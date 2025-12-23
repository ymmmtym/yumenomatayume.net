import { createRoute } from 'honox/factory'
import { TableOfContents } from '../../components/TableOfContents'
import { calculateReadingTime } from '../../utils/readingTime'

const modules = import.meta.glob('../../content/blog/*.md', { eager: true })

export default createRoute(async (c) => {
  const slug = c.req.param('slug')
  const modulePath = `../../content/blog/${slug}.md`
  const module = modules[modulePath] as any
  
  if (!module) return c.notFound()
  
  const { frontmatter, default: Content } = module
  const readingTime = calculateReadingTime(typeof module.default === 'string' ? module.default : '')
  
  const allPosts = Object.entries(modules)
    .map(([path, mod]: [string, any]) => {
      const postSlug = path.split('/').pop()?.replace('.md', '')
      return { slug: postSlug, ...mod.frontmatter }
    })
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
  
  const currentIndex = allPosts.findIndex(post => post.slug === slug)
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
  
  const relatedPosts = allPosts
    .filter(post => 
      post.slug !== slug && 
      post.tags?.some((tag: string) => frontmatter.tags?.includes(tag))
    )
    .slice(0, 3)
  
  const hashtags = frontmatter.tags ? frontmatter.tags.map((tag: string) => `#${tag}`).join(' ') : ''
  const tweetText = `${frontmatter.title} ${hashtags}`
  
  return c.render(
    <>
      <TableOfContents />
      <script dangerouslySetInnerHTML={{__html: `
        document.addEventListener('keydown', (e) => {
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
          if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
          if (e.key === 'h') {
            if (${prevPost ? `'${prevPost.slug}'` : 'null'}) {
              window.location.href = '/blog/${prevPost?.slug}';
            } else {
              window.history.back();
            }
          } else if (e.key === 'l') {
            if (${nextPost ? `'${nextPost.slug}'` : 'null'}) {
              window.location.href = '/blog/${nextPost?.slug}';
            } else {
              window.history.forward();
            }
          }
        });
      `}} />
      <div class="fixed top-20 right-2 md:top-24 md:right-4 z-50 flex flex-col gap-2">
        <button onclick={`navigator.clipboard.writeText('https://yumenomatayume.net/blog/${slug}'); const t=document.createElement('div'); t.textContent='Copied!'; t.style.cssText='position:absolute;top:-35px;right:0;background:#10b981;color:white;padding:6px 12px;border-radius:6px;font-size:14px;white-space:nowrap;'; this.appendChild(t); setTimeout(() => t.remove(), 2000)`} class="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 bg-white dark:bg-purple-900/40 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all cursor-pointer relative" title="URLをコピー">
          <span class="text-base md:text-xl">🔗</span>
        </button>
        <a href={`https://twitter.com/intent/tweet?url=https://yumenomatayume.net/blog/${slug}&text=${encodeURIComponent(tweetText)}`} target="_blank" rel="noopener noreferrer" class="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 bg-white dark:bg-purple-900/40 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all" title="Xでシェア">
          <span class="text-base md:text-xl">𝕏</span>
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=https://yumenomatayume.net/blog/${slug}`} target="_blank" rel="noopener noreferrer" class="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 bg-white dark:bg-purple-900/40 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all" title="Facebookでシェア">
          <span class="text-base md:text-xl">📘</span>
        </a>
        <a href={`https://b.hatena.ne.jp/entry/https://yumenomatayume.net/blog/${slug}`} target="_blank" rel="noopener noreferrer" class="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 bg-white dark:bg-purple-900/40 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all" title="はてブに追加">
          <span class="text-base md:text-xl">📖</span>
        </a>
        <a href={`https://raindrop.io/add?link=https://yumenomatayume.net/blog/${slug}&title=${encodeURIComponent(frontmatter.title)}`} target="_blank" rel="noopener noreferrer" class="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 bg-white dark:bg-purple-900/40 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all" title="Raindropに保存">
          <span class="text-base md:text-xl">☁️</span>
        </a>
      </div>
      <main class="max-w-3xl mx-auto py-8 px-4">
      <article>
        {frontmatter.heroImage && (
          <div class="mb-8">
            <img 
              src={frontmatter.heroImage} 
              alt={frontmatter.title}
              class="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}
        <header class="mb-8">
          <h1 class="text-4xl font-bold mb-4">{frontmatter.title}</h1>
          <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
            <time>{frontmatter.pubDate}</time>
            <span class="flex items-center gap-1">
              📖 {readingTime}で読めます
            </span>
          </div>
          {frontmatter.tags && (
            <div class="flex gap-2 flex-wrap">
              {frontmatter.tags.map((tag: string) => (
                <a href={`/blog/tag/${tag}`} class="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">{tag}</a>
              ))}
            </div>
          )}
        </header>
        <div class="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
          <Content />
        </div>
      </article>

      {(prevPost || nextPost) && (
        <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div class="flex justify-between gap-4">
            {prevPost ? (
              <a href={`/blog/${prevPost.slug}`} class="flex-1 p-4 bg-gray-50 dark:bg-purple-900/20 rounded-lg hover:bg-gray-100 dark:hover:bg-purple-900/30 transition-colors">
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">← 前の記事</div>
                <div class="font-bold text-gray-900 dark:text-gray-100">{prevPost.title}</div>
              </a>
            ) : <div class="flex-1"></div>}
            {nextPost ? (
              <a href={`/blog/${nextPost.slug}`} class="flex-1 p-4 bg-gray-50 dark:bg-purple-900/20 rounded-lg hover:bg-gray-100 dark:hover:bg-purple-900/30 transition-colors text-right">
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">次の記事 →</div>
                <div class="font-bold text-gray-900 dark:text-gray-100">{nextPost.title}</div>
              </a>
            ) : <div class="flex-1"></div>}
          </div>
        </div>
      )}

      {relatedPosts.length > 0 && (
        <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-bold mb-6">関連記事</h2>
          <div class="grid grid-cols-1 gap-4">
            {relatedPosts.map(post => (
              <a href={`/blog/${post.slug}`} class="block p-4 bg-gray-50 dark:bg-purple-900/20 rounded-lg hover:bg-gray-100 dark:hover:bg-purple-900/30 transition-colors">
                <p class="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">{post.title}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{post.description}</p>
                <time class="text-xs text-gray-500 dark:text-gray-500 mt-2 block">{post.pubDate}</time>
              </a>
            ))}
          </div>
        </div>
      )}
    </main>
    </>,
    { title: frontmatter.title, description: frontmatter.description, heroImage: frontmatter.heroImage }
  )
})
