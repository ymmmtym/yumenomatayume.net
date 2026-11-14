import { fromMarkdown } from 'mdast-util-from-markdown'
import { visit } from 'unist-util-visit'

// Only strip tags in HTML nodes; Markdown code nodes retain their literal text.
export function prepareSearchBody(body: string): string {
  const htmlRanges: Array<{ start: number; end: number }> = []
  visit(fromMarkdown(body), 'html', (node) => {
    const start = node.position?.start.offset
    const end = node.position?.end.offset
    if (start !== undefined && end !== undefined) htmlRanges.push({ start, end })
  })
  let result = ''
  let offset = 0
  for (const { start, end } of htmlRanges) {
    result += body.slice(offset, start) + body.slice(start, end).replace(/<[^>]*>/g, '')
    offset = end
  }
  return result + body.slice(offset)
}
