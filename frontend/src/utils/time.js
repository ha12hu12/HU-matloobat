export function timeAgo(isoString) {
  if (!isoString) return ''
  const then = new Date(isoString).getTime()
  const now = Date.now()
  const diffSec = Math.floor((now - then) / 1000)

  if (diffSec < 60) return 'الآن'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `قبل ${diffMin} د`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `قبل ${diffHour} س`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 30) return `قبل ${diffDay} يوم`
  const diffMonth = Math.floor(diffDay / 30)
  return `قبل ${diffMonth} شهر`
}
