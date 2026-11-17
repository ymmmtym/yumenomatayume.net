// AI training crawlers, SEO suites, and generic scrapers.
const BLOCKED_BOT_PATTERNS = [
  // AI / LLM crawlers
  'gptbot',
  'oai-searchbot',
  'chatgpt-user',
  'anthropic-ai',
  'claudebot',
  'claude-web',
  'google-extended',
  'ccbot',
  'perplexitybot',
  'bytespider',
  'amazonbot',
  'applebot-extended',
  'meta-externalagent',
  'facebookbot',
  'diffbot',
  'cohere-ai',
  'youbot',
  'imagesiftbot',
  'omgilibot',
  'timpibot',
  'ai2bot',
  'pangubot',
  'petalbot',
  // SEO / marketing crawlers
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'dotbot',
  'dataforseobot',
  'blexbot',
  'magpie-crawler',
  'screaming frog',
  // Generic scrapers and vulnerability scanners
  'scrapy',
  'httrack',
  'zgrab',
  'masscan',
  'censysinspect',
  'netsystemsresearch',
  'expanse',
  'internet-measurement'
]

/**
 * Match the whole User-Agent string. Search engines (Googlebot, Bingbot, ...)
 * and social/link-preview bots are intentionally absent, so they are served
 * normally. "Applebot-Extended" (AI training) is blocked while "Applebot"
 * (search) is allowed because the patterns are matched literally.
 */
export function isBlockedBot(userAgent: string | undefined): boolean {
  if (!userAgent) return false
  const ua = userAgent.toLowerCase()
  return BLOCKED_BOT_PATTERNS.some((pattern) => ua.includes(pattern))
}
