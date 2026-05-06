interface SearchResult {
  slug: string
  title: string
  description: string
  tags: string[]
  pubDate: string
  body: string
}

interface SearchBoxProps {
  posts: SearchResult[]
}

export function SearchBox({ posts }: SearchBoxProps) {
  return (
    <div class="relative" id="search-container">
      <div class="relative">
        <input
          type="text"
          id="search-input"
          placeholder="記事を検索... (⌘K / Ctrl+K)"
          class="w-full px-4 py-2 pl-10 pr-12 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          autocomplete="off"
        />
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <span class="text-gray-400">🔍</span>
        </div>
        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
          <kbd class="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">ESC</kbd>
        </div>
      </div>

      <div id="search-results" class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 hidden backdrop-blur-sm max-h-96 overflow-y-auto"></div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const posts = ${JSON.stringify(posts)};
            const searchInput = document.getElementById('search-input');
            const searchResults = document.getElementById('search-results');
            const searchContainer = document.getElementById('search-container');
            
            // Initialize Fuse.js
            let fuse = null;
            if (typeof Fuse !== 'undefined') {
              fuse = new Fuse(posts, {
                keys: ['title', 'description', 'body', 'tags'],
                includeMatches: true,
                threshold: 0.3,
                ignoreLocation: true
              });
            }
            
            // Search history
            let searchHistory = [];
            try {
              searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            } catch(e) {}
            
            function saveToHistory(query) {
              if (!query || query.length < 2) return;
              searchHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
              try {
                localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
              } catch(e) {}
            }
            
            function highlightText(text, matches, key) {
              if (!matches || !key || !text) return text || '';
              
              const keyMatches = matches.filter(m => m.key === key || m.key.includes(key));
              if (keyMatches.length === 0) return text;
              
              const allIndices = [];
              keyMatches.forEach(m => {
                allIndices.push(...m.indices);
              });
              
              allIndices.sort((a, b) => a[0] - b[0]);
              const merged = [];
              for (const [start, end] of allIndices) {
                if (merged.length > 0 && start <= merged[merged.length - 1][1] + 1) {
                  merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], end);
                } else {
                  merged.push([start, end]);
                }
              }
              
              let result = '';
              let lastEnd = 0;
              for (const [start, end] of merged) {
                result += text.slice(lastEnd, start);
                result += '<mark class="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">' + text.slice(start, end + 1) + '</mark>';
                lastEnd = end + 1;
              }
              result += text.slice(lastEnd);
              return result;
            }
            
            function truncateText(text, maxLength) {
              if (!text || text.length <= maxLength) return text || '';
              return text.slice(0, maxLength) + '...';
            }
            
            function showHistory() {
              if (searchHistory.length === 0) return '';
              
              return '<div class="p-2">' +
                '<div class="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">最近の検索</div>' +
                searchHistory.map(h => 
                  '<button data-history="' + h.replace(/"/g, '&quot;') + '" class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2">' +
                    '<span class="text-gray-400">🕐</span>' + h +
                  '</button>'
                ).join('') +
              '</div>';
            }
            
            function performSearch(query) {
              if (query.length === 0) {
                searchResults.innerHTML = showHistory();
                searchResults.classList.remove('hidden');
                return;
              }
              
              if (query.length < 2) {
                searchResults.innerHTML = '<div class="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm text-center">2文字以上入力してください</div>';
                searchResults.classList.remove('hidden');
                return;
              }
              
              if (!fuse) {
                searchResults.classList.add('hidden');
                return;
              }
              
              const results = fuse.search(query).slice(0, 10);
              
              if (results.length === 0) {
                searchResults.innerHTML = '<div class="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm text-center">「' + query + '」に一致する記事が見つかりませんでした</div>';
                searchResults.classList.remove('hidden');
                return;
              }
              
              const html = 
                '<div class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">' + results.length + '件見つかりました</div>' +
                results.map(result => {
                  const item = result.item;
                  return '<a href="/blog/' + item.slug + '" class="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors" data-slug="' + item.slug + '">' +
                    '<div class="font-medium text-gray-800 dark:text-gray-100 mb-1">' + highlightText(item.title, result.matches, 'title') + '</div>' +
                    '<div class="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">' + highlightText(truncateText(item.description, 120), result.matches, 'description') + '</div>' +
                    '<div class="flex items-center gap-2">' +
                      '<time class="text-xs text-gray-500 dark:text-gray-500">' + item.pubDate + '</time>' +
                      item.tags.slice(0, 3).map(tag => 
                        '<span class="px-2 py-1 bg-gray-300 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">' + tag + '</span>'
                      ).join('') +
                    '</div>' +
                  '</a>';
                }).join('');
              
              searchResults.innerHTML = html;
              searchResults.classList.remove('hidden');
            }
            
            searchInput.addEventListener('input', function(e) {
              performSearch(e.target.value);
            });
            
            searchInput.addEventListener('focus', function() {
              if (searchInput.value.length === 0) {
                searchResults.innerHTML = showHistory();
                searchResults.classList.remove('hidden');
              }
            });
            
            searchInput.addEventListener('keydown', function(e) {
              if (e.key === 'Escape') {
                if (searchInput.value) {
                  searchInput.value = '';
                  searchResults.classList.add('hidden');
                } else {
                  searchResults.classList.add('hidden');
                }
              }
            });
            
            // Handle history clicks
            searchResults.addEventListener('click', function(e) {
              const historyBtn = e.target.closest('[data-history]');
              if (historyBtn) {
                const query = historyBtn.getAttribute('data-history');
                searchInput.value = query;
                performSearch(query);
                saveToHistory(query);
                return;
              }
              
              // Close on result click
              const link = e.target.closest('a');
              if (link) {
                saveToHistory(searchInput.value);
              }
            });
            
            // Click outside to close
            document.addEventListener('click', function(e) {
              if (!searchContainer.contains(e.target)) {
                searchResults.classList.add('hidden');
              }
            });
          })();
        `
      }} />
    </div>
  )
}
