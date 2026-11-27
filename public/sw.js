const VERSION = 'v1'
const STATIC_CACHE = `static-${VERSION}`
const PAGE_CACHE = `pages-${VERSION}`
const OFFLINE_URL = '/offline'
// オフライン表示に必須のものと、失敗しても致命的でないもの
const PRECACHE_REQUIRED = [OFFLINE_URL]
const PRECACHE_OPTIONAL = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png']
const KEEP_STATIC = [...PRECACHE_REQUIRED, ...PRECACHE_OPTIONAL]
const MAX_PAGES = 50
const MAX_STATIC = 120

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE)
      // フォールバックを欠いたまま有効化しないよう、/offline だけは必須にする
      await cache.add(OFFLINE_URL)
      await Promise.all(PRECACHE_OPTIONAL.map((url) => cache.add(url).catch(() => {})))
      await self.skipWaiting()
    })()
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== PAGE_CACHE)
          .map((key) => caches.delete(key).catch(() => {}))
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
  let response
  try {
    response = await fetch(request)
  } catch (error) {
    const fallback = await findFallback(request)
    if (fallback) return fallback
    throw error
  }

  if (response.ok) await saveToCache(PAGE_CACHE, request, response, MAX_PAGES, ['/', OFFLINE_URL])
  return response
}

// install 時に precache した / なども拾えるよう、全キャッシュを対象に探す
async function findFallback(request) {
  try {
    return (await caches.match(request)) || (await caches.match(OFFLINE_URL)) || null
  } catch {
    return null
  }
}

async function staleWhileRevalidate(request, event) {
  const cached = await caches.match(request).catch(() => undefined)
  if (cached) {
    event.waitUntil(refresh(request))
    return cached
  }

  const response = await fetch(request)
  if (response.ok) await saveToCache(STATIC_CACHE, request, response, MAX_STATIC, KEEP_STATIC)
  return response
}

async function refresh(request) {
  try {
    const response = await fetch(request)
    if (response.ok) await saveToCache(STATIC_CACHE, request, response, MAX_STATIC, KEEP_STATIC)
  } catch {
    // オフライン時はキャッシュをそのまま使い続ける
  }
}

// キャッシュ更新の失敗で、取得できたレスポンスを落とさない
async function saveToCache(cacheName, request, response, max, keep) {
  try {
    const cache = await caches.open(cacheName)
    await cache.put(request, response.clone())
    await trimCache(cache, max, keep)
  } catch {
    // ストレージ不足などは無視する
  }
}

// 古いハッシュ付きアセットなどが溜まり続けないよう、挿入順で古いものから捨てる
async function trimCache(cache, max, keep) {
  const keys = await cache.keys()
  if (keys.length <= max) return
  const removable = keys.filter((key) => !keep.includes(new URL(key.url).pathname))
  await Promise.all(removable.slice(0, keys.length - max).map((key) => cache.delete(key)))
}
