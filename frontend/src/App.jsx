import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import AuthPage from './pages/AuthPage.jsx'
import HomePage from './pages/HomePage.jsx'
import MyOrdersPage from './pages/MyOrdersPage.jsx'
import TakenPage from './pages/TakenPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import NavBar from './components/NavBar.jsx'

const TITLES = {
  home: 'الرئيسية',
  mine: 'طلباتي',
  taken: 'المأخوذات',
  settings: 'الإعدادات',
}

function Shell() {
  const [tab, setTab] = useState('home')

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
        {tab === 'settings' && <SettingsPage />}
      </div>
      <NavBar active={tab} onChange={setTab} />
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
