export interface BlogPost {
  slug: string
  title: string
  description: string
  pubDate: string
  updatedDate?: string
  tags: string[]
  heroImage?: string
}
