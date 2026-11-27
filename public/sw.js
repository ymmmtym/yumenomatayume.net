const VERSION = 'v1'
const STATIC_CACHE = `static-${VERSION}`
const PAGE_CACHE = `pages-${VERSION}`
const OFFLINE_URL = '/offline'
const PRECACHE_URLS = ['/', OFFLINE_URL, '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png']
const MAX_PAGES = 50
const MAX_STATIC = 120

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE)
      // 1 件でも失敗すると SW が有効化されなくなるため、個別に追加して失敗は無視する
      await Promise.all(PRECACHE_URLS.map((url) => cache.add(url).catch(() => {})))
      await self.skipWaiting()
    })()
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((key) => key !== STATIC_CACHE && key !== PAGE_CACHE).map((key) => caches.delete(key))
      )
      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  // 他オリジン（広告・フォント・Cloudinary）と API はブラウザに任せる
  if (url.origin !== self.location.origin) return
  if (url.pathname === '/sw.js' || url.pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request))
    return
  }
  if (isStaticAsset(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, event))
  }
})

function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/static/') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/images/') ||
    pathname === '/manifest.webmanifest' ||
    /\.(?:css|m?js|png|jpe?g|gif|svg|webp|avif|ico|woff2?)$/i.test(pathname)
  )
}

// 記事は常に最新を取りに行き、オフライン時だけキャッシュにフォールバックする
async function handleNavigation(request) {
  const cache = await caches.open(PAGE_CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) {
      await cache.put(request, response.clone())
      await trimCache(cache, MAX_PAGES, ['/', OFFLINE_URL])
    }
    return response
  } catch (error) {
    const cached = await cache.match(request)
    if (cached) return cached
    const offline = await caches.match(OFFLINE_URL)
    if (offline) return offline
    throw error
  }
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone())
        await trimCache(cache, MAX_STATIC, PRECACHE_URLS)
      }
      return response
    })
    .catch((error) => {
      if (cached) return cached
      throw error
    })

  if (cached) {
    event.waitUntil(network.catch(() => {}))
    return cached
  }
  return network
}

// 古いハッシュ付きアセットなどが溜まり続けないよう、挿入順で古いものから捨てる
async function trimCache(cache, max, keep) {
  const keys = await cache.keys()
  if (keys.length <= max) return
  const removable = keys.filter((key) => !keep.includes(new URL(key.url).pathname))
  await Promise.all(removable.slice(0, keys.length - max).map((key) => cache.delete(key)))
}
