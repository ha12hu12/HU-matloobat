import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { api, ApiError } from '../api.js'
import Sheet from '../components/Sheet.jsx'

export default function SettingsPage() {
  const { username, logout, renameLocal } = useAuth()
  const { isDark, toggle } = useTheme()
  const { show } = useToast()

  const [editing, setEditing] = useState(null) // 'username' | 'password' | null

  return (
    <>
      <div className="card">
        <div className="settings-row">
          <div>
            <div className="label">الوضع الليلي</div>
            <div className="hint">{isDark ? 'مفعّل' : 'غير مفعّل'}</div>
          </div>
          <button className={`switch ${isDark ? 'on' : ''}`} onClick={toggle} />
        </div>
      </div>

      <div className="card">
        <div className="settings-row" onClick={() => setEditing('username')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="label">اسم المستخدم</div>
            <div className="hint">{username}</div>
          </div>
          <span className="icon-btn">✎</span>
        </div>
        <div className="settings-row" onClick={() => setEditing('password')} style={{ cursor: 'pointer' }}>
          <div className="label">تغيير كلمة المرور</div>
          <span className="icon-btn">✎</span>
        </div>
      </div>

      <button className="btn btn-danger btn-block" onClick={logout}>
        تسجيل الخروج
      </button>

      {editing === 'username' && (
        <ChangeUsernameSheet
          current={username}
          onClose={() => setEditing(null)}
          onSaved={(u) => {
            renameLocal(u)
            show('تم تغيير اسم المستخدم')
            setEditing(null)
          }}
        />
      )}

      {editing === 'password' && (
        <ChangePasswordSheet
          onClose={() => setEditing(null)}
          onSaved={() => {
            show('تم تغيير كلمة المرور')
            setEditing(null)
          }}
        />
      )}
    </>
  )
}

function ChangeUsernameSheet({ current, onClose, onSaved }) {
  const [value, setValue] = useState(current)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim()) return setError('اكتب اسم مستخدم')
    setLoading(true)
    setError('')
    try {
      const res = await api.updateUsername(value.trim())
      onSaved(res.username)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'صار خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet title="تغيير اسم المستخدم" onClose={onClose}>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>اسم المستخدم الجديد</label>
          <input value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <button className="btn btn-gold btn-block" disabled={loading}>
          {loading ? 'لحظة...' : 'حفظ'}
        </button>
      </form>
    </Sheet>
  )
}

function ChangePasswordSheet({ onClose, onSaved }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!current || !next) return setError('عبّي كل الحقول')
    if (next !== confirm) return setError('كلمة المرور الجديدة مو متطابقة')
    setLoading(true)
    setError('')
    try {
      await api.updatePassword(current, next)
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'صار خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet title="تغيير كلمة المرور" onClose={onClose}>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>كلمة المرور الحالية</label>
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div className="field">
          <label>كلمة المرور الجديدة</label>
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
        </div>
        <div className="field">
          <label>تأكيد كلمة المرور الجديدة</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <button className="btn btn-gold btn-block" disabled={loading}>
          {loading ? 'لحظة...' : 'حفظ'}
        </button>
      </form>
    </Sheet>
  )
}
