import assert from 'node:assert/strict'
import { runInNewContext } from 'node:vm'
import Fuse from 'fuse.js'
import app from '../dist/index.js'

const html = await (await app.fetch(new Request('http://localhost/'))).text()
const script = html.match(/<script[^>]*>\s*(\(function\(\) \{\s*const posts = [\s\S]*?)<\/script>/)?.[1]
assert.ok(script, 'SearchBox script should be rendered')

for (const outcome of ['success', 'failure']) {
  for (const dismissal of ['outside', 'Escape', 'none']) {
    const listeners = new Map<string, (event: any) => void>()
    const hidden = new Set(['hidden'])
    const input = { value: '', blur() {}, addEventListener: (name: string, fn: any) => listeners.set(name, fn) }
    const results = {
      innerHTML: '', classList: { add: (s: string) => hidden.add(s), remove: (s: string) => hidden.delete(s) },
      addEventListener() {}, replaceChildren() {}, querySelectorAll: () => [],
    }
    let resolve!: (value: any) => void
    let reject!: (reason: Error) => void
    const pending = new Promise((yes, no) => { resolve = yes; reject = no })
    const document = {
      activeElement: input,
      getElementById: (id: string) => id === 'search-input' ? input : id === 'search-results' ? results : { contains: () => false },
      addEventListener: (name: string, fn: any) => listeners.set('document:' + name, fn),
      createElement: () => ({ addEventListener() {} }),
    }
    runInNewContext(script.replace(/import\('[^']+'\)/, 'loadFuseForTest()'), {
      document, window: { localStorage: { getItem: () => null, setItem() {} } },
      performance, console: { error() {}, warn() {} }, loadFuseForTest: () => pending,
    })
    listeners.get('focus')!.call(input, {})
    input.value = 'ansible'
    listeners.get('input')!({ target: input })
    if (dismissal === 'outside') listeners.get('document:click')!({ target: {} })
    if (dismissal === 'Escape') listeners.get('keydown')!({ key: 'Escape' })
    if (outcome === 'success') resolve({ default: Fuse })
    else reject(new Error('Simulated loading failure'))
    await new Promise(yes => setTimeout(yes, 0))
    assert.equal(hidden.has('hidden'), dismissal !== 'none', `${outcome} after ${dismissal}`)
    if (outcome === 'success' && dismissal !== 'none') {
      // Initialization must complete while dismissed, allowing a later focus to search.
      input.value = 'ansible'
      listeners.get('focus')!.call(input, {})
      assert.equal(hidden.has('hidden'), false, 'Focus should reuse the initialized index')
      assert.ok(results.innerHTML.includes('/blog/'), 'Refocusing should display search results')
    }
  }
}
console.log('Verified delayed success and failure after outside click, Escape, and no dismissal')
