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
import { remarkReadingTime } from './app/utils/remarkReadingTime.ts'
import { searchBodiesPlugin } from './app/utils/viteSearchBodies.ts'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const mdxPlugin = mdx({
  jsxImportSource: 'hono/jsx',
  remarkPlugins: [remarkFrontmatter, remarkReadingTime, remarkMdxFrontmatter, remarkLinkCard, remarkGfm],
  rehypePlugins: [rehypePrism]
})

export default defineConfig({
  ssr: {
    resolve: {
      // Prefer DOM-free exports when bundling for Cloudflare Workers.
      conditions: ['workerd', 'module', 'browser', 'development|production']
    }
  },
  build: {
    ssrEmitAssets: true
  },
  plugins: [
    honox({
      devServer: { adapter },
      client: { input: ['/app/client.ts', '/app/style.css'] }
    }),
    tailwindcss(),
    searchBodiesPlugin(fileURLToPath(new URL('./app/content/blog', import.meta.url))),
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
