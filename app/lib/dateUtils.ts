export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(/^\d{4}-\d{2}-\d{2}$/.test(date) ? { timeZone: 'UTC' } : {}),
  })
}

export function getUpdateStatus(pubDate: string, updatedDate?: string) {
  if (!updatedDate) return { showUpdated: false, isRecent: false }
  const pub = new Date(pubDate)
  const updated = new Date(updatedDate)
  const showUpdated = updated > pub
  // Date-only updates start at midnight in Japan (JST).
  const updatedTime = /^\d{4}-\d{2}-\d{2}$/.test(updatedDate)
    ? new Date(`${updatedDate}T00:00:00+09:00`).getTime()
    : updated.getTime()
  const age = Date.now() - updatedTime
  const isRecent = showUpdated && age >= 0 && age < 7 * 24 * 60 * 60 * 1000
  return { showUpdated, isRecent }
}
