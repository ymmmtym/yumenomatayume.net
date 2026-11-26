import { createRoute } from 'honox/factory'
import { isBlockedBot } from '../utils/botFilter'
import { CSP_REPORT_ONLY, SECURITY_HEADERS } from '../utils/securityHeaders'

export default createRoute(async (c, next) => {
  if (isBlockedBot(c.req.header('user-agent'))) {
    return c.text('Forbidden', 403)
  }
  await next()
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    c.header(name, value)
  }
  c.header('Content-Security-Policy-Report-Only', CSP_REPORT_ONLY)
})
