import { createRoute } from 'honox/factory'

// 旧お問い合わせ URL。ブックマークや被リンクからの流入を /contact に流す。
export default createRoute((c) => c.redirect('/contact', 301))
