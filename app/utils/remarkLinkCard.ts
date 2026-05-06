import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Root } from 'mdast'
import { fetchLinkMetadata } from './fetchMetadata'

// MDXでリンクカードを自動変換するプラグイン（remarkGfmより前に実行）
export const remarkLinkCard: Plugin<[], Root> = () => {
  return async (tree) => {
    const promises: Promise<void>[] = []

    visit(tree, 'paragraph', (node, index, parent) => {
      if (!parent || index === undefined) return
      
      // パラグラフが単一の子ノードを持つ場合のみ考慮
      if (node.children.length === 1) {
        const child = node.children[0];
        let urlToConvert: string | undefined;

        const urlRegex = /^https?:\/\/[^\s<>"']+$/;

        if (child.type === 'text') {
          // 純粋なURLテキスト（例: https://example.com）
          const text = child.value.trim();
          if (urlRegex.test(text)) {
            urlToConvert = text;
          }
        } else if (child.type === 'link') {
          // Markdownリンクの場合、リンクテキストがURLそのものと一致する場合のみ LinkCard に変換
          // [テキスト](URL) の場合は LinkCard にしない
          if (child.children.length === 1 && child.children[0].type === 'text') {
             if (child.url.trim() === child.children[0].value.trim() && urlRegex.test(child.url.trim())) {
                 urlToConvert = child.url.trim();
             }
          }
          // <https://example.com> のようなGMFで変換されたリンク（子要素を持たないlinkノード）は
          // この処理の前にtextとして処理されるか、またはこのプラグインでは無視される。
          // ただし、もし子要素がないlinkノードが来た場合は、urlをそのまま使用
          else if (child.children.length === 0) {
            const url = child.url.trim();
            if (urlRegex.test(url)) {
              urlToConvert = url;
            }
          }
        }
        
        if (urlToConvert) {
          const promise = fetchLinkMetadata(urlToConvert).then(metadata => {
            const attributes = [
              {
                type: 'mdxJsxAttribute' as const,
                name: 'url',
                value: urlToConvert
              }
            ]

            // メタデータをpropsとして追加
            if (metadata.title) {
              attributes.push({
                type: 'mdxJsxAttribute' as const,
                name: 'title',
                value: metadata.title
              })
            }
            if (metadata.description) {
              attributes.push({
                type: 'mdxJsxAttribute' as const,
                name: 'description',
                value: metadata.description
              })
            }
            if (metadata.image) {
              attributes.push({
                type: 'mdxJsxAttribute' as const,
                name: 'image',
                value: metadata.image
              })
            }
            if (metadata.favicon) {
              attributes.push({
                type: 'mdxJsxAttribute' as const,
                name: 'favicon',
                value: metadata.favicon
              })
            }
            if (metadata.domain) {
              attributes.push({
                type: 'mdxJsxAttribute' as const,
                name: 'domain',
                value: metadata.domain
              })
            }

            const linkCardNode = {
              type: 'mdxJsxFlowElement',
              name: 'LinkCard',
              attributes,
              children: []
            }
            parent.children[index] = linkCardNode
          }).catch(() => {
            // エラー時はURLのみでLinkCardを作成
            const linkCardNode = {
              type: 'mdxJsxFlowElement',
              name: 'LinkCard',
              attributes: [
                {
                  type: 'mdxJsxAttribute' as const,
                  name: 'url',
                  value: urlToConvert
                }
              ],
              children: []
            }
            parent.children[index] = linkCardNode
          })
          promises.push(promise)
        }
      }
    })

    await Promise.all(promises)
  }
}
