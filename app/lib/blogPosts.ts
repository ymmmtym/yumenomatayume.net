import type { ExternalPost } from './ExternalPosts'

const modules = import.meta.glob('../content/blog/*.md', { eager: true })

/**
 * ローカルのブログ記事からExternalPostを生成する
 * Cloudflare Workers環境での自己参照フェッチ問題を回避するため、
 * HTTPフェッチではなく直接ファイルを読み込む
 */
export function getLocalBlogPosts(): ExternalPost[] {
  const baseUrl = 'https://yumenomatayume.net'

  return Object.entries(modules).map(([path, module]: [string, any]) => {
    const slug = path.split('/').pop()?.replace('.md', '')
    const fm = module.frontmatter

    return {
      title: fm.title || '',
      link: `${baseUrl}/blog/${slug}`,
      pubDate: fm.pubDate || '',
      source: '個人ブログ',
      icon: '📋',
    }
  }).sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
}
