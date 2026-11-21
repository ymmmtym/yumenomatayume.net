// IP だけをキーにすると NAT 配下の利用者をまとめて巻き込むため、パスと組み合わせます。
export function rateLimitKey(path: string, clientIp: string | null | undefined): string {
  return `${path}:${clientIp?.trim() || 'unknown'}`
}

// Cloudflare の Rate Limiting API はロケーション単位の近似カウントです。
// binding 未設定（ローカル開発など）や API 失敗時は素通りさせ、送信自体を止めません。
export async function isRateLimited(limiter: RateLimit | undefined, key: string): Promise<boolean> {
  if (!limiter) return false
  try {
    const { success } = await limiter.limit({ key })
    return !success
  } catch (error) {
    console.error('Rate limit check failed:', error)
    return false
  }
}
