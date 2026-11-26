import { expect, test } from 'bun:test'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { visit } from 'unist-util-visit'

const BLOG_DIR = join(import.meta.dir, '../content/blog')
const FILES = readdirSync(BLOG_DIR).filter((name) => /\.mdx?$/.test(name)).sort()

interface Article {
  frontmatter: Record<string, unknown>
  body: string
}

function readArticle(name: string): Article {
  const raw = readFileSync(join(BLOG_DIR, name), 'utf-8')
  const match = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/.exec(raw)
  if (!match) throw new Error(`${name}: frontmatter not found`)
  return { frontmatter: (parse(match[1]) ?? {}) as Record<string, unknown>, body: match[2] }
}

export interface Heading {
  line: number
  level: number
  text: string
}

function nodeText(node: unknown): string {
  const current = node as { value?: string; alt?: string; children?: unknown[] }
  if (typeof current.value === 'string') return current.value
  // image / imageReference は alt にしか文字を持たない
  if (typeof current.alt === 'string') return current.alt
  return (current.children ?? []).map(nodeText).join('')
}

/**
 * 見出しを Markdown パーサから取得する。コードブロック（リスト内のフェンスを含む）や
 * インデント、末尾の閉じ # の扱いは CommonMark の実装に任せる。
 */
export function headings(body: string): Heading[] {
  const found: Heading[] = []
  visit(fromMarkdown(body), 'heading', (node) => {
    found.push({ line: node.position?.start.line ?? 0, level: node.depth, text: nodeText(node).trim() })
  })
  return found
}

test('all articles have complete frontmatter', () => {
  const problems: string[] = []
  for (const name of FILES) {
    const { frontmatter } = readArticle(name)
    const description = typeof frontmatter.description === 'string' ? frontmatter.description.trim() : ''
    if (typeof frontmatter.title !== 'string' || frontmatter.title.trim() === '') problems.push(`${name}: title がありません`)
    // meta description のフォールバック（サイト共通文言）に落ちないよう、空・極端に短い説明を禁止する
    if (description.length < 10) problems.push(`${name}: description が空か短すぎます (${description.length} 文字)`)
    if (typeof frontmatter.pubDate !== 'string' || Number.isNaN(new Date(frontmatter.pubDate).getTime())) {
      problems.push(`${name}: pubDate が不正です`)
    }
    const tags = frontmatter.tags
    if (!Array.isArray(tags) || tags.length === 0 || tags.some((tag) => typeof tag !== 'string' || tag.trim() === '')) {
      problems.push(`${name}: tags が空か不正です`)
    }
  }
  expect(problems).toEqual([])
})

test('article bodies have no empty headings and no h1', () => {
  const problems: string[] = []
  for (const name of FILES) {
    for (const heading of headings(readArticle(name).body)) {
      if (heading.text === '') problems.push(`${name}:${heading.line}: 空の見出しがあります`)
      if (heading.level === 1) problems.push(`${name}:${heading.line}: 本文に h1 があります（タイトルは layout 側で出力されます）`)
    }
  }
  expect(problems).toEqual([])
})

test('headings ignores fences longer than the closing fence', () => {
  const body = ['````', '```', '# example', '````'].join('\n')
  expect(headings(body)).toEqual([])
})

test('headings keeps image alternative text and rejects truly empty headings', () => {
  expect(headings('## ![Architecture](architecture.png)')).toEqual([
    { line: 1, level: 2, text: 'Architecture' },
  ])
  expect(headings('##')).toEqual([{ line: 1, level: 2, text: '' }])
})

test('headings ignores fenced code inside list items', () => {
  const body = ['- ```', '  # example', '  ```'].join('\n')
  expect(headings(body)).toEqual([])
})

test('headings allows indented headings and strips closing hashes', () => {
  const body = ['  # Extra title', '## ##', '## foo ##', '## C#', '#nope'].join('\n')
  expect(headings(body)).toEqual([
    { line: 1, level: 1, text: 'Extra title' },
    { line: 2, level: 2, text: '' },
    { line: 3, level: 2, text: 'foo' },
    { line: 4, level: 2, text: 'C#' },
  ])
})

test('headings accepts ordinary non-empty h2 headings', () => {
  expect(headings('## まとめ')).toEqual([{ line: 1, level: 2, text: 'まとめ' }])
})
