import { calculateReadingTime } from '../utils/readingTime'

interface SearchResult {
  slug: string
  title: string
  description: string
  tags: string[]
  pubDate: string
  content: string
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
        />
        <div class="absolute inset-y-0 left-0 flex items-center pl-3">
          <span class="text-gray-400">🔍</span>
        </div>
      </div>

      <div id="search-results" class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 search-results hidden backdrop-blur-sm"></div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
            // Reading time calculation function
            window.calculateReadingTime = function(content) {
              if (typeof content !== 'string') {
                return '1分未満';
              }
              
              const codeBlockRegex = /\`\`\`[\\s\\S]*?\`\`\`/g;
              const inlineCodeRegex = /\`[^\`]+\`/g;
              
              const codeBlocks = content.match(codeBlockRegex) || [];
              const inlineCodes = content.match(inlineCodeRegex) || [];
              
              const codeCharCount = [...codeBlocks, ...inlineCodes]
                .join('')
                .replace(/\`\`\`|\`/g, '')
                .length;
              
              const textContent = content
                .replace(codeBlockRegex, '')
                .replace(inlineCodeRegex, '')
                .replace(/---[\\s\\S]*?---/, '')
                .replace(/#+\\s/g, '')
                .replace(/\\*\\*|__|\\*|_/g, '')
                .replace(/\\[([^\\]]+)\\]\\([^)]+\\)/g, '$1')
                .replace(/!\\[[^\\]]*\\]\\([^)]+\\)/g, '')
                .trim();
              
              const japaneseChars = (textContent.match(/[\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF]/g) || []).length;
              const englishWords = textContent
                .replace(/[\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF]/g, ' ')
                .split(/\\s+/)
                .filter(word => word.length > 0).length;
              
              const japaneseReadingTime = japaneseChars / 300;
              const englishReadingTime = englishWords / 200;
              const codeReadingTime = (codeCharCount / 300) * 3.33;
              
              const totalMinutes = japaneseReadingTime + englishReadingTime + codeReadingTime;
              
              if (totalMinutes < 1) {
                return '1分未満';
              }
              
              const roundedMinutes = Math.round(totalMinutes);
              return '約' + roundedMinutes + '分';
            };
            
            const posts = ${JSON.stringify(posts)};
            const searchInput = document.getElementById('search-input');
            const searchResults = document.getElementById('search-results');
            const searchContainer = document.getElementById('search-container');
            
            function performSearch(query) {
              if (query.length < 2) {
                searchResults.classList.add('hidden');
                return;
              }
              
              const results = posts.filter(post => {
                const searchText = (post.title + ' ' + post.description + ' ' + post.tags.join(' ')).toLowerCase();
                return searchText.includes(query.toLowerCase());
              }).slice(0, 5);
              
              if (results.length === 0) {
                searchResults.innerHTML = '<div class="m-1 px-4 py-3 text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-800 rounded">「' + query + '」に一致する記事が見つかりませんでした</div>';
                searchResults.classList.remove('hidden');
                return;
              }
              
              searchResults.innerHTML = results.map(result => 
                '<a href="/blog/' + result.slug + '" class="block m-1 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 bg-white dark:bg-gray-800 rounded focus-visible:outline-2 focus-visible:outline-blue-500 dark:focus-visible:outline-cyan-400 focus-visible:outline-offset-2">' +
                  '<div class="font-medium text-gray-800 dark:text-gray-100 mb-1">' + result.title + '</div>' +
                  '<div class="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">' + result.description + '</div>' +
                  '<div class="flex items-center justify-between">' +
                    '<time class="text-xs text-gray-500 dark:text-gray-500">' + result.pubDate + '</time>' +
                    '<span class="text-xs text-gray-500 dark:text-gray-500">📖 ' + (function() { try { return window.calculateReadingTime(result.content) + 'で読めます'; } catch(e) { return ''; } })() + '</span>' +
                  '</div>' +
                  '<div class="flex items-center gap-2 mt-2">' +
                    result.tags.slice(0, 3).map(tag => 
                      '<span class="px-2 py-1 bg-gray-300 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">' + tag + '</span>'
                    ).join('') +
                  '</div>' +
                '</a>'
              ).join('');
              
              searchResults.classList.remove('hidden');
            }
            
            searchInput.addEventListener('input', function(e) {
              performSearch(e.target.value);
            });
            
            searchInput.addEventListener('keydown', function(e) {
              if (e.key === 'Escape') {
                searchResults.classList.add('hidden');
                searchInput.value = '';
              }
            });
            
            // Click outside to close
            document.addEventListener('click', function(e) {
              if (!searchContainer.contains(e.target)) {
                searchResults.classList.add('hidden');
              }
            });
            
            // Add click handlers to search results
            searchResults.addEventListener('click', function() {
              searchResults.classList.add('hidden');
              searchInput.value = '';
            });
          })();
        `
      }} />
    </div>
  )
}
