import type { NotFoundHandler } from 'hono'

const handler: NotFoundHandler = (c) => {
  c.status(404)
  return c.render(
    <main class="max-w-3xl mx-auto py-16 px-4 text-center">
      <p class="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3">404 Not Found</p>
      <h1 class="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">ページが見つかりませんでした</h1>
      <p class="text-lg text-gray-700 dark:text-gray-300 mb-8">
        お探しのページは移動したか、URL が正しくない可能性があります。
      </p>
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <a
          href="/"
          class="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-purple-700 text-white hover:bg-purple-800 transition-colors"
        >
          トップへ戻る
        </a>
        <a
          href="/blog"
          class="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          ブログ一覧へ
        </a>
      </div>
    </main>,
    { title: '404', description: 'お探しのページは見つかりませんでした。', noindex: true }
  )
}

export default handler
