import assert from 'node:assert/strict'
import { runInNewContext } from 'node:vm'
import Fuse from 'fuse.js'
import app from '../dist/index.js'

const html = await (await app.fetch(new Request('http://localhost/'))).text()
const script = html.match(/<script[^>]*>\s*(\(function\(\) \{\s*const posts = [\s\S]*?)<\/script>/)?.[1]
assert.ok(script, 'SearchBox script should be rendered')

for (const outcome of ['success', 'failure']) {
  for (const dismissal of ['outside', 'Escape', 'history-Escape', 'none']) {
    const listeners = new Map<string, (event: any) => void>()
    const hidden = new Set(['hidden'])
    let activated = 0
    let dialogFocused = 0
    const options = Array.from({ length: 3 }, (_, index) => ({
      id: `search-option-${index}`,
      setAttribute() {},
      scrollIntoView() {},
      click: () => { activated += 1 },
    }))
    const input = {
      value: '',
      attributes: new Map<string, string>(),
      setAttribute(name: string, value: string) { this.attributes.set(name, value) },
      getAttribute(name: string) { return this.attributes.get(name) },
      removeAttribute(name: string) { this.attributes.delete(name) },
      focus() {
        if (document.activeElement === input) return
        document.activeElement = input
        listeners.get('focus')!.call(input, {})
      },
      addEventListener: (name: string, fn: any) => listeners.set(name, fn),
    }
    const container = {
      contains: () => false,
      addEventListener: (name: string, fn: any) => listeners.set('container:' + name, fn),
    }
    const results = {
      innerHTML: '',
      attributes: new Map<string, string>(),
      setAttribute(name: string, value: string) { this.attributes.set(name, value) },
      getAttribute(name: string) { return this.attributes.get(name) },
      classList: {
        add: (s: string) => hidden.add(s),
        remove: (s: string) => hidden.delete(s),
        contains: (s: string) => hidden.has(s),
      },
      addEventListener() {}, replaceChildren() {},
      // 閉じたパネルにも候補が残っている状況を再現する
      querySelectorAll: (selector: string) => {
        if (selector.includes('[role="option"]')) return options
        if (selector.includes('a[href]')) return [{ focus: () => { dialogFocused += 1 } }]
        return []
      },
    }
    let resolve!: (value: any) => void
    let reject!: (reason: Error) => void
    const pending = new Promise((yes, no) => { resolve = yes; reject = no })
    const document = {
      activeElement: input as object,
      getElementById: (id: string) => id === 'search-input' ? input : id === 'search-results' ? results : container,
      addEventListener: (name: string, fn: any) => listeners.set('document:' + name, fn),
      createElement: () => ({ addEventListener() {} }),
    }
    runInNewContext(script.replace(/import\('[^']+'\)/, 'loadFuseForTest()'), {
      document, window: { localStorage: { getItem: () => JSON.stringify(['ansible']), setItem() {} } },
      performance, console: { error() {}, warn() {} }, loadFuseForTest: () => pending,
    })
    listeners.get('focus')!.call(input, {})
    assert.equal(results.getAttribute('role'), 'dialog', 'History uses the dialog popup role')
    assert.equal(input.getAttribute('aria-haspopup'), 'dialog', 'aria-haspopup must follow the popup role')
    listeners.get('container:keydown')!({ key: 'ArrowDown', preventDefault() {} })
    assert.equal(dialogFocused, 1, 'ArrowDown should move focus into the dialog popup')
    input.value = 'ansible'
    listeners.get('input')!({ target: input })
    if (dismissal === 'outside') listeners.get('document:click')!({ target: {} })
    if (dismissal === 'history-Escape') {
      // A history button's keydown bubbles to the search container.
      document.activeElement = { tagName: 'BUTTON', className: 'search-history-item' }
      input.value = ''
    }
    if (dismissal === 'Escape' || dismissal === 'history-Escape') {
      listeners.get('container:keydown')!({ key: 'Escape' })
      assert.equal(document.activeElement, input, 'Escape should return focus to the input')
      assert.equal(input.value, '', 'Escape should clear the query')
      assert.equal(hidden.has('hidden'), true, 'Escape should hide the panel after focusing the input')
      assert.equal(input.getAttribute('aria-activedescendant'), undefined, 'Escape should clear the active descendant')

      // パネルが閉じている間は、残っている候補を操作しない
      listeners.get('container:keydown')!({ key: 'ArrowDown' })
      assert.equal(input.getAttribute('aria-activedescendant'), undefined, 'Hidden panel must not select an option')
      listeners.get('container:keydown')!({ key: 'Enter' })
      assert.equal(activated, 0, 'Hidden panel must not activate an option')
    }
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
      assert.equal(results.getAttribute('role'), 'listbox', 'Results use the listbox popup role')
      assert.equal(input.getAttribute('aria-haspopup'), 'listbox', 'aria-haspopup must follow the popup role')
      assert.equal(input.getAttribute('aria-activedescendant'), undefined, 'Rendering must clear the active descendant')
      listeners.get('container:keydown')!({ key: 'ArrowDown', isComposing: true })
      assert.equal(input.getAttribute('aria-activedescendant'), undefined, 'IME composition must not move the selection')
      listeners.get('container:keydown')!({ key: 'ArrowDown', preventDefault() {} })
      assert.equal(input.getAttribute('aria-activedescendant'), 'search-option-0', 'ArrowDown should select the first option')
    }
  }
}
console.log('Verified delayed success and failure after outside click, Escape from input/history, and no dismissal')
