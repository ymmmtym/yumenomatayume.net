export interface ContactFormInput {
  name: string
  email: string
  subject: string
  message: string
}

export type ContactFormErrors = Partial<Record<keyof ContactFormInput, string>>

export interface ContactFormConfig {
  to: string
  from: string
}

export interface ContactEmail {
  to: string
  from: string
  replyTo: string
  subject: string
  text: string
  html: string
}

export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  subject: 200,
  message: 5000
} as const

// Pragmatic check: a single @, no whitespace, and a domain of non-empty labels
// separated by dots (so `a@example..com` and `a@b@c.com` are rejected).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/

const readField = (raw: Record<string, unknown>, key: string): string =>
  typeof raw[key] === 'string' ? (raw[key] as string).trim() : ''

export function validateContactForm(
  raw: Record<string, unknown>
): { ok: true; value: ContactFormInput } | { ok: false; errors: ContactFormErrors } {
  const value: ContactFormInput = {
    name: readField(raw, 'name'),
    email: readField(raw, 'email'),
    subject: readField(raw, 'subject'),
    message: readField(raw, 'message')
  }

  const errors: ContactFormErrors = {}

  if (!value.name) errors.name = 'お名前を入力してください。'
  else if (value.name.length > CONTACT_LIMITS.name) errors.name = `お名前は${CONTACT_LIMITS.name}文字以内で入力してください。`

  if (!value.email) errors.email = 'メールアドレスを入力してください。'
  else if (value.email.length > CONTACT_LIMITS.email || !EMAIL_PATTERN.test(value.email))
    errors.email = '有効なメールアドレスを入力してください。'

  if (!value.subject) errors.subject = '件名を入力してください。'
  else if (value.subject.length > CONTACT_LIMITS.subject) errors.subject = `件名は${CONTACT_LIMITS.subject}文字以内で入力してください。`

  if (!value.message) errors.message = 'お問い合わせ内容を入力してください。'
  else if (value.message.length > CONTACT_LIMITS.message)
    errors.message = `お問い合わせ内容は${CONTACT_LIMITS.message}文字以内で入力してください。`

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value }
}

// Bots tend to fill every field, including ones hidden from users.
export function isHoneypotTripped(raw: Record<string, unknown>): boolean {
  return readField(raw, 'website') !== ''
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export function buildContactEmail(value: ContactFormInput, config: ContactFormConfig): ContactEmail {
  const text = [
    'お問い合わせフォームより送信されました。',
    '',
    `お名前: ${value.name}`,
    `メールアドレス: ${value.email}`,
    `件名: ${value.subject}`,
    '',
    'お問い合わせ内容:',
    value.message
  ].join('\n')

  const html = [
    '<h2>お問い合わせフォームより送信されました</h2>',
    '<dl>',
    `<dt>お名前</dt><dd>${escapeHtml(value.name)}</dd>`,
    `<dt>メールアドレス</dt><dd>${escapeHtml(value.email)}</dd>`,
    `<dt>件名</dt><dd>${escapeHtml(value.subject)}</dd>`,
    '</dl>',
    `<p>${escapeHtml(value.message).replace(/\n/g, '<br>')}</p>`
  ].join('')

  return {
    to: config.to,
    from: config.from,
    replyTo: value.email,
    subject: `[お問い合わせ] ${value.subject}`,
    text,
    html
  }
}
