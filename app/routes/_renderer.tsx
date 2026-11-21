import { jsxRenderer, useRequestContext } from 'hono/jsx-renderer'
import { Link, Script } from 'honox/server'
import Header from '../components/Header'
import { getBlogPosts } from '../utils/blog'
import searchBodies from 'virtual:search-bodies'

// Search bodies are stripped of frontmatter and HTML at build time (see
// vite.config.ts / viteSearchBodies.ts), so this is a cheap lookup rather than
// re-parsing every article's Markdown on each request.
const getPosts = () => {
  try {
    return getBlogPosts().map(({ slug, module }) => ({
      slug,
      title: module.frontmatter?.title ?? '',
      description: module.frontmatter?.description ?? '',
      tags: module.frontmatter?.tags ?? [],
      pubDate: module.frontmatter?.pubDate ?? '',
      body: searchBodies[slug] ?? '',
      updatedDate: module.frontmatter?.updatedDate || ''
    }))
  } catch {
    return []
  }
}

export default jsxRenderer(({ children, title, description, heroImage, noindex }) => {
  const c = useRequestContext()
  const pageTitle = title ? `${title} | yumenomatayume` : 'yumenomatayume'
  const pageDescription = description || 'SRE / Infrastructure Engineer'
  const baseUrl = 'https://yumenomatayume.net'
  const currentUrl = `${baseUrl}${c.req.path}`
  const ogImage = heroImage || 'https://img.yumenomatayume.net/og-image.png'
  
  // 全ページで記事データを取得（検索機能のため）
  const posts = getPosts()
  
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
        <meta name="google-adsense-account" content="ca-pub-3641744377792397" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3641744377792397"
          crossOrigin="anonymous"
        ></script>
        {noindex && <meta name="robots" content="noindex" />}
        <link rel="canonical" href={currentUrl} />
        <link rel="alternate" type="application/rss+xml" title="RSS" href="/feed" />
        <link rel="icon" href="https://res.cloudinary.com/yumenomatayume/image/upload/v1675155499/yumenomatayume/icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        />
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
                const isDarkMode = document.documentElement.classList.contains('dark');
                content.style.cssText = [
                  'background:' + (isDarkMode ? '#1f2937' : '#ffffff'),
                  'color:' + (isDarkMode ? '#f3f4f6' : '#111827'),
                  'padding:2rem',
                  'border-radius:8px',
                  'max-width:400px',
                  'width:90%',
                  'box-shadow:0 10px 25px rgba(0,0,0,0.2)'
                ].join(';');
                const kbdStyle = "background:" + (isDarkMode ? "#374151" : "#f3f4f6") + ";color:" + (isDarkMode ? "#f3f4f6" : "#111827") + ";padding:2px 6px;border-radius:3px;font-family:monospace;";
        content.innerHTML = '<h3 style="margin:0 0 1rem 0;font-size:1.25rem;font-weight:bold;">⌨️ ショートカットキー</h3>' +
                  '<div style="margin-bottom:1rem;">' +
                    '<div style="margin-bottom:0.5rem;"><kbd style="' + kbdStyle + '">⌘K / Ctrl+K</kbd> - 記事を検索</div>' +
                    '<div style="margin-bottom:0.5rem;"><kbd style="' + kbdStyle + '">j</kbd> - 下にスクロール</div>' +
                    '<div style="margin-bottom:0.5rem;"><kbd style="' + kbdStyle + '">k</kbd> - 上にスクロール</div>' +
                    (window.location.pathname.includes('/blog/') ? '<div style="margin-bottom:0.5rem;"><kbd style="' + kbdStyle + '">h</kbd> - 前の記事</div><div style="margin-bottom:0.5rem;"><kbd style="' + kbdStyle + '">l</kbd> - 次の記事</div>' : '') +
                    '<div><kbd style="' + kbdStyle + '">/</kbd> - このヘルプを表示</div>' +
                  '</div>' +
                  '<div style="text-align:right;">' +
                    '<button id="shortcut-help-close" type="button" style="background:#7c3aed;color:white;border:none;padding:0.5rem 1rem;border-radius:4px;cursor:pointer;">閉じる</button>' +
                  '</div>';
                function closeShortcutHelp() {
                  modal.remove();
                  document.removeEventListener('keydown', escapeHandler);
                }

                function escapeHandler(e) {
                  if (e.key === 'Escape') closeShortcutHelp();
                }

                content.querySelector('#shortcut-help-close').addEventListener('click', closeShortcutHelp);
                
                modal.appendChild(content);
                document.body.appendChild(modal);
                
                modal.addEventListener('click', function(e) {
                  if (e.target === modal) closeShortcutHelp();
                });
                document.addEventListener('keydown', escapeHandler);
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
                  tooltip.style.cssText = 'position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:8px;background:#10b981;color:white;padding:6px 12px;border-radius:6px;font-size:14px;white-space:nowrap;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06);z-index:1000;opacity:0;transition:opacity 0.3s ease-in-out;';
                  button.appendChild(tooltip);
                  setTimeout(function() { tooltip.style.opacity = '1'; }, 10);
                  setTimeout(function() { 
                    tooltip.style.opacity = '0';
                    setTimeout(function() { tooltip.remove(); }, 300);
                  }, 1000);
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
      <body class="min-h-screen flex flex-col bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        <Header pathname={c.req.path} posts={posts} />
        <div class="flex-1">{children}</div>
        <footer class="border-t border-gray-200 py-8 px-4 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          <p>&copy; 2025 yumenomatayume</p>
          <p class="mt-2">
            <a href="/privacy" class="transition-colors hover:text-brand-600 dark:hover:text-brand-400">プライバシーポリシー</a>
            <span class="mx-2 text-gray-300 dark:text-gray-700">·</span>
            <a href="/feed" class="transition-colors hover:text-brand-600 dark:hover:text-brand-400">RSS</a>
            <span class="mx-2 text-gray-300 dark:text-gray-700">·</span>
            <a href="/contact" class="transition-colors hover:text-brand-600 dark:hover:text-brand-400">お問い合わせ</a>
            <span class="mx-2 text-gray-300 dark:text-gray-700">·</span>
            <a
              href="https://github.com/ymmmtym"
              target="_blank"
              rel="noopener noreferrer"
              class="transition-colors hover:text-brand-600 dark:hover:text-brand-400"
            >
              GitHub
            </a>
          </p>
        </footer>
      </body>
    </html>
  )
})
