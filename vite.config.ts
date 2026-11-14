import build from '@hono/vite-build/cloudflare-workers'
import adapter from '@hono/vite-dev-server/cloudflare'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import honox from 'honox/vite'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkGfm from 'remark-gfm'
import rehypePrism from 'rehype-prism-plus'
import { remarkLinkCard } from './app/utils/remarkLinkCard.ts'
import { defineConfig } from 'vite'

const mdxPlugin = mdx({
  jsxImportSource: 'hono/jsx',
  remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkLinkCard, remarkGfm],
  rehypePlugins: [rehypePrism]
})

export default defineConfig({
  build: {
    ssrEmitAssets: true
  },
  plugins: [
    honox({
      devServer: { adapter },
      client: { input: ['/app/client.ts', '/app/style.css'] }
    }),
    tailwindcss(),
    {
      ...mdxPlugin,
      transform(code, id) {
        // Let Vite's raw imports return article text instead of compiling it as MDX.
        if (new URLSearchParams(id.split('?')[1]).has('raw')) return
        return mdxPlugin.transform(code, id)
      }
    },
    build()
  ]
})
