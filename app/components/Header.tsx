import { SearchBox } from './SearchBox'

interface HeaderProps {
  pathname: string
  posts?: Array<{
    slug: string
    title: string
    description: string
    tags: string[]
    pubDate: string
  }>
}

export default function Header({ pathname, posts = [] }: HeaderProps) {
  const isHome = pathname === '/'
  const isBlog = pathname.startsWith('/blog')

  return (
    <header class="mb-8 py-4 px-4 bg-gradient-to-r from-purple-900 to-indigo-900 dark:from-purple-50 dark:to-pink-50 border-b border-purple-700 dark:border-purple-200">
      <div class="max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-4">
          <div class="w-10"></div>
          <nav class="flex gap-6">
            <a 
              href="/" 
              class={`text-xl text-gray-100 dark:text-gray-800 no-underline transition-colors hover:text-purple-200 dark:hover:text-purple-600 ${isHome ? 'font-bold underline' : ''}`}
            >
              Home
            </a>
            <a 
              href="/blog" 
              class={`text-xl text-gray-100 dark:text-gray-800 no-underline transition-colors hover:text-purple-200 dark:hover:text-purple-600 ${isBlog ? 'font-bold underline' : ''}`}
            >
              Blog
            </a>
          </nav>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-gray-100 dark:text-gray-800" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
            </svg>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="theme-toggle"
                class="sr-only peer"
                onclick="document.documentElement.classList.toggle('dark');localStorage.setItem('theme',document.documentElement.classList.contains('dark')?'dark':'light');"
              />
              <div class="w-11 h-6 bg-purple-800 dark:bg-purple-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-[inset_0_0_0_2px] after:shadow-gray-100 dark:after:shadow-gray-800"></div>
            </label>
            <svg class="w-5 h-5 text-gray-100 dark:text-gray-800" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
          </div>
        </div>
        
        {/* 検索ボックス - ブログページでのみ表示 */}
        {isBlog && posts.length > 0 && (
          <div class="max-w-md mx-auto">
            <SearchBox posts={posts} />
          </div>
        )}
      </div>
    </header>
  )
}
