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
            let selectedIndex = -1;
            let currentResults = [];
            
            // Load search history from localStorage
            function getSearchHistory() {
              try {
                return JSON.parse(localStorage.getItem('searchHistory') || '[]');
              } catch {
                return [];
              }
            }
            
            function saveSearchHistory(query) {
              if (!query || query.length < 2) return;
              const history = getSearchHistory();
              const newHistory = [query, ...history.filter(h => h !== query)].slice(0, 10);
              localStorage.setItem('searchHistory', JSON.stringify(newHistory));
            }
            
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
                minMatchCharLength: 2
              });
            });
            
            function highlightText(text, matches) {
              if (!matches || matches.length === 0) return text;
              let result = '';
              let lastIndex = 0;
              matches.sort((a, b) => a[0] - b[0]);
              matches.forEach(([start, end]) => {
                result += text.substring(lastIndex, start);
                result += '<mark class="bg-yellow-300 dark:bg-yellow-600 rounded px-0.5">' + text.substring(start, end + 1) + '</mark>';
                lastIndex = end + 1;
              });
              result += text.substring(lastIndex);
              return result;
            }
            
            function performSearch(query) {
              selectedIndex = -1;
              
              if (!query || query.length < 2) {
                searchResults.classList.add('hidden');
                return;
              }
              
              if (!fuse) {
                // Fallback to simple search if Fuse is not loaded
                const results = posts.filter(post => {
                  const searchText = (post.title + ' ' + post.description + ' ' + post.tags.join(' ') + ' ' + post.body).toLowerCase();
                  return searchText.includes(query.toLowerCase());
                }).slice(0, 5);
                displayResults(results, query);
                return;
              }
              
              const results = fuse.search(query, { limit: 5 });
              currentResults = results;
              displayResults(results, query);
            }
            
            function displayResults(results, query) {
              if (results.length === 0) {
                searchResults.innerHTML = '<div class="m-1 px-4 py-3 text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-800 rounded">「' + query + '」に一致する記事が見つかりませんでした</div>';
                searchResults.classList.remove('hidden');
                return;
              }
              
              // Show result count
              let html = '<div class="m-1 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">' + results.length + '件見つかりました</div>';
              
              html += results.map((result, index) => {
                const item = result.item || result;
                const matches = result.matches || [];
                
                // Find matches for title
                const titleMatch = matches.find(m => m.key === 'title');
                const title = titleMatch ? highlightText(item.title, titleMatch.indices) : item.title;
                
                // Find matches for description
                const descMatch = matches.find(m => m.key === 'description');
                const description = descMatch ? highlightText(item.description, descMatch.indices) : item.description;
                
                return '<a href="/blog/' + item.slug + '" class="block m-1 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 bg-white dark:bg-gray-800 rounded focus-visible:outline-2 focus-visible:outline-blue-500 dark:focus-visible:outline-cyan-400 focus-visible:outline-offset-2" data-index="' + index + '">' +
                    '<div class="font-medium text-gray-800 dark:text-gray-100 mb-1">' + title + '</div>' +
                    '<div class="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">' + description + '</div>' +
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
            
            function showHistory() {
              const history = getSearchHistory();
              if (history.length === 0 || searchInput.value.length > 0) return;
              
              let html = '<div class="m-1 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">最近の検索</div>';
              html += history.map(query => 
                '<div class="m-1 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-300" onclick="document.getElementById(\\'search-input\\').value = \\'' + query + '\\'; document.getElementById(\\'search-input\\').dispatchEvent(new Event(\\'input\\'));">' +
                  '<span class="mr-2">🕐</span>' + query +
                '</div>'
              ).join('');
              
              searchResults.innerHTML = html;
              searchResults.classList.remove('hidden');
            }
            
            searchInput.addEventListener('input', function(e) {
              performSearch(e.target.value);
            });
            
            searchInput.addEventListener('focus', function() {
              if (this.value.length < 2) {
                showHistory();
              }
            });
            
            searchInput.addEventListener('keydown', function(e) {
              const resultLinks = searchResults.querySelectorAll('a[data-index]');
              
              if (e.key === 'Escape') {
                searchResults.classList.add('hidden');
                searchInput.value = '';
                selectedIndex = -1;
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, resultLinks.length - 1);
                updateSelection(resultLinks);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection(resultLinks);
              } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                const link = resultLinks[selectedIndex];
                if (link) {
                  saveSearchHistory(searchInput.value);
                  window.location.href = link.href;
                }
              }
            });
            
            function updateSelection(links) {
              links.forEach((link, index) => {
                if (index === selectedIndex) {
                  link.classList.add('bg-gray-100', 'dark:bg-gray-700');
                  link.scrollIntoView({ block: 'nearest' });
                } else {
                  link.classList.remove('bg-gray-100', 'dark:bg-gray-700');
                }
              });
            }
            
            // Click outside to close
            document.addEventListener('click', function(e) {
              if (!searchContainer.contains(e.target)) {
                searchResults.classList.add('hidden');
              }
            });
            
            // Add click handlers to search results
            searchResults.addEventListener('click', function(e) {
              const link = e.target.closest('a');
              if (link && link.href) {
                saveSearchHistory(searchInput.value);
              }
            });
          })();
        `
      }} />
    </div>
  )
}
