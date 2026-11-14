import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import Fuse from 'fuse.js'
import app from '../dist/index.js'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { visit } from 'unist-util-visit'
import { prepareSearchBody } from '../app/utils/searchBody'

const response = await app.fetch(new Request('http://localhost/'))
assert.equal(response.status, 200)
const html = await response.text()
const embedded = html.match(/const posts = (\[.*?\]);\s*const searchInput =/s)
assert.ok(embedded, 'Search data should be embedded in the page')

const posts: Array<{ slug: string; body: string }> = JSON.parse(embedded[1])
assert.ok(posts.length > 0, 'Search data should contain articles')
for (const post of posts) {
  const path = ['md', 'mdx']
    .map(extension => `app/content/blog/${post.slug}.${extension}`)
    .find(existsSync)
  assert.ok(path, `Source should exist for ${post.slug}`)
  const source = readFileSync(path, 'utf8')
  visit(fromMarkdown(source), ['code', 'inlineCode'], (node) => {
    assert.ok(post.body.includes(source.slice(node.position!.start.offset, node.position!.end.offset)), `Search body should preserve code in ${post.slug}`)
  })
}

const post = posts.find(item => item.slug === 'ansible-managed-by-asdf')
assert.ok(post, 'Expected article should exist')
const query = 'ansible python module location'
assert.ok(post.body.indexOf(query) >= 500, 'Test query should occur after character 500')
const fuse = new Fuse(posts, { keys: ['body'], includeMatches: true, threshold: 0.3, ignoreLocation: true })
const result = fuse.search(query).find(({ item }) => item.slug === post.slug)
assert.ok(result?.matches?.some(match => match.indices.some(([start]) => start >= 500)),
  'Search should match article text after character 500')

const articleResponse = await app.fetch(new Request(`http://localhost/blog/${post.slug}`))
assert.equal(articleResponse.status, 200)
assert.ok((await articleResponse.text()).includes('<h2>ansible を asdf 経由でインストール</h2>'),
  'Normal article imports should still compile to HTML')
console.log(`Verified ${posts.length} search bodies with preserved code and a match beyond character 500`)

// Exercise the production preparation path with terms occurring only inside code tags.
for (const code of ['`<inlinequartzneedle>`', '```html\n<fencedzirconneedle>\n```', '~~~html\n<tildeopalneedle>\n~~~']) {
  const term = code.includes('inline') ? 'inlinequartzneedle' : code.includes('fenced') ? 'fencedzirconneedle' : 'tildeopalneedle'
  const body = prepareSearchBody('<div data-hidden="removedattribute">Visible prose</div>\n\n' + code)
  assert.ok(!body.includes('removedattribute'), 'Actual HTML tags should be removed')
  const index = new Fuse([{ body }], { keys: ['body'], threshold: 0.3, ignoreLocation: true })
  assert.equal(index.search(term).length, 1, 'Code-only terms should remain searchable')
}
// Check the renderer actually uses the preservation path for existing articles too.
for (const [slug, term] of [['bandcamp-download-discography', 'format-container'], ['edit-git-commit', 'oneline']]) {
  assert.ok(fuse.search(term).some(({ item }) => item.slug === slug), `Embedded search index should find ${term}`)
}
