import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import AuthPage from './pages/AuthPage.jsx'
import HomePage from './pages/HomePage.jsx'
import MyOrdersPage from './pages/MyOrdersPage.jsx'
import TakenPage from './pages/TakenPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import NavBar from './components/NavBar.jsx'
import NewsSheet from './components/NewsSheet.jsx'

const TITLES = {
  home: 'الرئيسية',
  mine: 'طلباتي',
  taken: 'المأخوذات',
  settings: 'الإعدادات',
}

const NEWS_VERSION = 'v1'

function Shell() {
  const [tab, setTab] = useState('home')
  const [showNews, setShowNews] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('hu_seen_news') !== NEWS_VERSION) {
      setShowNews(true)
    }
  }, [])

  function closeNews() {
    localStorage.setItem('hu_seen_news', NEWS_VERSION)
    setShowNews(false)
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <img src="/logo.png" className="mark" alt="HU" />
        <h1>{TITLES[tab]}</h1>
      </div>
      <div className="main-scroll">
        {tab === 'home' && <HomePage />}
        {tab === 'mine' && <MyOrdersPage />}
        {tab === 'taken' && <TakenPage />}
        {tab === 'settings' && <SettingsPage onShowNews={() => setShowNews(true)} />}
      </div>
      <NavBar active={tab} onChange={setTab} />
      {showNews && <NewsSheet onClose={closeNews} />}
    </div>
  )
}

function Root() {
  const { ready, isAuthed } = useAuth()
  useTheme() // ensures data-theme is applied before first paint of content

  if (!ready) {
    return (
      <div className="app-shell">
        <div className="loading-dot" style={{ margin: 'auto' }}>
          جارٍ التحميل...
        </div>
      </div>
    )
  }

  return isAuthed ? <Shell /> : <AuthPage />
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Root />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
