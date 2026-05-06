import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Root } from 'mdast'

const JP_CHARS_PER_MIN = 400
const EN_WORDS_PER_MIN = 200

function countJapaneseChars(text: string): number {
  return (text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || []).length
}

function countEnglishWords(text: string): number {
  return (text.match(/[a-zA-Z]+/g) || []).length
}

export const remarkReadingTime: Plugin<[], Root> = () => {
  return (tree, file) => {
    let textJpChars = 0
    let textEnWords = 0
    let codeJpChars = 0
    let codeEnWords = 0

    visit(tree, (node) => {
      const value = (node as any).value
      if (!value) return

      if (node.type === 'code') {
        codeJpChars += countJapaneseChars(value)
        codeEnWords += countEnglishWords(value)
      } else if (node.type === 'text') {
        textJpChars += countJapaneseChars(value)
        textEnWords += countEnglishWords(value)
      }
    })

    const textMinutes = textJpChars / JP_CHARS_PER_MIN + textEnWords / EN_WORDS_PER_MIN
    const codeMinutes = (codeJpChars / JP_CHARS_PER_MIN + codeEnWords / EN_WORDS_PER_MIN) * 2
    const totalMinutes = Math.ceil(textMinutes + codeMinutes) || 1

    if (!file.data.frontmatter) {
      file.data.frontmatter = {}
    }
    file.data.frontmatter.readingTime = totalMinutes
  }
}
