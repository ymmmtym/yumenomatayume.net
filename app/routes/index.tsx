import { createRoute } from 'honox/factory'

const RSS_FEEDS = [
  { name: '個人ブログ', url: 'https://yumenomatayume.net/feed', icon: '📋' },
  { name: 'Zenn', url: 'https://zenn.dev/ymmmtym/feed', icon: '📝' },
  { name: 'Qiita', url: 'https://qiita.com/yumenomatayume/feed', icon: '📚' },
  { name: 'はてな', url: 'https://ymmmtym.hateblo.jp/feed', icon: '📖' },
]

async function parseRSS(xml: string) {
  const items: any[] = []
  
  // Try <item> tags (RSS 2.0)
  let itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1]
    const title = item.match(/<title>(.*?)<\/title>/)?.[1] || ''
    const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || item.match(/<dc:date>(.*?)<\/dc:date>/)?.[1] || ''
    
    items.push({ title, link, pubDate })
  }
  
  // Try <entry> tags (Atom)
  if (items.length === 0) {
    itemRegex = /<entry>([\s\S]*?)<\/entry>/g
    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1]
      const title = item.match(/<title>(.*?)<\/title>/)?.[1] || ''
      const link = item.match(/<link[^>]*href="([^"]*)"[^>]*>/)?.[1] || item.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const pubDate = item.match(/<published>(.*?)<\/published>/)?.[1] || item.match(/<updated>(.*?)<\/updated>/)?.[1] || ''
      
      items.push({ title, link, pubDate })
    }
  }
  
  return items
}

async function fetchExternalPosts() {
  const allPosts: any[] = []

  for (const feed of RSS_FEEDS) {
    try {
      const response = await fetch(feed.url)
      const xml = await response.text()
      const items = await parseRSS(xml)
      
      const posts = items.map(item => ({
        title: item.title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1'),
        link: item.link,
        pubDate: item.pubDate,
        source: feed.name,
        icon: feed.icon,
      }))
      allPosts.push(...posts)
    } catch (error) {
      console.error(`Failed to fetch ${feed.name}:`, error)
    }
  }

  return allPosts
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 10)
}

export default createRoute(async (c) => {
  const externalPosts = await fetchExternalPosts()
  
  return c.render(
    <main class="max-w-3xl mx-auto py-8 px-4">
      <section class="text-center mb-16">
        <h1 class="text-4xl font-bold mb-2">yumenomatayume</h1>
        <p class="text-xl text-gray-700 dark:text-gray-300">SRE / Infrastructure Engineer</p>
      </section>

      <section class="mb-12">
        <h2 class="text-4xl font-bold border-b-2 border-gray-300 dark:border-gray-700 pb-2 mb-6">💬 About</h2>
        <p class="mb-4 text-lg text-gray-700 dark:text-gray-300">
          yumenomatayumeと申します。SREとして、AWSなどのクラウド環境の設計・構築・運用に携わっています。
          特に最近はKubernetesをはじめとするコンテナ技術を用いたインフラ構築に注力しており、
          システムの信頼性、スケーラビリティ、パフォーマンス向上などの業務に貢献しています。
        </p>
        <p class="mb-4 text-lg text-gray-700 dark:text-gray-300">
          このサイトは個人のブログで、SREやインフラエンジニア向けの技術記事から、趣味や日々の気付きといった幅広い内容を投稿しています。
          主に個人の備忘録としての利用しています。
        </p>
        <h3 class="text-2xl font-bold mb-2">RSS</h3>
        <p class="text-lg text-gray-700 dark:text-gray-300">
          <code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded dark:text-gray-100">https://yumenomatayume.net/feed</code> から本ブログのRSSを取得できます。
        </p>
      </section>

      <section class="mb-12">
        <h2 class="text-4xl font-bold border-b-2 border-gray-300 dark:border-gray-700 pb-2 mb-6 dark:text-gray-300">💼 Career</h2>
        <div class="space-y-6">
          <div class="bg-white dark:bg-purple-900/20 rounded-lg p-6 shadow">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">2023 - 現在</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">SRE / Infrastructure Engineer</h3>
            <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li>AWS環境の構築・運用</li>
              <li>Kubernetes環境の構築・運用</li>
              <li>CI/CDパイプラインの構築</li>
            </ul>
          </div>
          <div class="bg-white dark:bg-purple-900/20 rounded-lg p-6 shadow">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">2018 - 2023</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Infrastructure Engineer</h3>
            <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li>クラウド基盤の構築</li>
              <li>ネットワーク設計</li>
              <li>データセンター作業</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="mb-12">
        <h2 class="text-4xl font-bold border-b-2 border-gray-300 dark:border-gray-700 pb-2 mb-6 dark:text-gray-300">🤘 Skills</h2>
        <p class="mb-4 text-lg text-gray-700 dark:text-gray-300">主な技術スタックは以下の通りです。</p>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <a href="https://www.ansible.com/" target="_blank" rel="noopener noreferrer" class="bg-white dark:bg-purple-900/20 rounded-lg p-4 shadow hover:shadow-lg hover:-translate-y-1 transition-all block">
            <div class="text-3xl mb-2">🔧</div>
            <div class="font-bold text-gray-900 dark:text-gray-100">Ansible</div>
          </a>
          <a href="https://www.linux.org/" target="_blank" rel="noopener noreferrer" class="bg-white dark:bg-purple-900/20 rounded-lg p-4 shadow hover:shadow-lg hover:-translate-y-1 transition-all block">
            <div class="text-3xl mb-2">🐧</div>
            <div class="font-bold text-gray-900 dark:text-gray-100">Linux</div>
          </a>
          <a href="https://www.terraform.io/" target="_blank" rel="noopener noreferrer" class="bg-white dark:bg-purple-900/20 rounded-lg p-4 shadow hover:shadow-lg hover:-translate-y-1 transition-all block">
            <div class="text-3xl mb-2">🏗️</div>
            <div class="font-bold text-gray-900 dark:text-gray-100">Terraform</div>
          </a>
          <a href="https://kubernetes.io/" target="_blank" rel="noopener noreferrer" class="bg-white dark:bg-purple-900/20 rounded-lg p-4 shadow hover:shadow-lg hover:-translate-y-1 transition-all block">
            <div class="text-3xl mb-2">☸️</div>
            <div class="font-bold text-gray-900 dark:text-gray-100">Kubernetes</div>
          </a>
          <a href="https://aws.amazon.com/" target="_blank" rel="noopener noreferrer" class="bg-white dark:bg-purple-900/20 rounded-lg p-4 shadow hover:shadow-lg hover:-translate-y-1 transition-all block">
            <div class="text-3xl mb-2">☁️</div>
            <div class="font-bold text-gray-900 dark:text-gray-100">AWS</div>
          </a>
          <a href="https://cloud.google.com/" target="_blank" rel="noopener noreferrer" class="bg-white dark:bg-purple-900/20 rounded-lg p-4 shadow hover:shadow-lg hover:-translate-y-1 transition-all block">
            <div class="text-3xl mb-2">🌐</div>
            <div class="font-bold text-gray-900 dark:text-gray-100">GCP</div>
          </a>
        </div>
      </section>

      <section class="mb-12">
        <h2 class="text-4xl font-bold border-b-2 border-gray-300 dark:border-gray-700 pb-2 mb-6">🧚 Activity</h2>
        
        <h3 class="text-2xl font-bold mb-4">Blog</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {externalPosts.map(post => (
            <a href={post.link} target="_blank" rel="noopener noreferrer" class="bg-white dark:bg-purple-900/20 rounded-lg p-4 shadow hover:shadow-lg hover:-translate-y-1 transition-all block">
              <div class="flex items-start gap-2 mb-2">
                <span class="text-xl">{post.icon}</span>
                <span class="text-xs text-gray-600 dark:text-gray-400">{post.source}</span>
              </div>
              <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">{post.title}</h4>
              <time class="text-xs text-gray-500 dark:text-gray-500">{new Date(post.pubDate).toLocaleDateString('ja-JP')}</time>
            </a>
          ))}
        </div>

        <h3 class="text-2xl font-bold mb-2">GitHub</h3>
        <a href="https://github.com/ymmmtym" target="_blank" rel="noopener noreferrer">
          <img src="https://raw.githubusercontent.com/ymmmtym/ymmmtym/main/dist/github-snake.svg" alt="GitHub Snake" class="w-full h-auto" />
        </a>
      </section>

      <section class="mb-12">
        <h2 class="text-4xl font-bold border-b-2 border-gray-300 dark:border-gray-700 pb-2 mb-6">🔗 Links</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="mailto:yumenomatayume@yumenomatayume.net" class="bg-white dark:bg-purple-900/20 rounded-lg p-4 shadow hover:shadow-lg hover:-translate-y-1 transition-all block">
            <div class="text-2xl mb-2">📧</div>
            <div class="font-bold text-gray-900 dark:text-gray-100 mb-1">Email</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">yumenomatayume@yumenomatayume.net</div>
          </a>
          <a href="https://github.com/ymmmtym" target="_blank" rel="noopener noreferrer" class="bg-white dark:bg-purple-900/20 rounded-lg p-4 shadow hover:shadow-lg hover:-translate-y-1 transition-all block">
            <div class="text-2xl mb-2">🐙</div>
            <div class="font-bold text-gray-900 dark:text-gray-100 mb-1">GitHub</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">@yumenomatayume</div>
          </a>
          <a href="https://zenn.dev/ymmmtym" target="_blank" rel="noopener noreferrer" class="bg-white dark:bg-purple-900/20 rounded-lg p-4 shadow hover:shadow-lg hover:-translate-y-1 transition-all block">
            <div class="text-2xl mb-2">📝</div>
            <div class="font-bold text-gray-900 dark:text-gray-100 mb-1">Zenn</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">@yumenomatayume</div>
          </a>
          <a href="https://qiita.com/yumenomatayume" target="_blank" rel="noopener noreferrer" class="bg-white dark:bg-purple-900/20 rounded-lg p-4 shadow hover:shadow-lg hover:-translate-y-1 transition-all block">
            <div class="text-2xl mb-2">📚</div>
            <div class="font-bold text-gray-900 dark:text-gray-100 mb-1">Qiita</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">@yumenomatayume</div>
          </a>
          <a href="https://ymmmtym.hateblo.jp/" target="_blank" rel="noopener noreferrer" class="bg-white dark:bg-purple-900/20 rounded-lg p-4 shadow hover:shadow-lg hover:-translate-y-1 transition-all block">
            <div class="text-2xl mb-2">📖</div>
            <div class="font-bold text-gray-900 dark:text-gray-100 mb-1">hatena</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">@yumenomatayume</div>
          </a>
          <a href="https://scrapbox.io/yumenomatayume/" target="_blank" rel="noopener noreferrer" class="bg-white dark:bg-purple-900/20 rounded-lg p-4 shadow hover:shadow-lg hover:-translate-y-1 transition-all block">
            <div class="text-2xl mb-2">📦</div>
            <div class="font-bold text-gray-900 dark:text-gray-100 mb-1">Cosense</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">@yumenomatayume</div>
          </a>
        </div>
      </section>
    </main>
  )
})

