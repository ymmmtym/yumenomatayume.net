import { SearchBox } from './SearchBox'

interface HeaderProps {
  pathname: string
  posts?: Array<{
    slug: string
    title: string
    description: string
    tags: string[]
    pubDate: string
    body: string
    updatedDate?: string
  }>
}

export default function Header({ pathname, posts = [] }: HeaderProps) {
  const isHome = pathname === '/'
  const isBlog = pathname.startsWith('/blog')

  const navLink = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-medium no-underline transition-colors ${
      active
        ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
        : 'text-gray-600 hover:text-brand-700 dark:text-gray-300 dark:hover:text-brand-300'
    }`

  return (
    <header class="sticky top-0 z-40 border-b border-gray-200/80 bg-white/85 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-950/80">
      <div class="mx-auto max-w-6xl px-4">
        <div class="flex items-center justify-between gap-4 py-3">
          <a
            href="/"
            class="flex items-center gap-2 font-bold tracking-tight text-gray-900 no-underline dark:text-gray-50"
          >
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-fuchsia-500 text-sm text-white shadow-sm">
              y
            </span>
            <span class="hidden text-base sm:inline">yumenomatayume</span>
          </a>

          <nav class="flex items-center gap-1">
            <a href="/" class={navLink(isHome)} aria-current={isHome ? 'page' : undefined}>
              Home
            </a>
            <a href="/blog" class={navLink(isBlog)} aria-current={isBlog ? 'page' : undefined}>
              Blog
            </a>
          </nav>

          <label class="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              id="theme-toggle"
              class="peer sr-only"
              onclick="document.documentElement.classList.toggle('dark');localStorage.setItem('theme',document.documentElement.classList.contains('dark')?'dark':'light');"
            />
            <span class="sr-only">ダークモードを切り替え</span>
            <span class="inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors peer-checked:bg-brand-600 peer-checked:[&>svg]:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500 dark:bg-gray-700 dark:peer-checked:bg-brand-500">
              <svg
                class="ml-0.5 h-5 w-5 rounded-full bg-white p-0.5 text-amber-500 shadow-sm transition-transform dark:bg-gray-900 dark:text-amber-300"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
              </svg>
            </span>
          </label>
        </div>

        {/* Search is available site-wide. */}
        {posts.length > 0 && (
          <div class="mx-auto max-w-md pb-3">
            <SearchBox posts={posts} />
          </div>
        )}
      </div>
    </header>
  )
}
