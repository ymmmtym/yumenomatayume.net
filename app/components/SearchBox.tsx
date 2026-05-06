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
        <div id="search-history-dropdown" class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 hidden backdrop-blur-sm"></div>
      </div>

      <div id="search-results" class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 search-results hidden backdrop-blur-sm max-h-96 overflow-y-auto"></div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const posts = ${JSON.stringify(posts)};
            const searchInput = document.getElementById('search-input');
            const searchResults = document.getElementById('search-results');
            const searchContainer = document.getElementById('search-container');
            const historyDropdown = document.getElementById('search-history-dropdown');
            
            // Fuse.js configuration
            const fuseOptions = {
              keys: [
                { name: 'title', weight: 0.4 },
                { name: 'description', weight: 0.2 },
                { name: 'tags', weight: 0.2 },
                { name: 'body', weight: 0.2 }
              ],
              includeMatches: true,
              threshold: 0.3,
              minMatchCharLength: 2,
              maxPatternLength: 32
            };
            
            // Load Fuse.js from CDN
            function loadFuse() {
              return new Promise((resolve, reject) => {
                if (window.Fuse) {
                  resolve(window.Fuse);
                  return;
                }
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js';
                script.onload = () => resolve(window.Fuse);
                script.onerror = reject;
                document.head.appendChild(script);
              });
            }
            
            let fuse = null;
            let selectedIndex = -1;
            let currentResults = [];
            
            // Search history management
            const SEARCH_HISTORY_KEY = 'searchHistory';
            const MAX_HISTORY = 10;
            
            function getSearchHistory() {
              try {
                return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
              } catch {
                return [];
              }
            }
            
            function saveToHistory(query) {
              if (!query || query.length < 2) return;
              const history = getSearchHistory();
              const filtered = history.filter(h => h !== query);
              filtered.unshift(query);
              localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered.slice(0, MAX_HISTORY)));
            }
            
            function showHistory() {
              const history = getSearchHistory();
              if (history.length === 0 || searchInput.value.length > 0) {
                historyDropdown.classList.add('hidden');
                return;
              }
              
              historyDropdown.innerHTML = '<div class="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">検索履歴</div>' +
                history.map(h => 
                  '<div class="search-history-item m-1 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2 rounded">' +
                    '<span class="text-gray-400">🕐</span>' +
                    '<span>' + escapeHtml(h) + '</span>' +
                  '</div>'
                ).join('');
              
              historyDropdown.classList.remove('hidden');
              
              historyDropdown.querySelectorAll('.search-history-item').forEach((item, idx) => {
                item.addEventListener('click', () => {
                  searchInput.value = history[idx];
                  performSearch(history[idx]);
                  historyDropdown.classList.add('hidden');
                });
              });
            }
            
            function clearHistory() {
              localStorage.removeItem(SEARCH_HISTORY_KEY);
              historyDropdown.classList.add('hidden');
            }
            
            // HTML escaping utility
            function escapeHtml(text) {
              const div = document.createElement('div');
              div.textContent = text;
              return div.innerHTML;
            }
            
            // Highlight matching text
            function highlightText(text, matches) {
              if (!matches || matches.length === 0) return escapeHtml(text);
              
              const indices = new Set();
              matches.forEach(match => {
                for (let i = match[1]; i <= match[2]; i++) {
                  indices.add(i);
                }
              });
              
              let result = '';
              let inHighlight = false;
              
              for (let i = 0; i < text.length; i++) {
                if (indices.has(i)) {
                  if (!inHighlight) {
                    result += '<mark class="bg-yellow-200 dark:bg-yellow-800 text-inherit px-0.5 rounded">';
                    inHighlight = true;
                  }
                  result += escapeHtml(text[i]);
                } else {
                  if (inHighlight) {
                    result += '</mark>';
                    inHighlight = false;
                  }
                  result += escapeHtml(text[i]);
                }
              }
              
              if (inHighlight) result += '</mark>';
              return result;
            }
            
            // Get body snippet with highlighted match
            function getBodySnippet(body, matches, query) {
              if (!body || body.length === 0) return '';
              
              // Find the first match position
              let matchPos = 0;
              if (matches && matches.length > 0) {
                matchPos = Math.max(0, matches[0][1] - 30);
              }
              
              const snippetStart = matchPos;
              const snippetEnd = Math.min(snippetStart + 100, body.length);
              const snippet = body.substring(snippetStart, snippetEnd);
              
              // Create matches relative to snippet
              const snippetMatches = matches
                ? matches.map(m => [m[0], m[1] - snippetStart, m[2] - snippetStart]).filter(m => m[1] >= 0 && m[2] < snippet.length)
                : [];
              
              return (snippetStart > 0 ? '...' : '') + highlightText(snippet, snippetMatches) + (snippetEnd < body.length ? '...' : '');
            }
            
            async function performSearch(query) {
              if (query.length < 2) {
                searchResults.classList.add('hidden');
                showHistory();
                return;
              }
              
              historyDropdown.classList.add('hidden');
              
              if (!fuse) {
                try {
                  const Fuse = await loadFuse();
                  fuse = new Fuse(posts, fuseOptions);
                } catch {
                  // Fallback to simple search if Fuse.js fails to load
                  const results = posts.filter(post => {
                    const searchText = (post.title + ' ' + post.description + ' ' + post.tags.join(' ') + ' ' + post.body).toLowerCase();
                    return searchText.includes(query.toLowerCase());
                  }).slice(0, 10).map(post => ({
                    item: post,
                    matches: []
                  }));
                  displayResults(results, query);
                  return;
                }
              }
              
              const startTime = performance.now();
              const results = fuse.search(query).slice(0, 10);
              const elapsed = Math.round(performance.now() - startTime);
              
              displayResults(results, query, elapsed);
            }
            
            function displayResults(results, query, elapsed = 0) {
              selectedIndex = -1;
              currentResults = results;
              
              if (results.length === 0) {
                searchResults.innerHTML = '<div class="m-1 px-4 py-3 text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-800 rounded">「' + escapeHtml(query) + '」に一致する記事が見つかりませんでした</div>';
                searchResults.classList.remove('hidden');
                return;
              }
              
              const countHtml = '<div class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">' + results.length + '件見つかりました' + (elapsed > 0 ? ' (' + elapsed + 'ms)' : '') + '</div>';
              
              const resultsHtml = results.map((result, idx) => {
                const post = result.item;
                const titleMatches = result.matches?.filter(m => m.key === 'title').flatMap(m => m.indices) || [];
                const descMatches = result.matches?.filter(m => m.key === 'description').flatMap(m => m.indices) || [];
                const bodyMatches = result.matches?.filter(m => m.key === 'body').flatMap(m => m.indices) || [];
                
                return '<a href="/blog/' + escapeHtml(post.slug) + '" class="search-result-item block m-1 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 bg-white dark:bg-gray-800 rounded focus-visible:outline-2 focus-visible:outline-blue-500 dark:focus-visible:outline-cyan-400 focus-visible:outline-offset-2" data-index="' + idx + '">' +
                  '<div class="font-medium text-gray-800 dark:text-gray-100 mb-1">' + highlightText(post.title, titleMatches) + '</div>' +
                  (post.description ? '<div class="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">' + highlightText(post.description, descMatches) + '</div>' : '') +
                  (bodyMatches.length > 0 ? '<div class="text-xs text-gray-500 dark:text-gray-500 mb-2 line-clamp-2">' + getBodySnippet(post.body, bodyMatches, query) + '</div>' : '') +
                  '<div class="flex items-center gap-2">' +
                    '<time class="text-xs text-gray-500 dark:text-gray-500">' + escapeHtml(post.pubDate) + '</time>' +
                    (post.tags || []).slice(0, 3).map(tag => 
                      '<span class="px-2 py-1 bg-gray-300 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">' + escapeHtml(tag) + '</span>'
                    ).join('') +
                  '</div>' +
                '</a>';
              }).join('');
              
              searchResults.innerHTML = countHtml + resultsHtml;
              searchResults.classList.remove('hidden');
              
              // Add click handlers
              searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                  saveToHistory(query);
                  searchResults.classList.add('hidden');
                  searchInput.value = '';
                });
              });
            }
            
            function updateSelectedResult() {
              searchResults.querySelectorAll('.search-result-item').forEach((item, idx) => {
                if (idx === selectedIndex) {
                  item.classList.add('bg-gray-100', 'dark:bg-gray-700');
                  item.scrollIntoView({ block: 'nearest' });
                } else {
                  item.classList.remove('bg-gray-100', 'dark:bg-gray-700');
                }
              });
            }
            
            // Event listeners
            searchInput.addEventListener('input', function(e) {
              performSearch(e.target.value);
            });
            
            searchInput.addEventListener('focus', function() {
              if (searchInput.value.length === 0) {
                showHistory();
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
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && currentResults[selectedIndex]) {
                  const post = currentResults[selectedIndex].item;
                  saveToHistory(searchInput.value);
                  window.location.href = '/blog/' + post.slug;
                }
              } else if (e.key === 'Escape') {
                searchResults.classList.add('hidden');
                historyDropdown.classList.add('hidden');
                searchInput.value = '';
                searchInput.blur();
              }
            });
            
            // Click outside to close
            document.addEventListener('click', function(e) {
              if (!searchContainer.contains(e.target)) {
                searchResults.classList.add('hidden');
                historyDropdown.classList.add('hidden');
              }
            });
            
            // Add clear history option
            historyDropdown.addEventListener('click', function(e) {
              if (e.target.closest('.clear-history')) {
                clearHistory();
              }
            });
          })();
        `
      }} />
    </div>
  )
}
