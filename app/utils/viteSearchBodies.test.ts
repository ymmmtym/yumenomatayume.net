import { expect, test } from 'bun:test'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'vite'
import { searchBodiesPlugin } from './viteSearchBodies'

test('article edits refresh search bodies in the same dev server', async () => {
  const root = mkdtempSync(join(tmpdir(), 'search-bodies-'))
  const article = (text: string) => `---\ntitle: Hidden metadata\n---\nVisible <span>${text}</span> and \`<code>\`\n`
  for (const extension of ['md', 'mdx']) {
    writeFileSync(join(root, `${extension}.${extension}`), article('original'))
  }
  writeFileSync(join(root, 'ignored.txt'), 'Ignored')
  const server = await createServer({
    configFile: false,
    root,
    plugins: [searchBodiesPlugin(root)],
    server: { middlewareMode: true, watch: { usePolling: true, interval: 20 } }
  })
  try {
    const load = async () => (await server.ssrLoadModule('virtual:search-bodies')).default
    const original = 'Visible original and `<code>`\n'
    const expected = { md: original, mdx: original }
    expect(await load()).toEqual(expected)
    // Distinct slugs ensure every source is independently tracked.
    for (const extension of ['md', 'mdx']) {
      writeFileSync(join(root, `${extension}.${extension}`), article(extension))
      expected[extension as keyof typeof expected] = `Visible ${extension} and \`<code>\`\n`
      const deadline = Date.now() + 5000
      let bodies = await load()
      while (JSON.stringify(bodies) !== JSON.stringify(expected) && Date.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, 25))
        bodies = await load()
      }
      expect(bodies).toEqual(expected)
    }
  } finally {
    await server.close()
    rmSync(root, { recursive: true, force: true })
  }
}, 15000)
