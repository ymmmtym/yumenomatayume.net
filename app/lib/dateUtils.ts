export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getUpdateStatus(pubDate: string, updatedDate?: string) {
  if (!updatedDate) return { showUpdated: false, isRecent: false }
  const pub = new Date(pubDate)
  const updated = new Date(updatedDate)
  const showUpdated = updated > pub
  const isRecent = showUpdated && (Date.now() - updated.getTime()) < 7 * 24 * 60 * 60 * 1000
  return { showUpdated, isRecent }
}

export function getDisplayDate(pubDate: string, updatedDate?: string): string {
  if (!updatedDate) return formatDate(pubDate)
  const pub = new Date(pubDate)
  const updated = new Date(updatedDate)
  if (updated <= pub) return formatDate(pubDate)
  return `${formatDate(pubDate)} (更新: ${formatDate(updatedDate)})`
}
