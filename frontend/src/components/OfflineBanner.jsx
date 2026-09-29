import { useEffect, useState } from 'react'
import { timeAgo } from '../utils/time.js'

export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)
  const [staleAt, setStaleAt] = useState(null) // when the saved data we are showing was saved

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    // "stale" = the app is showing a saved copy; keep the oldest time so we never oversell freshness
    const onStale = (e) =>
      setStaleAt((prev) => (prev ? Math.min(prev, e.detail.savedAt) : e.detail.savedAt))
    const onFresh = () => setStaleAt(null)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    window.addEventListener('hu:stale', onStale)
    window.addEventListener('hu:fresh', onFresh)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('hu:stale', onStale)
      window.removeEventListener('hu:fresh', onFresh)
    }
  }, [])

  if (staleAt) {
    return (
      <div className="offline-banner">
        📡 لا يوجد اتصال — هذي آخر بيانات محفوظة ({timeAgo(staleAt)})
      </div>
    )
  }
  if (!online) {
    return <div className="offline-banner">📡 أنت بدون إنترنت — البيانات ما راح تتحدّث</div>
  }
  return null
}
