import { expect, test } from 'bun:test'
import { CSP_REPORT_ONLY, SECURITY_HEADERS, applySecurityHeaders } from './securityHeaders'

test('sets the baseline security headers', () => {
  expect(SECURITY_HEADERS).toMatchObject({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-Frame-Options': 'DENY',
    'Cross-Origin-Opener-Policy': 'same-origin',
  })
  expect(SECURITY_HEADERS['Strict-Transport-Security']).toMatch(/^max-age=\d+/)
})

test('CSP report-only policy keeps the third-party origins in use', () => {
  for (const origin of [
    'https://pagead2.googlesyndication.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://res.cloudinary.com',
  ]) {
    // Cloudinary は img-src の https: ワイルドカードで許可している
    if (origin === 'https://res.cloudinary.com') {
      expect(CSP_REPORT_ONLY).toContain('img-src')
      expect(CSP_REPORT_ONLY).toContain('https:')
      continue
    }
    expect(CSP_REPORT_ONLY).toContain(origin)
  }
  expect(CSP_REPORT_ONLY).toContain("frame-ancestors 'none'")
  expect(CSP_REPORT_ONLY).toContain("object-src 'none'")
})

test('applySecurityHeaders sets every header including the report-only policy', () => {
  const applied = new Map<string, string>()
  applySecurityHeaders((name, value) => applied.set(name, value))
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) expect(applied.get(name)).toBe(value)
  expect(applied.get('Content-Security-Policy-Report-Only')).toBe(CSP_REPORT_ONLY)
})
