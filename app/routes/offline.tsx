import { createRoute } from 'honox/factory'

export default createRoute((c) =>
  c.render(
    <main id="main" class="max-w-3xl mx-auto py-16 px-4 text-center">
      <p class="mb-3 text-sm font-semibold text-brand-600 dark:text-brand-300">オフライン</p>
      <h1 class="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
        オフラインのようです
      </h1>
      <p class="mb-8 text-lg text-gray-700 dark:text-gray-300">
        ネットワークに接続できませんでした。接続を確認してから、もう一度お試しください。
      </p>
      <div class="flex flex-col justify-center gap-4 sm:flex-row">
        <button
          type="button"
          onclick="location.reload()"
          class="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          再読み込み
        </button>
        <a
          href="/"
          class="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-800 no-underline transition-colors hover:border-brand-400 hover:text-brand-700 dark:border-gray-700 dark:text-gray-100 dark:hover:border-brand-500 dark:hover:text-brand-300"
        >
          トップへ戻る
        </a>
      </div>
    </main>,
    { title: 'オフライン', description: 'ネットワークに接続できませんでした。', noindex: true }
  )
)
