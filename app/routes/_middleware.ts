import { createRoute } from 'honox/factory'
import { isBlockedBot } from '../utils/botFilter'
import { applySecurityHeaders } from '../utils/securityHeaders'

export default createRoute(async (c, next) => {
  const setHeader = (name: string, value: string) => c.header(name, value)

  // ブロックした 403 も含め、すべてのレスポンスに同じヘッダーを付ける
  if (isBlockedBot(c.req.header('user-agent'))) {
    applySecurityHeaders(setHeader)
    return c.text('Forbidden', 403)
  }

  await next()
  applySecurityHeaders(setHeader)
})
