import type { Plugin } from 'unified'
import type { Root } from 'mdast'
import { visit } from 'unist-util-visit'

const JP_CHARS_PER_MIN = 400
const EN_WORDS_PER_MIN = 200

export const remarkReadingTime: Plugin<[], Root> = () => {
  return (tree, file) => {
    let jpChars = 0
    let enWords = 0
    let codeJpChars = 0
    let codeEnWords = 0

    visit(tree, (node: any) => {
      const text = node.value || ''
      if (!text) return

      const jpCount = (text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || []).length
      const enCount = (text.match(/[a-zA-Z]+/g) || []).length

      if (node.type === 'code') {
        codeJpChars += jpCount
        codeEnWords += enCount
      } else if (node.type === 'text') {
        jpChars += jpCount
        enWords += enCount
      }
    })

    const textMinutes = jpChars / JP_CHARS_PER_MIN + enWords / EN_WORDS_PER_MIN
    const codeMinutes = (codeJpChars / JP_CHARS_PER_MIN + codeEnWords / EN_WORDS_PER_MIN) * 2
    const totalMinutes = Math.ceil(textMinutes + codeMinutes) || 1

    if (!file.data) file.data = {}
    if (!file.data.frontmatter) file.data.frontmatter = {}
    file.data.frontmatter.readingTime = totalMinutes
  }
}
