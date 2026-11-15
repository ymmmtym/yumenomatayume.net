import { createRoute } from 'honox/factory'
import { fetchExternalPosts } from '../components/ExternalPosts'
import { skills } from '../data/skills'
import { SkillCard } from '../components/SkillCard'

const sectionTitle = 'mb-6 flex items-center gap-2 border-b border-gray-200 pb-3 text-2xl font-bold tracking-tight text-gray-900 dark:border-gray-800 dark:text-gray-50'
const cardClass = 'block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/60 dark:hover:border-brand-500/50'

export default createRoute(async (c) => {
  const { posts: externalPosts, isFallback } = await fetchExternalPosts(10)

  return c.render(
    <main class="mx-auto max-w-3xl px-4 py-10">
      <section class="hero-glow relative -mx-4 mb-16 rounded-3xl px-6 py-16 text-center">
        <p class="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300">
          Portfolio
        </p>
        <h1 class="mb-4 break-words text-5xl font-extrabold tracking-tight md:text-6xl">
          <span class="text-gradient">yumenomatayume</span>
        </h1>
        <p class="mb-6 text-lg font-medium text-gray-600 md:text-xl dark:text-gray-300">
          SRE / Infrastructure Engineer
        </p>
        <p class="mx-auto mb-8 max-w-xl text-base text-gray-600 dark:text-gray-400">
          AWS・Kubernetes を中心に、信頼性の高いインフラを設計・構築・運用しています。
          日々の学びや気付きをこのブログに記録しています。
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <a
            href="/blog"
            class="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition-colors hover:bg-brand-700"
          >
            ブログを読む
          </a>
          <a
            href="https://github.com/ymmmtym"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 no-underline transition-colors hover:border-brand-400 hover:text-brand-700 dark:border-gray-700 dark:text-gray-200 dark:hover:border-brand-500 dark:hover:text-brand-300"
          >
            GitHub
          </a>
        </div>
      </section>

      <section class="mb-16">
        <h2 class={sectionTitle}>
          <span aria-hidden="true">💬</span> About
        </h2>
        <p class="mb-4 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          yumenomatayumeと申します。SREとして、AWSなどのクラウド環境の設計・構築・運用に携わっています。
          特に最近はKubernetesをはじめとするコンテナ技術を用いたインフラ構築に注力しており、
          システムの信頼性、スケーラビリティ、パフォーマンス向上などの業務に貢献しています。
        </p>
        <p class="mb-4 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          このサイトは個人のブログで、SREやインフラエンジニア向けの技術記事から、趣味や日々の気付きといった幅広い内容を投稿しています。
          主に個人の備忘録としての利用しています。
        </p>
        <h3 class="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">RSS</h3>
        <p class="text-lg text-gray-700 dark:text-gray-300">
          <code class="rounded bg-gray-100 px-2 py-1 font-mono text-base text-brand-700 dark:bg-gray-800 dark:text-brand-300">https://yumenomatayume.net/feed</code>
          <span class="ml-2 text-base text-gray-500 dark:text-gray-400">から本ブログのRSSを取得できます。</span>
        </p>
      </section>

      <section class="mb-16">
        <h2 class={sectionTitle}>
          <span aria-hidden="true">💼</span> Career
        </h2>
        <div class="space-y-5">
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/60">
            <div class="mb-2 text-sm font-medium text-brand-600 dark:text-brand-300">2023 - 現在</div>
            <h3 class="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">SRE / Infrastructure Engineer</h3>
            <ul class="list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300">
              <li>AWS環境の構築・運用</li>
              <li>Kubernetes環境の構築・運用</li>
              <li>CI/CDパイプラインの構築</li>
            </ul>
          </div>
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/60">
            <div class="mb-2 text-sm font-medium text-brand-600 dark:text-brand-300">2018 - 2023</div>
            <h3 class="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">Infrastructure Engineer</h3>
            <ul class="list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300">
              <li>クラウド基盤の構築</li>
              <li>ネットワーク設計</li>
              <li>データセンター作業</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="mb-16">
        <h2 class={sectionTitle}>
          <span aria-hidden="true">🤘</span> Skills
        </h2>
        <p class="mb-4 text-lg text-gray-700 dark:text-gray-300">主な技術スタックは以下の通りです。</p>
        <div class="grid grid-cols-2 gap-4 md:grid-cols-3">
          {skills.map(skill => <SkillCard skill={skill} key={skill.name} />)}
        </div>
      </section>

      <section class="mb-16">
        <h2 class={sectionTitle}>
          <span aria-hidden="true">🧚</span> Activity
        </h2>

        <h3 class="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">Blog</h3>
        {isFallback && (
          <div class="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <p class="text-sm text-amber-800 dark:text-amber-200">
              外部記事を一時的に取得できません。以下は各サイトへのリンクです。
            </p>
          </div>
        )}
        <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {externalPosts.map(post => (
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              class={`${cardClass} ${isFallback ? 'opacity-60' : ''}`}
            >
              <div class="mb-2 flex items-center gap-2">
                <span class="text-xl">{post.icon}</span>
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{post.source}</span>
              </div>
              <h4 class="mb-2 line-clamp-2 font-bold text-gray-900 dark:text-gray-100">{post.title}</h4>
              <time class="text-xs text-gray-500 dark:text-gray-500">{new Date(post.pubDate).toLocaleDateString('ja-JP')}</time>
            </a>
          ))}
        </div>

        <h3 class="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">GitHub</h3>
        <a href="https://github.com/ymmmtym" target="_blank" rel="noopener noreferrer">
          <img src="https://raw.githubusercontent.com/ymmmtym/ymmmtym/main/dist/github-snake.svg" alt="GitHub Snake" class="h-auto w-full" />
        </a>
      </section>

      <section class="mb-4">
        <h2 class={sectionTitle}>
          <span aria-hidden="true">🔗</span> Links
        </h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <a href="mailto:yumenomatayume@yumenomatayume.net" class={cardClass}>
            <div class="mb-2 text-2xl">📧</div>
            <div class="mb-1 font-bold text-gray-900 dark:text-gray-100">Email</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">yumenomatayume@yumenomatayume.net</div>
          </a>
          <a href="https://github.com/ymmmtym" target="_blank" rel="noopener noreferrer" class={cardClass}>
            <div class="mb-2 text-2xl">🐙</div>
            <div class="mb-1 font-bold text-gray-900 dark:text-gray-100">GitHub</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">@yumenomatayume</div>
          </a>
          <a href="https://zenn.dev/ymmmtym" target="_blank" rel="noopener noreferrer" class={cardClass}>
            <div class="mb-2 text-2xl">📝</div>
            <div class="mb-1 font-bold text-gray-900 dark:text-gray-100">Zenn</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">@yumenomatayume</div>
          </a>
          <a href="https://qiita.com/yumenomatayume" target="_blank" rel="noopener noreferrer" class={cardClass}>
            <div class="mb-2 text-2xl">📚</div>
            <div class="mb-1 font-bold text-gray-900 dark:text-gray-100">Qiita</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">@yumenomatayume</div>
          </a>
          <a href="https://ymmmtym.hateblo.jp/" target="_blank" rel="noopener noreferrer" class={cardClass}>
            <div class="mb-2 text-2xl">📖</div>
            <div class="mb-1 font-bold text-gray-900 dark:text-gray-100">hatena</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">@yumenomatayume</div>
          </a>
          <a href="https://scrapbox.io/yumenomatayume/" target="_blank" rel="noopener noreferrer" class={cardClass}>
            <div class="mb-2 text-2xl">📦</div>
            <div class="mb-1 font-bold text-gray-900 dark:text-gray-100">Cosense</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">@yumenomatayume</div>
          </a>
        </div>
      </section>
    </main>
  )
})
