import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import Fuse from 'fuse.js'
import app from '../dist/index.js'

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
  const cleaned = source.replace(/^---\r?\n[\s\S]*?\r?\n---\s*/, '').replace(/<[^>]*>/g, '')
  assert.equal(post.body, cleaned, `Search body should contain the complete article: ${post.slug}`)
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
console.log(`Verified ${posts.length} complete search bodies and a match beyond character 500`)
