import { describe, expect, test } from 'bun:test'
import {
  buildContactEmail,
  isHoneypotTripped,
  validateContactForm
} from './contactForm'

const valid = {
  name: '山田太郎',
  email: 'taro@example.com',
  subject: 'お問い合わせ',
  message: 'はじめまして。記事について質問があります。'
}

describe('validateContactForm', () => {
  test('accepts a complete submission', () => {
    const result = validateContactForm(valid)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value).toEqual(valid)
  })

  test('trims surrounding whitespace', () => {
    const result = validateContactForm({ ...valid, name: '  山田  ', message: '  本文  ' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.name).toBe('山田')
      expect(result.value.message).toBe('本文')
    }
  })

  test('reports every missing field', () => {
    const result = validateContactForm({})
    expect(result.ok).toBe(false)
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(['email', 'message', 'name', 'subject'])
  })

  test('rejects malformed email addresses', () => {
    for (const email of ['foo', 'foo@bar', 'foo bar@example.com', 'a@b@c.com', '@example.com']) {
      const result = validateContactForm({ ...valid, email })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.errors.email).toBeDefined()
    }
  })

  test('accepts email addresses with plus tags and subdomains', () => {
    for (const email of ['a+b@example.com', 'user@mail.example.co.jp']) {
      expect(validateContactForm({ ...valid, email }).ok).toBe(true)
    }
  })

  test('enforces length limits', () => {
    expect(validateContactForm({ ...valid, name: 'a'.repeat(101) }).ok).toBe(false)
    expect(validateContactForm({ ...valid, subject: 'a'.repeat(201) }).ok).toBe(false)
    expect(validateContactForm({ ...valid, message: 'a'.repeat(5001) }).ok).toBe(false)
    expect(validateContactForm({ ...valid, name: 'a'.repeat(100) }).ok).toBe(true)
  })

  test('ignores non-string field values', () => {
    const result = validateContactForm({ ...valid, name: 42 as unknown as string })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.name).toBeDefined()
  })
})

describe('isHoneypotTripped', () => {
  test('is false when the hidden field is empty or absent', () => {
    expect(isHoneypotTripped({})).toBe(false)
    expect(isHoneypotTripped({ website: '' })).toBe(false)
    expect(isHoneypotTripped({ website: '   ' })).toBe(false)
  })

  test('is true when the hidden field is filled', () => {
    expect(isHoneypotTripped({ website: 'https://spam.example' })).toBe(true)
  })
})

describe('buildContactEmail', () => {
  const config = { to: 'owner@example.com', from: 'noreply@example.com' }

  test('routes to the owner and sets reply-to to the sender', () => {
    const email = buildContactEmail(valid, config)
    expect(email.to).toBe('owner@example.com')
    expect(email.from).toBe('noreply@example.com')
    expect(email.replyTo).toBe('taro@example.com')
    expect(email.subject).toBe('[お問い合わせ] お問い合わせ')
  })

  test('includes the message in both text and html parts', () => {
    const email = buildContactEmail(valid, config)
    expect(email.text).toContain(valid.message)
    expect(email.html).toContain(valid.message)
  })

  test('escapes HTML in user input to prevent injection', () => {
    const email = buildContactEmail(
      { ...valid, message: '<script>alert(1)</script>', name: 'a & b' },
      config
    )
    expect(email.html).not.toContain('<script>')
    expect(email.html).toContain('&lt;script&gt;')
    expect(email.html).toContain('a &amp; b')
  })
})
