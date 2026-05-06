import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Root, Code, Text } from 'mdast'

const JP_CHARS_PER_MIN = 400
const EN_WORDS_PER_MIN = 200

function countJpChars(text: string): number {
  return (text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || []).length
}

function countEnWords(text: string): number {
  return (text.match(/[a-zA-Z]+/g) || []).length
}

export const remarkReadingTime: Plugin<[], Root> = () => {
  return (tree, file) => {
    let textJpChars = 0
    let textEnWords = 0
    let codeJpChars = 0
    let codeEnWords = 0

    visit(tree, (node) => {
      if (node.type === 'code') {
        const code = node as Code
        codeJpChars += countJpChars(code.value || '')
        codeEnWords += countEnWords(code.value || '')
      } else if (node.type === 'text') {
        const text = node as Text
        textJpChars += countJpChars(text.value || '')
        textEnWords += countEnWords(text.value || '')
      }
    })

    const textMinutes = textJpChars / JP_CHARS_PER_MIN + textEnWords / EN_WORDS_PER_MIN
    const codeMinutes = (codeJpChars / JP_CHARS_PER_MIN + codeEnWords / EN_WORDS_PER_MIN) * 2
    const totalMinutes = Math.ceil(textMinutes + codeMinutes) || 1

    if (!file.data) file.data = {}
    const data = file.data as { frontmatter?: Record<string, unknown> }
    if (!data.frontmatter) data.frontmatter = {}
    data.frontmatter.readingTime = totalMinutes
  }
}
