// 自動広告（Auto ads）を読み込まないパス。
// 薄いページやフォーム、法務ページに広告が出ると AdSense ポリシー違反になり得るため除外します。
// 一覧は README の「広告のページ除外」にも記載しています。
const AD_EXCLUDED_PATTERNS = [/^\/contact$/, /^\/privacy$/, /^\/form$/, /^\/blog\/tag\/[^/]+$/]

export function isAdExcludedPath(path: string): boolean {
  const normalized = path.replace(/\/+$/, '') || '/'
  return AD_EXCLUDED_PATTERNS.some((pattern) => pattern.test(normalized))
}
