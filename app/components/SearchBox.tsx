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
          class="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          autocomplete="off"
        />
        <div class="absolute inset-y-0 left-0 flex items-center pl-3">
          <span class="text-gray-400">🔍</span>
        </div>
        <div id="search-history-dropdown" class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 hidden backdrop-blur-sm"></div>
      </div>

      <div id="search-results" class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 hidden backdrop-blur-sm max-h-96 overflow-y-auto"></div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const posts = ${JSON.stringify(posts)};
            const searchInput = document.getElementById('search-input');
            const searchResults = document.getElementById('search-results');
            const searchContainer = document.getElementById('search-container');
            const historyDropdown = document.getElementById('search-history-dropdown');
            
            // Load Fuse.js dynamically
            const fuseScript = document.createElement('script');
            fuseScript.src = 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js';
            fuseScript.onload = function() {
              const fuse = new Fuse(posts, {
                keys: [
                  { name: 'title', weight: 0.4 },
                  { name: 'description', weight: 0.2 },
                  { name: 'tags', weight: 0.2 },
                  { name: 'body', weight: 0.2 }
                ],
                includeMatches: true,
                threshold: 0.3,
                minMatchCharLength: 2
              });
              window.fuseInstance = fuse;
            };
            document.head.appendChild(fuseScript);
            
            let selectedIndex = -1;
            let currentResults = [];
            let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            
            function highlightText(text, matches, maxLength) {
              if (!matches || matches.length === 0) {
                return maxLength ? text.substring(0, maxLength) + (text.length > maxLength ? '...' : '') : text;
              }
              
              const indices = matches.flatMap(m => m.indices.map(([start, end]) => [start, end]));
              indices.sort((a, b) => a[0] - b[0]);
              
              let result = '';
              let lastIndex = 0;
              const maxLen = maxLength || text.length;
              
              for (const [start, end] of indices) {
                if (lastIndex > maxLen) break;
                if (start > lastIndex) {
                  const segment = text.substring(lastIndex, Math.min(start, maxLen));
                  result += escapeHtml(segment);
                }
                const highlighted = text.substring(start, Math.min(end + 1, maxLen));
                result += '<mark class="bg-yellow-200 dark:bg-yellow-600 text-inherit rounded px-0.5">' + escapeHtml(highlighted) + '</mark>';
                lastIndex = end + 1;
              }
              
              if (lastIndex < text.length) {
                const remaining = text.substring(lastIndex, maxLen);
                result += escapeHtml(remaining);
              }
              
              return result + (text.length > maxLen ? '...' : '');
            }
            
            function escapeHtml(text) {
              const div = document.createElement('div');
              div.textContent = text;
              return div.innerHTML;
            }
            
            function getSearchContext(text, matchIndices, contextLength) {
              if (!matchIndices || matchIndices.length === 0) return '';
              
              const firstMatch = matchIndices[0];
              const start = Math.max(0, firstMatch.indices[0][0] - contextLength);
              const end = Math.min(text.length, firstMatch.indices[firstMatch.indices.length - 1][1] + 1 + contextLength);
              
              let context = text.substring(start, end);
              if (start > 0) context = '...' + context;
              if (end < text.length) context = context + '...';
              
              return context;
            }
            
            function performSearch(query) {
              if (query.length < 2) {
                searchResults.classList.add('hidden');
                searchResults.innerHTML = '';
                currentResults = [];
                selectedIndex = -1;
                return;
              }
              
              if (!window.fuseInstance) {
                // Fallback to simple search if Fuse.js not loaded
                const results = posts.filter(post => {
                  const searchText = (post.title + ' ' + post.description + ' ' + post.tags.join(' ') + ' ' + post.body).toLowerCase();
                  return searchText.includes(query.toLowerCase());
                }).slice(0, 10);
                
                displayResults(results, query, true);
                return;
              }
              
              const fuseResults = window.fuseInstance.search(query);
              const results = fuseResults.map(result => ({
                post: result.item,
                matches: result.matches
              })).slice(0, 10);
              
              displayResultsWithMatches(results, query);
            }
            
            function displayResults(results, query, isSimple) {
              if (results.length === 0) {
                searchResults.innerHTML = '<div class="m-1 px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">「' + escapeHtml(query) + '」に一致する記事が見つかりませんでした</div>';
                searchResults.classList.remove('hidden');
                currentResults = [];
                selectedIndex = -1;
                return;
              }
              
              searchResults.innerHTML = 
                '<div class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">' + results.length + '件見つかりました</div>' +
                results.map((result, idx) => 
                  '<a href="/blog/' + result.slug + '" class="block m-1 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 rounded focus-visible:outline-2 focus-visible:outline-blue-500 dark:focus-visible:outline-cyan-400 focus-visible:outline-offset-2 search-result-item" data-index="' + idx + '">' +
                    '<div class="font-medium text-gray-800 dark:text-gray-100 mb-1">' + escapeHtml(result.title) + '</div>' +
                    '<div class="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">' + escapeHtml(result.description) + '</div>' +
                    '<div class="flex items-center gap-2">' +
                      '<time class="text-xs text-gray-500 dark:text-gray-500">' + result.pubDate + '</time>' +
                      result.tags.slice(0, 3).map(tag => 
                        '<span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">' + escapeHtml(tag) + '</span>'
                      ).join('') +
                    '</div>' +
                  '</a>'
                ).join('');
              
              searchResults.classList.remove('hidden');
              currentResults = results;
              selectedIndex = -1;
            }
            
            function displayResultsWithMatches(results, query) {
              if (results.length === 0) {
                searchResults.innerHTML = '<div class="m-1 px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">「' + escapeHtml(query) + '」に一致する記事が見つかりませんでした</div>';
                searchResults.classList.remove('hidden');
                currentResults = [];
                selectedIndex = -1;
                return;
              }
              
              searchResults.innerHTML = 
                '<div class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">' + results.length + '件見つかりました</div>' +
                results.map((result, idx) => {
                  const post = result.post;
                  const matches = result.matches;
                  
                  let titleHtml = escapeHtml(post.title);
                  let descriptionHtml = escapeHtml(post.description);
                  let bodyContextHtml = '';
                  
                  matches.forEach(match => {
                    if (match.key === 'title' && match.indices.length > 0) {
                      titleHtml = highlightText(post.title, match, 100);
                    }
                    if (match.key === 'description' && match.indices.length > 0) {
                      descriptionHtml = highlightText(post.description, match, 150);
                    }
                    if (match.key === 'body' && match.indices.length > 0) {
                      const context = getSearchContext(post.body, match, 80);
                      bodyContextHtml = '<div class="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">' + highlightText(context, match, 160) + '</div>';
                    }
                  });
                  
                  return '<a href="/blog/' + post.slug + '" class="block m-1 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 rounded focus-visible:outline-2 focus-visible:outline-blue-500 dark:focus-visible:outline-cyan-400 focus-visible:outline-offset-2 search-result-item" data-index="' + idx + '">' +
                    '<div class="font-medium text-gray-800 dark:text-gray-100 mb-1">' + titleHtml + '</div>' +
                    '<div class="text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-2">' + descriptionHtml + '</div>' +
                    bodyContextHtml +
                    '<div class="flex items-center gap-2 mt-2">' +
                      '<time class="text-xs text-gray-500 dark:text-gray-500">' + post.pubDate + '</time>' +
                      post.tags.slice(0, 3).map(tag => 
                        '<span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">' + escapeHtml(tag) + '</span>'
                      ).join('') +
                    '</div>' +
                  '</a>';
                }).join('');
              
              searchResults.classList.remove('hidden');
              currentResults = results.map(r => r.post);
              selectedIndex = -1;
            }
            
            function saveToHistory(query) {
              searchHistory = searchHistory.filter(h => h !== query);
              searchHistory.unshift(query);
              searchHistory = searchHistory.slice(0, 10);
              localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
            }
            
            function showSearchHistory() {
              if (searchHistory.length === 0 || searchInput.value.length > 0) {
                historyDropdown.classList.add('hidden');
                return;
              }
              
              historyDropdown.innerHTML = 
                '<div class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">最近の検索</div>' +
                searchHistory.map((query, idx) => 
                  '<div class="m-1 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded flex items-center gap-2 history-item" data-query="' + escapeHtml(query) + '">' +
                    '<span class="text-gray-400">🕐</span>' +
                    '<span class="text-sm text-gray-700 dark:text-gray-300">' + escapeHtml(query) + '</span>' +
                  '</div>'
                ).join('');
              
              historyDropdown.classList.remove('hidden');
            }
            
            function updateSelectedResult() {
              const items = searchResults.querySelectorAll('.search-result-item');
              items.forEach((item, idx) => {
                if (idx === selectedIndex) {
                  item.classList.add('bg-gray-100', 'dark:bg-gray-700');
                  item.scrollIntoView({ block: 'nearest' });
                } else {
                  item.classList.remove('bg-gray-100', 'dark:bg-gray-700');
                }
              });
            }
            
            searchInput.addEventListener('input', function(e) {
              historyDropdown.classList.add('hidden');
              performSearch(e.target.value);
            });
            
            searchInput.addEventListener('focus', function() {
              if (searchInput.value.length < 2) {
                showSearchHistory();
              }
            });
            
            searchInput.addEventListener('keydown', function(e) {
              const items = searchResults.querySelectorAll('.search-result-item');
              
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                updateSelectedResult();
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelectedResult();
              } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                const link = items[selectedIndex];
                if (link) {
                  window.location.href = link.href;
                }
              } else if (e.key === 'Escape') {
                searchResults.classList.add('hidden');
                historyDropdown.classList.add('hidden');
                searchInput.value = '';
                searchInput.blur();
              }
            });
            
            searchResults.addEventListener('mouseover', function(e) {
              const item = e.target.closest('.search-result-item');
              if (item) {
                selectedIndex = parseInt(item.dataset.index);
                updateSelectedResult();
              }
            });
            
            historyDropdown.addEventListener('click', function(e) {
              const item = e.target.closest('.history-item');
              if (item) {
                searchInput.value = item.dataset.query;
                historyDropdown.classList.add('hidden');
                performSearch(item.dataset.query);
                searchInput.focus();
              }
            });
            
            document.addEventListener('click', function(e) {
              if (!searchContainer.contains(e.target)) {
                searchResults.classList.add('hidden');
                historyDropdown.classList.add('hidden');
              }
            });
            
            searchResults.addEventListener('click', function() {
              if (searchInput.value) {
                saveToHistory(searchInput.value);
              }
              searchResults.classList.add('hidden');
              searchInput.value = '';
            });
          })();
        `
      }} />
    </div>
  )
}
