import { expect, test } from 'bun:test'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'

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

/** 見出し行を返す。コードブロック（``` / ~~~）の中は対象外 */
function headings(body: string): { line: number; level: number; text: string }[] {
  const found: { line: number; level: number; text: string }[] = []
  let fence: string | null = null
  body.split(/\r?\n/).forEach((line, index) => {
    const fenceMatch = /^\s{0,3}(`{3,}|~{3,})/.exec(line)
    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1][0]
      else if (fence === fenceMatch[1][0]) fence = null
      return
    }
    if (fence) return
    const heading = /^(#{1,6})(?:[ \t]+(.*))?$/.exec(line)
    if (heading) found.push({ line: index + 1, level: heading[1].length, text: (heading[2] ?? '').trim() })
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
