import { createRoute } from 'honox/factory'
import { isBlockedBot } from '../utils/botFilter'

export default createRoute(async (c, next) => {
  if (isBlockedBot(c.req.header('user-agent'))) {
    return c.text('Forbidden', 403)
  }
  return next()
})
