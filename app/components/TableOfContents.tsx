export function TableOfContents() {
  return (
    <>
      {/* デスクトップ用固定目次 */}
      <div id="toc-container-desktop" class="hidden xl:block fixed left-4 top-32 w-64 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700" style="margin-left: max(1rem, calc((100vw - 768px) / 2 - 280px));">
        <text class="font-bold text-sm mb-3 text-gray-900 dark:text-gray-100">目次</text>
        <ul id="toc-list-desktop" class="space-y-1"></ul>
      </div>
      
      {/* モバイル・タブレット用折りたたみ目次 */}
      <div id="toc-container-mobile" class="xl:hidden mb-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <details class="group">
          <summary class="font-bold text-sm mb-3 text-gray-900 dark:text-gray-100 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            目次 <span class="group-open:rotate-90 transition-transform inline-block">▶</span>
          </summary>
          <ul id="toc-list-mobile" class="space-y-1 mt-3"></ul>
        </details>
      </div>
      <script dangerouslySetInnerHTML={{__html: `
        document.addEventListener('DOMContentLoaded', () => {
          const tocListDesktop = document.getElementById('toc-list-desktop');
          const tocListMobile = document.getElementById('toc-list-mobile');
          const tocContainerDesktop = document.getElementById('toc-container-desktop');
          const tocContainerMobile = document.getElementById('toc-container-mobile');
          
          function updateToc() {
            // 見出しアンカーリンク機能で既にIDが設定されるまで少し待つ
            setTimeout(() => {
              const headings = document.querySelectorAll('.prose h2, .prose h3, .prose h4, .prose h5, .prose h6');
              if (headings.length === 0) {
                tocContainerDesktop.style.display = 'none';
                tocContainerMobile.style.display = 'none';
                return;
              }
              
              // 両方のリストをクリア
              tocListDesktop.innerHTML = '';
              tocListMobile.innerHTML = '';
              
              headings.forEach((heading) => {
                // 見出しアンカーリンク機能で既にIDが設定されているはず
                if (!heading.id) return;
                
                const level = parseInt(heading.tagName.charAt(1));
                const text = heading.textContent.replace(/#+$/, ''); // 末尾の#を全て除去
                
                // デスクトップ用とモバイル用の両方にリンクを作成
                [tocListDesktop, tocListMobile].forEach(tocList => {
                  const li = document.createElement('li');
                  const a = document.createElement('a');
                  
                  a.href = '#' + heading.id;
                  a.textContent = text;
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
              });
              
              // スクロール位置ベースのアクティブセクション検出
              function updateActiveSection() {
                const headings = document.querySelectorAll('.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6');
                let activeHeading = null;
                
                headings.forEach(heading => {
                  const rect = heading.getBoundingClientRect();
                  if (rect.top <= 100) {
                    activeHeading = heading;
                  }
                });
                
                // 両方のリストでアクティブ状態を更新
                document.querySelectorAll('#toc-list-desktop a, #toc-list-mobile a').forEach(a => {
                  a.className = 'block text-sm py-1 px-2 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100';
                });
                
                if (activeHeading) {
                  document.querySelectorAll(\`a[data-heading-id="\${activeHeading.id}"]\`).forEach(link => {
                    link.className = 'block text-sm py-1 px-2 rounded transition-colors bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
                  });
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
