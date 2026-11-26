import fuseUrl from 'fuse.js/min?url'

interface SearchResult {
  slug: string
  title: string
  description: string
  tags: string[]
  pubDate: string
  body: string
  updatedDate?: string
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
          class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-400"
          autocomplete="off"
        />
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      <div id="search-results" class="search-results absolute left-0 right-0 top-full z-50 mt-1 hidden max-h-96 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"></div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const posts = ${JSON.stringify(posts).replace(/</g, '\\u003c')};
            const searchInput = document.getElementById('search-input');
            const searchResults = document.getElementById('search-results');
            const searchContainer = document.getElementById('search-container');

            function escapeHtml(value) {
              return String(value ?? '').replace(/[&<>"']/g, function(ch) {
                switch (ch) {
                  case '&': return '&amp;';
                  case '<': return '&lt;';
                  case '>': return '&gt;';
                  case '"': return '&quot;';
                  case "'": return '&#39;';
                  default: return ch;
                }
              });
            }
            
            function loadFuse() {
              return import('${fuseUrl}').then((module) => module.default);
            }
            
            let fuse = null;
            let loadingFuse = false;
            let panelOpen = false;
            let canPersistHistory = true;
            let searchHistory = [];

            try {
              const storedHistory = window.localStorage.getItem('searchHistory');
              const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];
              if (Array.isArray(parsedHistory)) {
                searchHistory = parsedHistory.filter((query) => typeof query === 'string');
              }
            } catch (error) {
              canPersistHistory = false;
              console.warn('Could not read search history from localStorage', error);
            }

            function initializeFuse() {
              if (fuse || loadingFuse) return;
              loadingFuse = true;
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
                  distance: 100,
                  ignoreLocation: true
                });
                loadingFuse = false;
                if (panelOpen) performSearch(searchInput.value);
              }).catch((error) => {
                loadingFuse = false;
                console.error('Could not load Fuse.js', error);
                if (!panelOpen) return;
                const message = document.createElement('span');
                message.textContent = '検索機能を読み込めませんでした。';
                const retryButton = document.createElement('button');
                retryButton.type = 'button';
                retryButton.textContent = '再試行';
                retryButton.className = 'ml-2 underline';
                retryButton.addEventListener('click', function(event) {
                  event.stopPropagation();
                  initializeFuse();
                });
                searchResults.replaceChildren(message, retryButton);
                searchResults.classList.remove('hidden');
              });
            }

            initializeFuse();
            
            function highlightText(text, indices) {
              if (!indices || indices.length === 0) return escapeHtml(text);
              let result = '';
              let lastIndex = 0;
              indices.sort((a, b) => a[0] - b[0]);
              indices.forEach(([start, end]) => {
                result += escapeHtml(text.substring(lastIndex, start));
                result += '<mark class="rounded bg-amber-200 px-0.5 text-gray-900 dark:bg-amber-400/70 dark:text-gray-900">' + escapeHtml(text.substring(start, end + 1)) + '</mark>';
                lastIndex = end + 1;
              });
              result += escapeHtml(text.substring(lastIndex));
              return result;
            }

            function saveSearchHistory(query) {
              searchHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
              if (!canPersistHistory) return;
              try {
                window.localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
              } catch (error) {
                canPersistHistory = false;
                console.warn('Could not save search history to localStorage', error);
              }
            }
            
            function showSearchHistory() {
              if (searchHistory.length === 0) {
                searchResults.classList.add('hidden');
                return;
              }
              searchResults.innerHTML = '<div class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">最近の検索</div>' +
                searchHistory.map(query => {
                  const escapedQuery = escapeHtml(query);
                  return '<button type="button" class="search-history-item block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-300" data-query="' + escapedQuery + '">' +
                    '<svg class="w-3 h-3 inline-block mr-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>' +
                    escapedQuery +
                  '</button>'
                }).join('');
              searchResults.classList.remove('hidden');
              
              // Add click handlers for history items
              searchResults.querySelectorAll('button.search-history-item').forEach(item => {
                item.addEventListener('click', function(event) {
                  event.stopPropagation();
                  searchInput.value = this.dataset.query;
                  performSearch(this.dataset.query);
                });
              });
            }
            
            function performSearch(query) {
              // 1 文字でも検索する（/?q=猫 のように SearchAction から 1 文字が渡るため）
              if (!query) {
                if (searchInput === document.activeElement) showSearchHistory();
                else searchResults.classList.add('hidden');
                return;
              }
              
              if (!fuse) {
                initializeFuse();
                return;
              }
              
              const startTime = performance.now();
              const allResults = fuse.search(query);
              const results = allResults.slice(0, 10);
              const endTime = performance.now();
              
              saveSearchHistory(query);
              
              if (allResults.length === 0) {
                searchResults.innerHTML = '<div class="m-1 px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">「' + escapeHtml(query) + '」に一致する記事が見つかりませんでした</div>';
                searchResults.classList.remove('hidden');
                return;
              }
              
              const countHtml = '<div class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">' + allResults.length + '件見つかりました (' + Math.round(endTime - startTime) + 'ms)</div>';
              
              searchResults.innerHTML = countHtml + results.map(({ item, matches }) => {
                let titleHtml = escapeHtml(item.title);
                let descHtml = escapeHtml(item.description);
                
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
                
                return '<a href="/blog/' + encodeURIComponent(item.slug || '') + '" class="block m-1 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 focus-visible:outline-2 focus-visible:outline-brand-500 dark:focus-visible:outline-brand-400 focus-visible:outline-offset-2">' +
                    '<div class="font-medium text-gray-800 dark:text-gray-100 mb-1">' + titleHtml + '</div>' +
                    '<div class="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">' + descHtml + '</div>' +
                    '<div class="flex items-center gap-2">' +
                      '<time class="text-xs text-gray-500 dark:text-gray-500">' + escapeHtml(item.pubDate) + '</time>' +
                      (Array.isArray(item.tags) ? item.tags.slice(0, 3).map(tag =>
                        '<span class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">' + escapeHtml(tag) + '</span>'
                      ).join('') : '') +
                    '</div>' +
                  '</a>'
              }).join('');
              
              searchResults.classList.remove('hidden');
            }
            
            searchInput.addEventListener('input', function(e) {
              panelOpen = true;
              performSearch(e.target.value);
            });
            
            searchInput.addEventListener('focus', function() {
              panelOpen = true;
              performSearch(this.value);
            });
            
            // /?q=... で検索結果を直接開けるようにする（JSON-LD の SearchAction の遷移先）
            const initialQuery = new URLSearchParams(window.location.search).get('q');
            if (initialQuery) {
              searchInput.value = initialQuery;
              panelOpen = true;
              performSearch(initialQuery);
              searchInput.focus();
            }

            searchContainer.addEventListener('keydown', function(e) {
              if (e.key === 'Escape') {
                searchInput.focus();
                panelOpen = false;
                searchResults.classList.add('hidden');
                searchInput.value = '';
              }
            });
            
            // Click outside to close
            document.addEventListener('click', function(e) {
              if (!searchContainer.contains(e.target)) {
                panelOpen = false;
                searchResults.classList.add('hidden');
              }
            });
            
            // Add click handlers to search results
            searchResults.addEventListener('click', function(e) {
              if (!e.target.closest('.search-history-item')) {
                panelOpen = false;
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
