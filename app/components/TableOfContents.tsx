export function TableOfContents() {
  return (
    <div id="toc-container" class="hidden lg:block fixed left-4 top-32 w-64 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
      <text class="font-bold text-sm mb-3 text-gray-900 dark:text-gray-100">目次</text>
      <ul id="toc-list" class="space-y-1"></ul>
      <script dangerouslySetInnerHTML={{__html: `
        document.addEventListener('DOMContentLoaded', () => {
          const tocList = document.getElementById('toc-list');
          const tocContainer = document.getElementById('toc-container');
          
          function updateToc() {
            const headings = document.querySelectorAll('h2, h3, h4, h5, h6');
            if (headings.length === 0) {
              tocContainer.style.display = 'none';
              return;
            }
            
            tocList.innerHTML = '';
            let activeId = '';
            
            headings.forEach((heading, index) => {
              if (!heading.id) {
                const text = heading.textContent || '';
                const id = text.toLowerCase()
                  .replace(/[^a-z0-9\\u3040-\\u309f\\u30a0-\\u30ff\\u4e00-\\u9faf]/g, '-')
                  .replace(/-+/g, '-')
                  .replace(/^-|-$/g, '') || \`heading-\${index}\`;
                heading.id = id;
              }
              
              const li = document.createElement('li');
              const a = document.createElement('a');
              const level = parseInt(heading.tagName.charAt(1));
              
              a.href = '#' + heading.id;
              a.textContent = heading.textContent;
              a.className = 'block text-sm py-1 px-2 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100';
              a.style.paddingLeft = (level - 1) * 12 + 8 + 'px';
              a.dataset.headingId = heading.id;
              
              li.appendChild(a);
              tocList.appendChild(li);
            });
            
            // スクロール位置ベースのアクティブセクション検出
            function updateActiveSection() {
              const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
              let activeHeading = null;
              
              headings.forEach(heading => {
                const rect = heading.getBoundingClientRect();
                if (rect.top <= 100) {
                  activeHeading = heading;
                }
              });
              
              document.querySelectorAll('#toc-list a').forEach(a => {
                a.className = 'block text-sm py-1 px-2 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100';
              });
              
              if (activeHeading) {
                const link = document.querySelector(\`a[data-heading-id="\${activeHeading.id}"]\`);
                if (link) {
                  link.className = 'block text-sm py-1 px-2 rounded transition-colors bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
                }
              }
            }
            
            window.addEventListener('scroll', updateActiveSection);
            updateActiveSection();
          }
          
          updateToc();
        });
      `}} />
    </div>
  )
}
