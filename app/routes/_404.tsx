import type { NotFoundHandler } from 'hono'

const handler: NotFoundHandler = (c) => {
  c.status(404)
  return c.render(
    <main class="max-w-3xl mx-auto py-16 px-4 text-center">
      <p class="mb-3 text-sm font-semibold text-brand-600 dark:text-brand-300">404 Not Found</p>
      <h1 class="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">ページが見つかりませんでした</h1>
      <p class="mb-8 text-lg text-gray-700 dark:text-gray-300">
        お探しのページは移動したか、URL が正しくない可能性があります。
      </p>
      <div class="flex flex-col justify-center gap-4 sm:flex-row">
        <a
          href="/"
          class="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 font-semibold text-white no-underline shadow-sm transition-colors hover:bg-brand-700"
        >
          トップへ戻る
        </a>
        <a
          href="/blog"
          class="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-800 no-underline transition-colors hover:border-brand-400 hover:text-brand-700 dark:border-gray-700 dark:text-gray-100 dark:hover:border-brand-500 dark:hover:text-brand-300"
        >
          ブログ一覧へ
        </a>
      </div>
    </main>,
    { title: '404', description: 'お探しのページは見つかりませんでした。', noindex: true }
  )
}

export default handler
