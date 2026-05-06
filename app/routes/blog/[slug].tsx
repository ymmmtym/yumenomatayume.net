import { createRoute } from 'honox/factory'
import { TableOfContents } from '../../components/TableOfContents'
import { LinkCard } from '../../components/LinkCard'
import { formatDate, getUpdateStatus } from '../../lib/dateUtils'

const modules = import.meta.glob('../../content/blog/*.{md,mdx}', { eager: true })

export default createRoute(async (c) => {
  const slug = c.req.param('slug')
  const modulePath = `../../content/blog/${slug}.md`
  let module = modules[modulePath] as any
  
  // .mdxファイルも試す
  if (!module) {
    const mdxPath = `../../content/blog/${slug}.mdx`
    module = modules[mdxPath] as any
  }
  
  if (!module) return c.notFound()
  
  const { frontmatter, default: Content } = module
  
  const allPosts = Object.entries(modules)
    .map(([path, mod]: [string, any]) => {
      const postSlug = path.split('/').pop()?.replace(/\.(md|mdx)$/, '')
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
        
        // 見出しアンカーリンク機能を初期化
        document.addEventListener('DOMContentLoaded', () => {
          // h2, h3見出しを取得
          const headings = document.querySelectorAll('.prose h2, .prose h3');
          const usedIds = new Set();
          
          headings.forEach((heading) => {
            const text = heading.textContent || '';
            let id = text
              .toLowerCase()
              .replace(/[^\\w\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF\\s-]/g, '')
              .replace(/\\s+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
            
            // 重複IDの場合は連番を付与
            let counter = 1;
            let uniqueId = id;
            while (usedIds.has(uniqueId)) {
              uniqueId = id + '-' + counter;
              counter++;
            }
            usedIds.add(uniqueId);
            
            // IDを設定
            heading.id = uniqueId;
            
            // アンカーリンクボタンを追加
            const anchorLink = document.createElement('a');
            anchorLink.href = '#' + uniqueId;
            anchorLink.className = 'anchor-link';
            
            // 見出しレベルに応じて#の数を変更
            const level = parseInt(heading.tagName.charAt(1));
            anchorLink.innerHTML = '#'.repeat(level);
            
            anchorLink.setAttribute('aria-label', text + 'へのリンク');
            
            // コピー機能
            function copyAnchorLink(e) {
              e.preventDefault();
              e.stopPropagation();
              
              // URLを更新
              const url = new URL(window.location.href);
              url.hash = uniqueId;
              window.history.pushState({}, '', url.toString());
              
              // スムーススクロール
              heading.scrollIntoView({ behavior: 'smooth' });
              
              // URLをクリップボードにコピー
              navigator.clipboard.writeText(url.toString()).then(() => {
                // コピー完了の視覚的フィードバック
                const tooltip = document.createElement('div');
                tooltip.textContent = 'Copied!';
                tooltip.style.cssText = 'position:absolute;top:50%;left:100%;transform:translateY(-50%);margin-left:12px;background:rgba(16,185,129,0.9);color:white;padding:6px 12px;border-radius:6px;font-size:14px;white-space:nowrap;backdrop-filter:blur(4px);opacity:0;transition:opacity 0.3s ease-in-out;z-index:1000;';
                heading.appendChild(tooltip);
                
                // アニメーション開始
                setTimeout(() => {
                  tooltip.style.opacity = '1';
                }, 10);
                
                // 1秒後にツールチップを削除
                setTimeout(() => {
                  tooltip.style.opacity = '0';
                  setTimeout(() => tooltip.remove(), 300);
                }, 1000);
              }).catch(() => {
                console.log('クリップボードへのコピーに失敗しました');
              });
            }
            
            // #アイコンクリック時の処理
            anchorLink.addEventListener('click', copyAnchorLink);
            
            // 見出し全体クリック時の処理
            heading.addEventListener('click', copyAnchorLink);
            heading.style.cursor = 'pointer';
            
            // 見出しにアンカーリンクを追加
            heading.style.position = 'relative';
            heading.appendChild(anchorLink);
          });
          
          // ページ読み込み時にアンカーがある場合はスクロール
          if (window.location.hash) {
            const targetId = window.location.hash.slice(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
              setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }
          }
        });
      `}} />
      <div class="fixed top-20 right-2 md:top-24 md:right-4 z-50 flex flex-col gap-2">
        <button onclick={`navigator.clipboard.writeText('https://yumenomatayume.net/blog/${slug}'); const t=document.createElement('div'); t.textContent='Copied!'; t.style.cssText='position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:8px;background:#10b981;color:white;padding:6px 12px;border-radius:6px;font-size:14px;white-space:nowrap;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06);z-index:1000;opacity:0;animation:fadeIn 0.3s ease-in-out forwards;'; t.style.animation='fadeIn 0.3s ease-in-out forwards'; const style=document.createElement('style'); style.textContent='@keyframes fadeIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}'; document.head.appendChild(style); this.appendChild(t); setTimeout(() => t.remove(), 1000)`} class="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 bg-white dark:bg-purple-900/40 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all cursor-pointer relative" title="URLをコピー">
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
          <div class="flex items-center gap-2 mb-4">
            <time class="text-sm text-gray-600 dark:text-gray-400">{formatDate(frontmatter.pubDate)}</time>
            {(() => {
              const { showUpdated, isRecent } = getUpdateStatus(frontmatter.pubDate, frontmatter.updatedDate)
              if (showUpdated) {
                return (
                  <>
                    <span class="text-sm text-gray-600 dark:text-gray-400">(更新: {formatDate(frontmatter.updatedDate!)})</span>
                    {isRecent && (
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        最近更新
                      </span>
                    )}
                  </>
                )
              }
              return null
            })()}
          </div>
          {frontmatter.tags && (
            <div class="flex gap-2 flex-wrap mt-4">
              {frontmatter.tags.map((tag: string) => (
                <a href={`/blog/tag/${tag}`} class="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">{tag}</a>
              ))}
            </div>
          )}
        </header>
        <div class="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
          <Content components={{ LinkCard }} />
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
                <div class="flex items-center gap-2">
                  <time class="text-xs text-gray-500 dark:text-gray-500 mt-2 block">{formatDate(post.pubDate)}</time>
                  {(() => {
                    const { showUpdated, isRecent } = getUpdateStatus(post.pubDate, post.updatedDate)
                    if (showUpdated) {
                      return (
                        <>
                          <span class="text-xs text-gray-500 dark:text-gray-500 mt-2 block">(更新: {formatDate(post.updatedDate)})</span>
                          {isRecent && (
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-2">
                              最近更新
                            </span>
                          )}
                        </>
                      )
                    }
                    return null
                  })()}
                </div>
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
