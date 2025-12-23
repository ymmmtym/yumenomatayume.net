import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Root } from 'mdast'

// MDXでリンクカードを自動変換するプラグイン（remarkGfmより前に実行）
export const remarkLinkCard: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'paragraph', (node, index, parent) => {
      if (!parent || index === undefined) return
      
      // パラグラフが単一のテキストノードで、それがURLの場合
      if (node.children.length === 1 && node.children[0].type === 'text') {
        const text = node.children[0].value.trim()
        const urlRegex = /^https?:\/\/[^\s<>"']+$/
        
        if (urlRegex.test(text)) {
          // LinkCardコンポーネントに置換
          const linkCardNode = {
            type: 'mdxJsxFlowElement',
            name: 'LinkCard',
            attributes: [
              {
                type: 'mdxJsxAttribute',
                name: 'url',
                value: text
              }
            ],
            children: []
          }
          
          parent.children[index] = linkCardNode
        }
      }
    })
  }
}
