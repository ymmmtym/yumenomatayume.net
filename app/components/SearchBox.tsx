interface SearchResult {
  slug: string
  title: string
  description: string
  tags: string[]
  pubDate: string
  body?: string
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
          class="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          autocomplete="off"
        />
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      <div id="search-results" class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 search-results hidden max-h-96 overflow-y-auto"></div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const posts = ${JSON.stringify(posts)};
            const searchInput = document.getElementById('search-input');
            const searchResults = document.getElementById('search-results');
            const searchContainer = document.getElementById('search-container');
            
            // Load Fuse.js dynamically
            function loadFuse() {
              return new Promise((resolve) => {
                if (window.Fuse) {
                  resolve(window.Fuse);
                  return;
                }
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0';
                script.onload = () => resolve(window.Fuse);
                document.head.appendChild(script);
              });
            }
            
            let fuse = null;
            let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            
            // Initialize Fuse.js
            loadFuse().then((Fuse) => {
              fuse = new Fuse(posts, {
                keys: [
                  { name: 'title', weight: 0.4 },
                  { name: 'description', weight: 0.3 },
                  { name: 'tags', weight: 0.2 },
                  { name: 'body', weight: 0.1 }
                ],
                includeMatches: true,
                threshold: 0.3,
                distance: 100
              });
            });
            
            function highlightText(text, indices) {
              if (!indices || indices.length === 0) return text;
              let result = '';
              let lastIndex = 0;
              indices.sort((a, b) => a[0] - b[0]);
              indices.forEach(([start, end]) => {
                result += text.substring(lastIndex, start);
                result += '<mark class="bg-yellow-200 dark:bg-yellow-600 rounded px-0.5">' + text.substring(start, end + 1) + '</mark>';
                lastIndex = end + 1;
              });
              result += text.substring(lastIndex);
              return result;
            }
            
            function performSearch(query) {
              if (query.length < 2) {
                searchResults.classList.add('hidden');
                return;
              }
              
              if (!fuse) return;
              
              // Save to search history
              if (query.length >= 2 && !searchHistory.includes(query)) {
                searchHistory.unshift(query);
                searchHistory = searchHistory.slice(0, 10);
                localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
              }
              
              const startTime = performance.now();
              const results = fuse.search(query, { limit: 10 });
              const endTime = performance.now();
              
              if (results.length === 0) {
                searchResults.innerHTML = '<div class="m-1 px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">「' + query + '」に一致する記事が見つかりませんでした</div>';
                searchResults.classList.remove('hidden');
                return;
              }
              
              const resultCount = '<div class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">' + results.length + '件見つかりました (' + (endTime - startTime).toFixed(0) + 'ms)</div>';
              
              searchResults.innerHTML = resultCount + results.map(({ item, matches }) => {
                let titleHtml = item.title;
                let descHtml = item.description;
                
                // Apply highlights
                if (matches) {
                  matches.forEach(match => {
                    if (match.key === 'title' && match.indices) {
                      titleHtml = highlightText(item.title, match.indices);
                    }
                    if (match.key === 'description' && match.indices) {
                      descHtml = highlightText(item.description, match.indices);
                    }
                  });
                }
                
                return '<a href="/blog/' + item.slug + '" class="block m-1 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors duration-150">' +
                  '<div class="font-medium text-gray-800 dark:text-gray-100 mb-1">' + titleHtml + '</div>' +
                  '<div class="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">' + descHtml + '</div>' +
                  '<div class="flex items-center gap-2">' +
                    '<time class="text-xs text-gray-500 dark:text-gray-500">' + item.pubDate + '</time>' +
                    item.tags.slice(0, 3).map(tag => 
                      '<span class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">' + tag + '</span>'
                    ).join('') +
                  '</div>' +
                '</a>'
              }).join('');
              
              searchResults.classList.remove('hidden');
            }
            
            function showSearchHistory() {
              if (searchHistory.length === 0 || searchInput.value.length >= 2) return;
              
              const historyHtml = '<div class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">最近の検索</div>' +
                searchHistory.map(query => 
                  '<div class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-300" data-query="' + query + '">' + query + '</div>'
                ).join('');
              
              searchResults.innerHTML = historyHtml;
              searchResults.classList.remove('hidden');
              
              // Add click handlers to history items
              searchResults.querySelectorAll('[data-query]').forEach(item => {
                item.addEventListener('click', function() {
                  searchInput.value = this.getAttribute('data-query');
                  performSearch(searchInput.value);
                });
              });
            }
            
            searchInput.addEventListener('input', function(e) {
              performSearch(e.target.value);
            });
            
            searchInput.addEventListener('focus', function() {
              if (this.value.length < 2) {
                showSearchHistory();
              }
            });
            
            searchInput.addEventListener('keydown', function(e) {
              if (e.key === 'Escape') {
                searchResults.classList.add('hidden');
                searchInput.value = '';
                searchInput.blur();
              }
            });
            
            // Click outside to close
            document.addEventListener('click', function(e) {
              if (!searchContainer.contains(e.target)) {
                searchResults.classList.add('hidden');
              }
            });
            
            // Add click handlers to search results
            searchResults.addEventListener('click', function(e) {
              if (e.target.closest('a')) {
                searchResults.classList.add('hidden');
                searchInput.value = '';
              }
            });
          })();
        `
      }} />
    </div>
  )
}
