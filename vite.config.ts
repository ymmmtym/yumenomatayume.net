import build from '@hono/vite-build/cloudflare-workers'
import adapter from '@hono/vite-dev-server/cloudflare'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import honox from 'honox/vite'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkGfm from 'remark-gfm'
import rehypePrism from 'rehype-prism-plus'
import { remarkLinkCard } from './app/utils/remarkLinkCard'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    honox({
      devServer: { adapter },
      client: { input: ['/app/client.ts', '/app/style.css'] }
    }),
    tailwindcss(),
    mdx({
      jsxImportSource: 'hono/jsx',
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkLinkCard, remarkGfm],
      rehypePlugins: [rehypePrism]
    }),
    build()
  ]
})
