import { jsxRenderer, useRequestContext } from 'hono/jsx-renderer'
import { Link, Script } from 'honox/server'
import Header from '../components/Header'

export default jsxRenderer(({ children, title, description, heroImage }) => {
  const c = useRequestContext()
  const pageTitle = title ? `${title} | yumenomatayume` : 'yumenomatayume'
  const pageDescription = description || 'SRE / Infrastructure Engineer'
  const baseUrl = 'https://yumenomatayume.net'
  const currentUrl = `${baseUrl}${c.req.path}`
  const ogImage = heroImage || 'https://img.yumenomatayume.net/og-image.png'
  
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
              
              // Keyboard shortcuts for scrolling
              document.addEventListener('keydown', function(e) {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                if (e.key === 'j') {
                  window.scrollBy({ top: 100, behavior: 'smooth' });
                } else if (e.key === 'k') {
                  window.scrollBy({ top: -100, behavior: 'smooth' });
                }
              });
              
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
      <body class="bg-white dark:bg-gray-900/95 dark:bg-gradient-to-br dark:from-gray-900 dark:to-purple-950">
        <Header pathname={c.req.path} />
        {children}
      </body>
      <footer class="py-4 px-4 text-center bg-gradient-to-r from-purple-900 to-indigo-900 dark:from-purple-50 dark:to-pink-50 border-t border-purple-700 dark:border-purple-200 text-gray-200 dark:text-gray-600">
        &copy; 2025 yumenomatayume
      </footer>
    </html>
  )
})
