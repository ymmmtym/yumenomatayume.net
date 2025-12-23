/**
 * 記事の推定読了時間を計算する
 */
export function calculateReadingTime(content: string): string {
  // contentが文字列でない場合は空文字として扱う
  if (typeof content !== 'string') {
    return '1分未満'
  }
  
  // コードブロックを抽出して除外
  const codeBlockRegex = /```[\s\S]*?```/g
  const inlineCodeRegex = /`[^`]+`/g
  
  // コードブロックの文字数をカウント（通常の50%の速度で計算）
  const codeBlocks = content.match(codeBlockRegex) || []
  const inlineCodes = content.match(inlineCodeRegex) || []
  
  const codeCharCount = [...codeBlocks, ...inlineCodes]
    .join('')
    .replace(/```|`/g, '')
    .length
  
  // コードブロックを除いたテキスト
  const textContent = content
    .replace(codeBlockRegex, '')
    .replace(inlineCodeRegex, '')
    .replace(/---[\s\S]*?---/, '') // frontmatter除去
    .replace(/#+\s/g, '') // マークダウンヘッダー記号除去
    .replace(/\*\*|__|\*|_/g, '') // 強調記号除去
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // リンクテキストのみ残す
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // 画像除去
    .trim()
  
  // 日本語文字数（ひらがな、カタカナ、漢字）
  const japaneseChars = (textContent.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || []).length
  
  // 英語単語数（日本語以外の文字で構成される単語）
  const englishWords = textContent
    .replace(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0).length
  
  // 読了時間計算
  // 日本語: 300文字/分, 英語: 200単語/分, コード: 通常の30%の速度
  const japaneseReadingTime = japaneseChars / 300
  const englishReadingTime = englishWords / 200
  const codeReadingTime = (codeCharCount / 300) * 3.33 // 30%の速度なので3.33倍の時間
  
  const totalMinutes = japaneseReadingTime + englishReadingTime + codeReadingTime
  
  // 1分未満は「1分未満」、それ以外は四捨五入
  if (totalMinutes < 1) {
    return '1分未満'
  }
  
  const roundedMinutes = Math.round(totalMinutes)
  return `約${roundedMinutes}分`
}
