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
          class="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-100 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          autocomplete="off"
        />
        <div class="absolute inset-y-0 left-0 flex items-center pl-3">
          <span class="text-gray-400">🔍</span>
        </div>
      </div>

      <div id="search-results" class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 search-results hidden backdrop-blur-sm max-h-96 overflow-y-auto"></div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
            // Load Fuse.js from CDN
            const fuseScript = document.createElement('script');
            fuseScript.src = 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js';
            fuseScript.onload = initSearch;
            document.head.appendChild(fuseScript);
            
            let fuse = null;
            let selectedIndex = -1;
            let currentResults = [];
            
            function initSearch() {
              const posts = ${JSON.stringify(posts)};
              const searchInput = document.getElementById('search-input');
              const searchResults = document.getElementById('search-results');
              const searchContainer = document.getElementById('search-container');
              
              // Initialize Fuse.js
              fuse = new Fuse(posts, {
                keys: [
                  { name: 'title', weight: 0.4 },
                  { name: 'description', weight: 0.3 },
                  { name: 'tags', weight: 0.2 },
                  { name: 'body', weight: 0.1 }
                ],
                includeMatches: true,
                threshold: 0.3,
                minMatchCharLength: 2,
                ignoreLocation: true
              });
              
              function highlightText(text, matches, maxLen = 150) {
                if (!matches || matches.length === 0) {
                  const truncated = text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
                  return escapeHtml(truncated);
                }
                
                // Get all match indices
                const matchIndices = new Set();
                matches.forEach(match => {
                  match.indices.forEach(([start, end]) => {
                    for (let i = start; i <= end && i < text.length; i++) {
                      matchIndices.add(i);
                    }
                  });
                });
                
                // Find best snippet around first match
                let startIdx = 0;
                const firstMatch = Math.min(...matches[0].indices.map(i => i[0]));
                if (firstMatch > 50) {
                  startIdx = firstMatch - 50;
                }
                let endIdx = Math.min(text.length, startIdx + maxLen);
                
                const snippet = text.substring(startIdx, endIdx);
                const offset = startIdx;
                
                let result = '';
                let inMatch = false;
                for (let i = 0; i < snippet.length; i++) {
                  const globalIdx = i + offset;
                  const isMatch = matchIndices.has(globalIdx);
                  
                  if (isMatch !== inMatch) {
                    if (inMatch) result += '</mark>';
                    else result += '<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">';
                    inMatch = isMatch;
                  }
                  result += escapeHtml(snippet[i]);
                }
                if (inMatch) result += '</mark>';
                
                if (startIdx > 0) result = '...' + result;
                if (endIdx < text.length) result = result + '...';
                
                return result;
              }
              
              function escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
              }
              
              function getSearchHistory() {
                try {
                  return JSON.parse(localStorage.getItem('searchHistory') || '[]');
                } catch {
                  return [];
                }
              }
              
              function saveToHistory(query) {
                if (!query || query.length < 2) return;
                const history = getSearchHistory();
                const filtered = history.filter(h => h !== query);
                filtered.unshift(query);
                localStorage.setItem('searchHistory', JSON.stringify(filtered.slice(0, 10)));
              }
              
              function showSearchHistory() {
                const history = getSearchHistory();
                if (history.length === 0) {
                  searchResults.classList.add('hidden');
                  return;
                }
                
                searchResults.innerHTML = 
                  '<div class="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">検索履歴</div>' +
                  history.map(h => 
                    '<div class="search-history-item block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">' +
                      '<span class="text-gray-400 mr-2">🕒</span>' + escapeHtml(h) +
                    '</div>'
                  ).join('');
                
                // Add click handlers for history items
                searchResults.querySelectorAll('.search-history-item').forEach(item => {
                  item.addEventListener('click', function() {
                    searchInput.value = this.textContent.trim();
                    performSearch(this.textContent.trim());
                  });
                });
                
                searchResults.classList.remove('hidden');
              }
              
              function performSearch(query) {
                if (!query || query.length < 2) {
                  searchResults.classList.add('hidden');
                  return;
                }
                
                saveToHistory(query);
                selectedIndex = -1;
                
                const results = fuse.search(query, { limit: 10 });
                currentResults = results;
                
                if (results.length === 0) {
                  searchResults.innerHTML = '<div class="m-1 px-4 py-3 text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-800 rounded">「' + escapeHtml(query) + '」に一致する記事が見つかりませんでした</div>';
                  searchResults.classList.remove('hidden');
                  return;
                }
                
                searchResults.innerHTML = 
                  '<div class="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">' + results.length + '件見つかりました</div>' +
                  results.map((result, idx) => {
                    const item = result.item;
                    const titleMatches = result.matches?.find(m => m.key === 'title');
                    const descMatches = result.matches?.find(m => m.key === 'description');
                    const bodyMatches = result.matches?.find(m => m.key === 'body');
                    
                    const displayTitle = titleMatches ? highlightText(item.title, titleMatches.indices, 100) : escapeHtml(item.title);
                    const displayDesc = bodyMatches ? highlightText(item.body, bodyMatches.indices, 150) : (descMatches ? highlightText(item.description, descMatches.indices, 150) : escapeHtml(item.description));
                    
                    return '<a href="/blog/' + item.slug + '" class="search-result-item block m-1 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 bg-white dark:bg-gray-800 rounded focus-visible:outline-2 focus-visible:outline-blue-500 dark:focus-visible:outline-cyan-400 focus-visible:outline-offset-2" data-index="' + idx + '">' +
                      '<div class="font-medium text-gray-800 dark:text-gray-100 mb-1">' + displayTitle + '</div>' +
                      '<div class="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">' + displayDesc + '</div>' +
                      '<div class="flex items-center gap-2">' +
                        '<time class="text-xs text-gray-500 dark:text-gray-500">' + item.pubDate + '</time>' +
                        item.tags.slice(0, 3).map(tag => 
                          '<span class="px-2 py-1 bg-gray-300 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">' + escapeHtml(tag) + '</span>'
                        ).join('') +
                      '</div>' +
                    '</a>';
                  }).join('');
                
                searchResults.classList.remove('hidden');
              }
              
              function selectResult(index) {
                const items = searchResults.querySelectorAll('.search-result-item');
                items.forEach((item, idx) => {
                  if (idx === index) {
                    item.classList.add('bg-gray-100', 'dark:bg-gray-700');
                    item.scrollIntoView({ block: 'nearest' });
                  } else {
                    item.classList.remove('bg-gray-100', 'dark:bg-gray-700');
                  }
                });
              }
              
              searchInput.addEventListener('input', function(e) {
                performSearch(e.target.value);
              });
              
              searchInput.addEventListener('focus', function() {
                if (!searchInput.value || searchInput.value.length < 2) {
                  showSearchHistory();
                }
              });
              
              searchInput.addEventListener('keydown', function(e) {
                const items = searchResults.querySelectorAll('.search-result-item');
                
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  if (items.length > 0) {
                    selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                    selectResult(selectedIndex);
                  }
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  if (items.length > 0) {
                    selectedIndex = Math.max(selectedIndex - 1, 0);
                    selectResult(selectedIndex);
                  }
                } else if (e.key === 'Enter' && selectedIndex >= 0) {
                  e.preventDefault();
                  const selected = items[selectedIndex];
                  if (selected) {
                    window.location.href = selected.href;
                  }
                } else if (e.key === 'Escape') {
                  searchResults.classList.add('hidden');
                  searchInput.value = '';
                  selectedIndex = -1;
                }
              });
              
              // Click outside to close
              document.addEventListener('click', function(e) {
                if (!searchContainer.contains(e.target)) {
                  searchResults.classList.add('hidden');
                  selectedIndex = -1;
                }
              });
              
              // Add click handlers to search results
              searchResults.addEventListener('click', function() {
                searchResults.classList.add('hidden');
                searchInput.value = '';
                selectedIndex = -1;
              });
              
              // Reset selection on mouse enter
              searchResults.addEventListener('mouseenter', function() {
                selectedIndex = -1;
                const items = searchResults.querySelectorAll('.search-result-item');
                items.forEach(item => item.classList.remove('bg-gray-100', 'dark:bg-gray-700'));
              });
            }
          })();
        `
      }} />
    </div>
  )
}
