/**
 * 見出しテキストからアンカーIDを生成する
 */
export function generateAnchorId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s-]/g, '') // 日本語文字、英数字、スペース、ハイフンのみ残す
    .replace(/\s+/g, '-') // スペースをハイフンに変換
    .replace(/-+/g, '-') // 連続するハイフンを1つに
    .replace(/^-|-$/g, '') // 先頭末尾のハイフンを除去
}

/**
 * 見出しアンカーリンク機能を初期化する
 */
export function initializeHeadingAnchors(): void {
  // ページ読み込み後に実行
  if (typeof window === 'undefined') return
  
  // h2, h3見出しを取得
  const headings = document.querySelectorAll('.prose h2, .prose h3')
  const usedIds = new Set<string>()
  
  headings.forEach((heading) => {
    const text = heading.textContent || ''
    let id = generateAnchorId(text)
    
    // 重複IDの場合は連番を付与
    let counter = 1
    let uniqueId = id
    while (usedIds.has(uniqueId)) {
      uniqueId = `${id}-${counter}`
      counter++
    }
    usedIds.add(uniqueId)
    
    // IDを設定
    heading.id = uniqueId
    
    // アンカーリンクボタンを追加
    const anchorLink = document.createElement('a')
    anchorLink.href = `#${uniqueId}`
    anchorLink.className = 'anchor-link'
    anchorLink.innerHTML = '#'
    anchorLink.setAttribute('aria-label', `${text}へのリンク`)
    
    // クリック時の処理
    anchorLink.addEventListener('click', (e) => {
      e.preventDefault()
      
      // URLを更新
      const url = new URL(window.location.href)
      url.hash = uniqueId
      window.history.pushState({}, '', url.toString())
      
      // スムーススクロール
      heading.scrollIntoView({ behavior: 'smooth' })
      
      // URLをクリップボードにコピー
      navigator.clipboard.writeText(url.toString()).then(() => {
        // コピー完了の視覚的フィードバック
        const tooltip = document.createElement('div')
        tooltip.textContent = 'リンクをコピーしました！'
        tooltip.className = 'copy-tooltip'
        document.body.appendChild(tooltip)
        
        // ツールチップの位置を設定
        const rect = anchorLink.getBoundingClientRect()
        tooltip.style.left = `${rect.left}px`
        tooltip.style.top = `${rect.top - 40}px`
        
        // 2秒後にツールチップを削除
        setTimeout(() => {
          tooltip.remove()
        }, 2000)
      }).catch(() => {
        console.log('クリップボードへのコピーに失敗しました')
      })
    })
    
    // 見出しにアンカーリンクを追加
    heading.style.position = 'relative'
    heading.appendChild(anchorLink)
  })
  
  // ページ読み込み時にアンカーがある場合はスクロール
  if (window.location.hash) {
    const targetId = window.location.hash.slice(1)
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      setTimeout(() => {
        targetElement.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }
}
