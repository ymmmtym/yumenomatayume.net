import { visit } from 'unist-util-visit'
import type { Root } from 'mdast'

export function remarkReadingTime() {
  return (tree: Root, file: any) => {
    let jpChars = 0
    let enWords = 0
    let codeJpChars = 0
    let codeEnWords = 0
    
    visit(tree, (node: any) => {
      if (node.type === 'code' || node.type === 'html') {
        const text = node.value || ''
        codeJpChars += (text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || []).length
        codeEnWords += (text.match(/[a-zA-Z]+/g) || []).length
      } else if (node.type === 'text') {
        const text = node.value || ''
        jpChars += (text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || []).length
        enWords += (text.match(/[a-zA-Z]+/g) || []).length
      }
    })
    
    const JP_CHARS_PER_MIN = 400
    const EN_WORDS_PER_MIN = 200
    
    const textMinutes = jpChars / JP_CHARS_PER_MIN + enWords / EN_WORDS_PER_MIN
    const codeMinutes = (codeJpChars / JP_CHARS_PER_MIN + codeEnWords / EN_WORDS_PER_MIN) * 2
    
    const totalMinutes = textMinutes + codeMinutes
    
    if (!file.data.frontmatter) {
      file.data.frontmatter = {}
    }
    file.data.frontmatter.readingTime = totalMinutes
  }
}
