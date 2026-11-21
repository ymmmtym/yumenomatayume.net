import { describe, expect, test } from 'bun:test'
import { isAdExcludedPath } from './ads'

describe('isAdExcludedPath', () => {
  test('excludes the contact form and legacy form URL', () => {
    expect(isAdExcludedPath('/contact')).toBe(true)
    expect(isAdExcludedPath('/form')).toBe(true)
  })

  test('excludes the privacy policy', () => {
    expect(isAdExcludedPath('/privacy')).toBe(true)
  })

  test('excludes tag listing pages', () => {
    expect(isAdExcludedPath('/blog/tag/aws')).toBe(true)
    expect(isAdExcludedPath('/blog/tag/kubernetes')).toBe(true)
  })

  test('ignores a trailing slash', () => {
    expect(isAdExcludedPath('/contact/')).toBe(true)
    expect(isAdExcludedPath('/privacy/')).toBe(true)
    expect(isAdExcludedPath('/blog/tag/aws/')).toBe(true)
  })

  test('keeps ads on content pages', () => {
    expect(isAdExcludedPath('/')).toBe(false)
    expect(isAdExcludedPath('/blog')).toBe(false)
    expect(isAdExcludedPath('/blog/some-post')).toBe(false)
    expect(isAdExcludedPath('/blog/tag')).toBe(false)
  })

  test('does not match look-alike paths', () => {
    expect(isAdExcludedPath('/contact-us')).toBe(false)
    expect(isAdExcludedPath('/privacy-policy')).toBe(false)
    expect(isAdExcludedPath('/blog/tag/aws/extra')).toBe(false)
  })
})
