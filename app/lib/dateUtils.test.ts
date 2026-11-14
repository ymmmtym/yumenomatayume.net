import { afterEach, expect, setSystemTime, test } from 'bun:test'
import { getUpdateStatus } from './dateUtils'

afterEach(() => setSystemTime())

test.each([
  ['2026-11-13T15:00:00.000Z', true], // Midnight JST, still yesterday in UTC
  ['2026-11-13T18:00:00.000Z', true], // Early morning JST
  ['2026-11-20T14:59:59.999Z', true], // Just under seven days
  ['2026-11-20T15:00:00.000Z', false], // Exactly seven days
  ['2026-11-13T14:59:59.999Z', false], // Still future-dated in JST
])('date-only recency at %s', (now, isRecent) => {
  setSystemTime(new Date(now))
  expect(getUpdateStatus('2026-11-01', '2026-11-14')).toEqual({
    showUpdated: true,
    isRecent,
  })
})

test('preserves the publication comparison and missing update behavior', () => {
  setSystemTime(new Date('2026-11-14T01:00:00Z'))
  for (const updated of [undefined, '2026-11-14', '2026-11-13']) {
    expect(getUpdateStatus('2026-11-14', updated)).toEqual({
      showUpdated: false,
      isRecent: false,
    })
  }
  expect(getUpdateStatus('2026-11-13T23:00:00Z', '2026-11-14')).toEqual({
    showUpdated: true,
    isRecent: true,
  })
})

test('preserves explicit timestamp recency and future rejection', () => {
  setSystemTime(new Date('2026-11-14T00:00:00Z'))
  for (const [updated, isRecent] of [
    ['2026-11-14T09:00:00+09:00', true],
    ['2026-11-14T00:00:00.001Z', false],
    ['2026-11-07T00:00:00Z', false],
  ] as const) {
    expect(getUpdateStatus('2026-11-01', updated)).toEqual({
      showUpdated: true,
      isRecent,
    })
  }
})
