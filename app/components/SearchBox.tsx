import { useEffect, useRef, useState } from 'hono/jsx'

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

const SEARCH_HISTORY_KEY = 'searchHistory'
const MAX_HISTORY = 10

function getSearchHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

function saveToHistory(query: string) {
  try {
    const history = getSearchHistory()
    const updated = [query, ...history.filter(h => h !== query)].slice(0, MAX_HISTORY)
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated))
  } catch {
    // ignore
  }
}

function highlightText(text: string, query: string): string {
  if (!query || text.length === 0) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">$1</mark>')
}

export function SearchBox({ posts }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ item: SearchResult; matches?: Array<{ key: string; indices: [number, number][] }> }[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [history, setHistory] = useState<string[]>([])
  const [fuse, setFuse] = useState<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    import('fuse.js').then(({ default: Fuse }) => {
      const f = new Fuse(posts, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'description', weight: 0.3 },
          { name: 'tags', weight: 0.2 },
          { name: 'body', weight: 0.1 },
        ],
        includeMatches: true,
        threshold: 0.3,
        minMatchCharLength: 2,
        ignoreLocation: true,
      })
      setFuse(f)
    })
  }, [])

  useEffect(() => {
    setHistory(getSearchHistory())
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const performSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    setSelectedIndex(-1)

    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    if (fuse) {
      const searchResults = fuse.search(searchQuery)
      setResults(searchResults.slice(0, 10))
    } else {
      const fallback = posts.filter(post => {
        const searchText = (post.title + ' ' + post.description + ' ' + post.tags.join(' ') + ' ' + post.body).toLowerCase()
        return searchText.includes(searchQuery.toLowerCase())
      }).map(item => ({ item, matches: [] }))
      setResults(fallback.slice(0, 10))
    }
  }

  const handleSelect = (slug: string) => {
    if (query.length >= 2) {
      saveToHistory(query)
    }
    location.href = `/blog/${slug}`
  }

  const handleHistorySelect = (item: string) => {
    setQuery(item)
    performSearch(item)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsFocused(false)
      setQuery('')
      setResults([])
      inputRef.current?.blur()
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const maxIndex = results.length > 0 ? results.length - 1 : (isFocused && query.length < 2 ? history.length - 1 : -1)
      setSelectedIndex(prev => (prev < maxIndex ? prev + 1 : prev))
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : -1))
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex].item.slug)
      } else if (selectedIndex >= 0 && query.length < 2) {
        const historyItem = history[selectedIndex]
        if (historyItem) handleHistorySelect(historyItem)
      }
    }
  }

  const showHistory = isFocused && query.length < 2 && history.length > 0 && results.length === 0

  return (
    <div class="relative" ref={containerRef} id="search-container">
      <div class="relative">
        <input
          ref={inputRef}
          type="text"
          id="search-input"
          value={query}
          onInput={(e) => performSearch((e.target as HTMLInputElement).value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="記事を検索... (⌘K / Ctrl+K)"
          class="w-full px-4 py-2 pl-10 pr-20 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
        />
        <div class="absolute inset-y-0 left-0 flex items-center pl-3">
          <span class="text-gray-400">🔍</span>
        </div>
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
              class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
            >
              ✕
            </button>
          )}
          <kbd class="hidden sm:inline-flex items-center px-2 py-0.5 text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
            ⌘K
          </kbd>
        </div>
      </div>

      {(results.length > 0 || showHistory) && (
        <div id="search-results" class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto backdrop-blur-sm">
          {results.length > 0 && (
            <div class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
              {results.length}件見つかりました
            </div>
          )}

          {results.map((result, index) => {
            const { item, matches } = result
            const titleMatch = matches?.find(m => m.key === 'title')
            const descMatch = matches?.find(m => m.key === 'description')

            const highlightedTitle = titleMatch
              ? highlightFromIndices(item.title, titleMatch.indices)
              : highlightText(item.title, query)

            const highlightedDesc = descMatch
              ? highlightFromIndices(item.description, descMatch.indices)
              : highlightText(item.description.slice(0, 100), query)

            return (
              <a
                href={`/blog/${item.slug}`}
                class={`block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${index === selectedIndex ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={(e) => { e.preventDefault(); handleSelect(item.slug) }}
              >
                <div class="font-medium text-gray-800 dark:text-gray-100 mb-1" dangerouslySetInnerHTML={{ __html: highlightedTitle }} />
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: highlightedDesc }} />
                <div class="flex items-center gap-2">
                  <time class="text-xs text-gray-500 dark:text-gray-500">{item.pubDate}</time>
                  {item.tags.slice(0, 3).map(tag => (
                    <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">{tag}</span>
                  ))}
                </div>
              </a>
            )
          })}

          {showHistory && (
            <div>
              <div class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                検索履歴
              </div>
              {history.map((item, index) => (
                <button
                  class={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 ${index === selectedIndex ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => handleHistorySelect(item)}
                >
                  <span class="text-gray-400">🕐</span>
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {results.length === 0 && query.length >= 2 && !showHistory && (
        <div id="search-results" class="absolute top-full left-0 right-0 mt-2 px-4 py-3 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
          「<span class="font-medium">{query}</span>」に一致する記事が見つかりませんでした
        </div>
      )}
    </div>
  )
}

function highlightFromIndices(text: string, indices: [number, number][]): string {
  if (!indices || indices.length === 0) return text
  let result = ''
  let lastIndex = 0
  indices.slice(0, 3).forEach(([start, end]) => {
    result += text.slice(lastIndex, start)
    result += `<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">${text.slice(start, end + 1)}</mark>`
    lastIndex = end + 1
  })
  result += text.slice(lastIndex)
  return result
}
