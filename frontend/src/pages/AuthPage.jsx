import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { ApiError } from '../api.js'

export default function AuthPage() {
  const { signup, login } = useAuth()
  const [mode, setMode] = useState('signup') // 'signup' | 'login'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('عبّي اسم المستخدم وكلمة المرور')
      return
    }

    setLoading(true)
    try {
      if (mode === 'signup') {
        await signup(username.trim(), password)
      } else {
        await login(username.trim(), password)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('صار خطأ غير متوقع')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <div className="auth-wrap">
        <img src="/logo.png" alt="HU" className="auth-mark" />
        <h1>HU — توصيل وطلبات</h1>
        <p className="tagline">اطلب، أو ساعد غيرك يوصّل طلبه</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="مثلاً: hussein"
            />
          </div>
          <div className="field">
            <label>كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              placeholder="••••••••"
            />
          </div>
          <button className="btn btn-gold btn-block" disabled={loading}>
            {loading ? 'لحظة...' : mode === 'signup' ? 'إنشاء حساب' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'signup' ? (
            <>
              عندك حساب؟{' '}
              <button onClick={() => { setMode('login'); setError('') }}>سجّل دخولك</button>
            </>
          ) : (
            <>
              ما عندك حساب؟{' '}
              <button onClick={() => { setMode('signup'); setError('') }}>سوّي حساب جديد</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
