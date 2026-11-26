export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin',
  // includeSubDomains はサブドメインの HTTPS 状況を確認してから有効化する
  'Strict-Transport-Security': 'max-age=31536000',
}

// AdSense・Cloudinary・Google Fonts を許可したうえで、まずは Report-Only で違反を観測する。
// インラインスクリプトの nonce/hash 移行が終わったら enforcing に切り替える。
export const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self' https://*.google.com https://*.googlesyndication.com https://*.doubleclick.net",
  "frame-src 'self' https://*.doubleclick.net https://*.googlesyndication.com https://www.youtube.com https://www.youtube-nocookie.com",
].join('; ')
