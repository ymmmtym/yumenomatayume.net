import { visit } from 'unist-util-visit'
import type { Root } from 'mdast'

const JP_CHARS_PER_MIN = 400
const EN_WORDS_PER_MIN = 200

function countJapaneseChars(text: string): number {
  return (text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || []).length
}

function countEnglishWords(text: string): number {
  return (text.match(/[a-zA-Z]+/g) || []).length
}

export function remarkReadingTime() {
  return (tree: Root, file: any) => {
    let jpChars = 0
    let enWords = 0
    let codeJpChars = 0
    let codeEnWords = 0

    visit(tree, (node: any) => {
      if (node.type === 'code') {
        const text = node.value || ''
        codeJpChars += countJapaneseChars(text)
        codeEnWords += countEnglishWords(text)
      } else if (node.type === 'text') {
        const text = node.value || ''
        jpChars += countJapaneseChars(text)
        enWords += countEnglishWords(text)
      }
    })

    const textMinutes = jpChars / JP_CHARS_PER_MIN + enWords / EN_WORDS_PER_MIN
    const codeMinutes = (codeJpChars / JP_CHARS_PER_MIN + codeEnWords / EN_WORDS_PER_MIN) * 2
    const totalMinutes = Math.ceil(textMinutes + codeMinutes) || 1

    if (!file.data.frontmatter) {
      file.data.frontmatter = {}
    }
    file.data.frontmatter.readingTime = totalMinutes
  }
}
