const blogModules = import.meta.glob('../content/blog/*.md', { eager: true })

export interface LocalBlogPost {
  slug: string
  title: string
  description: string
  pubDate: string
}

/**
 * ローカルのブログ記事を取得する
 * Cloudflare Workers環境での自己参照フェッチ問題を回避するため、
 * HTTPフェッチではなく直接ファイルから読み込む
 */
export function getLocalBlogPosts(): LocalBlogPost[] {
  return Object.entries(blogModules).map(([path, module]: [string, any]) => {
    const slug = path.split('/').pop()?.replace('.md', '')
    return {
      slug: slug ?? '',
      title: module.frontmatter?.title ?? '',
      description: module.frontmatter?.description ?? '',
      pubDate: module.frontmatter?.pubDate ?? '',
    }
  }).sort((a, b) =>
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  )
}
