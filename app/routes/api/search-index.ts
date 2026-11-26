import { createRoute } from 'honox/factory'
import { getSearchIndex } from '../../utils/searchIndex'

const CACHE_MAX_AGE_SECONDS = 300

export default createRoute((c) => {
  c.header('Cache-Control', `public, max-age=${CACHE_MAX_AGE_SECONDS}`)
  return c.json(getSearchIndex())
})
