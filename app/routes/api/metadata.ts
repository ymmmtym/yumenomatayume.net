import { createRoute } from 'honox/factory'
import { fetchLinkMetadata } from '../../app/utils/fetchMetadata'

export default createRoute(async (c) => {
  const url = c.req.query('url')
  
  if (!url) {
    return c.json({ error: 'URL parameter is required' }, 400)
  }
  
  try {
    // URLの妥当性をチェック
    new URL(url)
    
    const metadata = await fetchLinkMetadata(url)
    return c.json(metadata)
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return c.json({ 
      url,
      title: new URL(url).hostname,
      domain: new URL(url).hostname
    })
  }
})
