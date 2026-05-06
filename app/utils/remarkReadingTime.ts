import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Root } from 'mdast'

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
    let jpChars = 0
    let enWords = 0
    let codeJpChars = 0
    let codeEnWords = 0

    visit(tree, (node: any) => {
      if (node.type === 'code' || node.type === 'inlineCode') {
        const text = node.value || ''
        codeJpChars += countJpChars(text)
        codeEnWords += countEnWords(text)
      } else if (node.type === 'text') {
        const text = node.value || ''
        jpChars += countJpChars(text)
        enWords += countEnWords(text)
      }
    })

    const textMinutes = jpChars / JP_CHARS_PER_MIN + enWords / EN_WORDS_PER_MIN
    const codeMinutes = codeJpChars / JP_CHARS_PER_MIN + codeEnWords / EN_WORDS_PER_MIN

    const totalMinutes = Math.ceil(textMinutes + codeMinutes) || 1

    if (!file.data.frontmatter) {
      file.data.frontmatter = {}
    }
    ;(file.data.frontmatter as Record<string, unknown>).readingTime = totalMinutes
  }
}
