import { useState } from 'react'
import Sheet from './Sheet.jsx'
import { api, ApiError } from '../api.js'
import { useToast } from '../context/ToastContext.jsx'

export default function OrderEditSheet({ order, onClose, onChanged }) {
  const { show } = useToast()
  const [orderName, setOrderName] = useState(order.order_name)
  const [desc, setDesc] = useState(order.desc || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    if (!orderName.trim()) return setError('اكتب اسم الطلب')
    setSaving(true)
    setError('')
    try {
      await api.updateOrder(order.id, { order_name: orderName.trim(), desc: desc.trim() || undefined })
      show('تم الحفظ')
      onChanged?.()
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'صار خطأ')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('تحذف هذا الطلب؟')) return
    try {
      await api.deleteOrder(order.id)
      show('تم الحذف')
      onChanged?.()
      onClose()
    } catch (err) {
      show(err instanceof ApiError ? err.message : 'صار خطأ', 'error')
    }
  }

  return (
    <Sheet title="تعديل الطلب" onClose={onClose}>
      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSave}>
        <div className="field">
          <label>اسم الطلب</label>
          <input value={orderName} onChange={(e) => setOrderName(e.target.value)} />
        </div>
        <div className="field">
          <label>وصف</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>

        <button className="btn btn-gold btn-block" disabled={saving}>
          {saving ? 'لحظة...' : 'حفظ'}
        </button>
      </form>

      <button className="btn btn-danger btn-block" style={{ marginTop: 10 }} onClick={handleDelete}>
        احذف الطلب
      </button>
    </Sheet>
  )
}
