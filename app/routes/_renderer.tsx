import { jsxRenderer, useRequestContext } from 'hono/jsx-renderer'
import { Link, Script } from 'honox/server'
import Header from '../components/Header'

// 記事データを取得する関数
const getBlogPosts = () => {
  try {
    const modules = import.meta.glob('../content/blog/*.md', { eager: true })
    return Object.entries(modules).map(([path, module]: [string, any]) => {
      const slug = path.split('/').pop()?.replace('.md', '')
      return { 
        slug, 
        title: module.frontmatter?.title || '',
        description: module.frontmatter?.description || '',
        tags: module.frontmatter?.tags || [],
        pubDate: module.frontmatter?.pubDate || ''
      }
    })
  } catch (error) {
    return []
  }
}

export default jsxRenderer(({ children, title, description, heroImage }) => {
  const c = useRequestContext()
  const pageTitle = title ? `${title} | yumenomatayume` : 'yumenomatayume'
  const pageDescription = description || 'SRE / Infrastructure Engineer'
  const baseUrl = 'https://yumenomatayume.net'
  const currentUrl = `${baseUrl}${c.req.path}`
  const ogImage = heroImage || 'https://img.yumenomatayume.net/og-image.png'
  
  // ブログページの場合のみ記事データを取得
  const posts = c.req.path.startsWith('/blog') ? getBlogPosts() : []
  
  return (
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
        <link rel="canonical" href={currentUrl} />
        <link rel="alternate" type="application/rss+xml" title="RSS" href="/feed" />
        <link rel="icon" href="https://res.cloudinary.com/yumenomatayume/image/upload/v1675155499/yumenomatayume/icon.png" />
        <Link href="/app/style.css" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `
            if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark')
            }
            window.addEventListener('DOMContentLoaded', function() {
              const isDark = document.documentElement.classList.contains('dark');
              const toggle = document.getElementById('theme-toggle');
              if (toggle) {
                toggle.checked = isDark;
              }
              
              // Keyboard shortcuts for scrolling and search
              document.addEventListener('keydown', function(e) {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                
                // Search shortcut (Ctrl+K or Cmd+K)
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                  e.preventDefault();
                  const searchInput = document.getElementById('search-input');
                  if (searchInput) {
                    searchInput.focus();
                  }
                  return;
                }
                
                if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
                if (e.key === 'j') {
                  window.scrollBy({ top: 100, behavior: 'smooth' });
                } else if (e.key === 'k') {
                  window.scrollBy({ top: -100, behavior: 'smooth' });
                } else if (e.key === '/') {
                  e.preventDefault();
                  showShortcutHelp();
                }
              });
              
              function showShortcutHelp() {
                const existing = document.getElementById('shortcut-help');
                if (existing) {
                  existing.remove();
                  return;
                }
                
                const modal = document.createElement('div');
                modal.id = 'shortcut-help';
                modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;';
                
                const content = document.createElement('div');
                content.style.cssText = 'background:white;dark:bg-gray-800;padding:2rem;border-radius:8px;max-width:400px;width:90%;';
                content.innerHTML = \`
                  <h3 style="margin:0 0 1rem 0;font-size:1.25rem;font-weight:bold;">⌨️ ショートカットキー</h3>
                  <div style="margin-bottom:1rem;">
                    \${window.location.pathname.startsWith('/blog') ? '<div style="margin-bottom:0.5rem;"><kbd style="background:#f3f4f6;padding:2px 6px;border-radius:3px;font-family:monospace;">⌘K / Ctrl+K</kbd> - 記事を検索</div>' : ''}
                    <div style="margin-bottom:0.5rem;"><kbd style="background:#f3f4f6;padding:2px 6px;border-radius:3px;font-family:monospace;">j</kbd> - 下にスクロール</div>
                    <div style="margin-bottom:0.5rem;"><kbd style="background:#f3f4f6;padding:2px 6px;border-radius:3px;font-family:monospace;">k</kbd> - 上にスクロール</div>
                    \${window.location.pathname.includes('/blog/') ? '<div style="margin-bottom:0.5rem;"><kbd style="background:#f3f4f6;padding:2px 6px;border-radius:3px;font-family:monospace;">h</kbd> - 前の記事</div><div style="margin-bottom:0.5rem;"><kbd style="background:#f3f4f6;padding:2px 6px;border-radius:3px;font-family:monospace;">l</kbd> - 次の記事</div>' : ''}
                    <div><kbd style="background:#f3f4f6;padding:2px 6px;border-radius:3px;font-family:monospace;">/</kbd> - このヘルプを表示</div>
                  </div>
                  <div style="text-align:right;">
                    <button onclick="document.getElementById('shortcut-help').remove()" style="background:#6366f1;color:white;border:none;padding:0.5rem 1rem;border-radius:4px;cursor:pointer;">閉じる</button>
                  </div>
                \`;
                
                modal.appendChild(content);
                document.body.appendChild(modal);
                
                modal.addEventListener('click', function(e) {
                  if (e.target === modal) modal.remove();
                });
                
                document.addEventListener('keydown', function escHandler(e) {
                  if (e.key === 'Escape') {
                    modal.remove();
                    document.removeEventListener('keydown', escHandler);
                  }
                });
              }
              
              window.showShortcutHelp = showShortcutHelp;
              
              document.querySelectorAll('.prose a').forEach(function(link) {
                if (link.hostname !== window.location.hostname) {
                  link.setAttribute('target', '_blank');
                  link.setAttribute('rel', 'noopener noreferrer');
                }
              });
              
              // Add copy buttons to code blocks
              document.querySelectorAll('pre').forEach(function(pre) {
                const button = document.createElement('button');
                button.innerHTML = '📋';
                button.style.cssText = 'position:absolute;top:8px;right:8px;background:#374151;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;opacity:0;transition:opacity 0.2s;z-index:10';
                button.onclick = function() {
                  const code = pre.querySelector('code').textContent;
                  navigator.clipboard.writeText(code);
                  const tooltip = document.createElement('div');
                  tooltip.textContent = 'Copied!';
                  tooltip.style.cssText = 'position:absolute;bottom:100%;right:0;margin-bottom:8px;background:#10b981;color:white;padding:4px 8px;border-radius:4px;font-size:12px;white-space:nowrap;z-index:20';
                  button.appendChild(tooltip);
                  setTimeout(function() { tooltip.remove(); }, 2000);
                };
                pre.style.position = 'relative';
                pre.style.overflow = 'visible';
                pre.onmouseenter = function() { button.style.opacity = '1'; };
                pre.onmouseleave = function() { button.style.opacity = '0'; };
                pre.appendChild(button);
              });
            });
          `
        }} />
        <Script src="/app/client.ts" async />
      </head>
      <body class="bg-gradient-to-br from-purple-200 to-indigo-200 dark:from-purple-800/30 dark:to-indigo-800/30 min-h-screen">
        <div class="bg-white dark:bg-gray-900 min-h-screen">
        <Header pathname={c.req.path} posts={posts} />
        {children}
        </div>
      </body>
      <footer class="py-4 px-4 text-center bg-gradient-to-r from-purple-900 to-indigo-900 dark:from-purple-50 dark:to-pink-50 border-t border-purple-700 dark:border-purple-200 text-gray-200 dark:text-gray-600">
        &copy; 2025 yumenomatayume
      </footer>
    </html>
  )
})
