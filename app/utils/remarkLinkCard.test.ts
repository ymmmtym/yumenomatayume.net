import { afterEach, expect, spyOn, test } from 'bun:test'
import type { Root } from 'mdast'
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import { LinkCard } from '../components/LinkCard'
import { remarkLinkCard } from './remarkLinkCard'

let fetchSpy: ReturnType<typeof spyOn> | undefined

afterEach(() => fetchSpy?.mockRestore())

async function metadata(html: string) {
  fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValue(new Response(html))
  const tree: Root = {
    type: 'root',
    children: [{ type: 'paragraph', children: [{ type: 'text', value: 'https://example.com/page' }] }]
  }
  const transform = remarkLinkCard.call({} as never)
  if (typeof transform !== 'function') throw new Error('Expected a transformer')
  await transform(tree, {} as never, () => {})
  const card = tree.children[0] as MdxJsxFlowElement
  return Object.fromEntries(card.attributes.map((attribute) => {
    if (attribute.type !== 'mdxJsxAttribute') throw new Error('Expected an attribute')
    return [attribute.name, attribute.value as string]
  }))
}

test('decodes metadata attributes once, after parsing, including URL queries', async () => {
  const props = await metadata(`<head>
    <meta property="og&#58;title" content="A &amp; B &quot;quoted&quot; &lt;img src=x&gt; &copy; &#x1F600;">
    <meta name="description" content='It&#39;s &amp;lt;literal&amp;gt; &unknown;'>
    <meta property="og:image" content="/image?a=1&amp;b=2&notit=3&#38;c=4">
    <link rel="icon" href="/icon?a=1&amp;b=2">
    <title>Fallback</title>
  </head>`)
  expect(props.title).toBe('A & B "quoted" <img src=x> © 😀')
  expect(props.description).toBe("It's &lt;literal&gt; &unknown;")
  expect(props.image).toBe('https://example.com/image?a=1&b=2&notit=3&c=4')
  expect(props.favicon).toBe('https://example.com/icon?a=1&b=2')
  const rendered = LinkCard({ ...props, url: props.url }).toString()
  expect(rendered).toContain('&lt;img src=x&gt;')
  expect(rendered).not.toContain('<img src=x>')
  expect(rendered).toContain('src="https://example.com/image?a=1&amp;b=2&amp;notit=3&amp;c=4"')
})

test('decodes the document title after removing complete tags and trims it', async () => {
  const props = await metadata('<title> &nbsp;<b>A &amp; B</b> &lt;em&gt; &#169; &amp;lt; &nbsp; </title>')
  expect(props.title).toBe('A & B <em> © &lt;')
})

test('preserves title extraction and hostname fallback', async () => {
  expect((await metadata('<title> <b></b> </title>')).title).toBe('example.com')
  expect((await metadata('<title>unclosed')).title).toBe('example.com')
})

test('handles many malformed title openers without repeated scans', async () => {
  const malformed = '<'.repeat(100_000)
  expect((await metadata(`<title>${malformed}<b>text</b></title>`)).title).toBe(`${malformed}text`)
})
