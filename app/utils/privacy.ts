// プライバシーポリシーの最終改訂日（ISO 8601）。ページ本文と sitemap の lastmod で共有します。
export const PRIVACY_LAST_UPDATED = '2026-11-16'

export function formatJapaneseDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${year}年${Number(month)}月${Number(day)}日`
}
