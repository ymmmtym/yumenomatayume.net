export function TableOfContents() {
  return (
    <div id="toc-container" class="sticky top-32 w-64 max-h-[calc(100vh-10rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/60">
      <div class="font-bold text-sm mb-3 text-gray-900 dark:text-gray-100">目次</div>
      <ul id="toc-list" class="space-y-1"></ul>
      <script dangerouslySetInnerHTML={{__html: `
        document.addEventListener('DOMContentLoaded', () => {
          const tocList = document.getElementById('toc-list');
          const tocContainer = document.getElementById('toc-container');
          
          function updateToc() {
            // 見出しアンカーリンク機能で既にIDが設定されるまで少し待つ
            setTimeout(() => {
              const headings = document.querySelectorAll('.prose h2, .prose h3, .prose h4, .prose h5, .prose h6');
              tocList.innerHTML = '';
              
              headings.forEach((heading) => {
                // 見出しアンカーリンク機能で既にIDが設定されているはず
                if (!heading.id) return;
                
                // リンクカード内の見出しは除外
                if (heading.closest('a[target="_blank"]')) return;
                
                const li = document.createElement('li');
                const a = document.createElement('a');
                const level = parseInt(heading.tagName.charAt(1));
                
                a.href = '#' + heading.id;
                a.textContent = heading.textContent.replace(/#+$/, ''); // 末尾の#を全て除去
                a.className = 'block text-sm py-1 px-2 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100';
                a.style.paddingLeft = (level - 1) * 12 + 8 + 'px';
                a.dataset.headingId = heading.id;
                
                // クリック時のスムーススクロール
                a.addEventListener('click', (e) => {
                  e.preventDefault();
                  const targetElement = document.getElementById(heading.id);
                  if (targetElement) {
                    // URLを更新
                    const url = new URL(window.location.href);
                    url.hash = heading.id;
                    window.history.pushState({}, '', url.toString());
                    
                    // スムーススクロール
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                  }
                });
                
                li.appendChild(a);
                tocList.appendChild(li);
              });

              const tocAside = tocContainer.closest('aside');
              // 見出しが無い記事ではサイドバー自体を出さない（モバイルは常に非表示）。
              if (tocList.children.length === 0) {
                if (tocAside) tocAside.classList.remove('lg:block');
                return;
              }
              if (tocAside) tocAside.classList.add('lg:block');
              
              // スクロール位置ベースのアクティブセクション検出
              function updateActiveSection() {
                const headings = document.querySelectorAll('.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6');
                let activeHeading = null;
                
                headings.forEach(heading => {
                  // リンクカード内の見出しは除外
                  if (heading.closest('a[target="_blank"]')) return;
                  
                  const rect = heading.getBoundingClientRect();
                  if (rect.top <= 100) {
                    activeHeading = heading;
                  }
                });
                
                document.querySelectorAll('#toc-list a').forEach(a => {
                  a.className = 'block text-sm py-1 px-2 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100';
                  a.removeAttribute('aria-current');
                });
                
                if (activeHeading) {
                  const link = document.querySelector(\`a[data-heading-id="\${activeHeading.id}"]\`);
                  if (link) {
                    link.className = 'block text-sm py-1 px-2 rounded transition-colors bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-200';
                    link.setAttribute('aria-current', 'true');
                  }
                }
              }
              
              window.addEventListener('scroll', updateActiveSection);
              updateActiveSection();
            }, 200); // 見出しアンカーリンク機能の初期化を待つ
          }
          
          updateToc();
        });
      `}} />
    </div>
  )
}
