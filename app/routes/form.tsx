import { createRoute } from 'honox/factory'

// /form は /contact へ移行しました。旧 URL（外部リンク・検索結果）を残さないため恒久リダイレクトします。
export default createRoute((c) => c.redirect('/contact', 301))

// POST は 308 でメソッドと本文を保持したまま /contact へ引き継ぎます。
export const POST = createRoute((c) => c.redirect('/contact', 308))
