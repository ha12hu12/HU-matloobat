import { useEffect, useState, useMemo } from 'react'
import Sheet from './Sheet.jsx'
import { api, ApiError } from '../api.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function ListDetail({ listId, context, onClose, onChanged }) {
  // context: 'home' (feed, may be mine or someone else's) | 'mine' (from طلباتي, always mine) | 'taken' (from المأخوذات, always taken by me)
  const { username } = useAuth()
  const { show } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [list, setList] = useState(null)
  const [items, setItems] = useState([])

  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [editingListName, setEditingListName] = useState(false)
  const [listNameDraft, setListNameDraft] = useState('')

  const mode = useMemo(() => {
    if (context === 'mine') return 'owner'
    if (context === 'taken') return 'taker'
    if (list) return list.applicant_name === username ? 'owner' : 'browse'
    return 'browse'
  }, [context, list, username])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = context === 'mine' ? await api.myListDetail(listId) : await api.listDetail(listId)
      setList(res.list)
      setItems(res.items || [])
      setListNameDraft(res.list.list_name)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'ما قدرنا نجيب القائمة')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId])

  async function handleTake() {
    try {
      await api.takeOrUntakeList(listId)
      show('أخذت القائمة')
      onChanged?.()
      onClose()
    } catch (err) {
      show(err instanceof ApiError ? err.message : 'صار خطأ', 'error')
    }
  }

  async function handleUntake() {
    try {
      await api.takeOrUntakeList(listId)
      show('تركت القائمة')
      onChanged?.()
      onClose()
    } catch (err) {
      show(err instanceof ApiError ? err.message : 'صار خطأ', 'error')
    }
  }

  async function handleDeleteList() {
    if (!confirm('تحذف القائمة كاملة؟')) return
    try {
      await api.deleteList(listId)
      show('حذفت القائمة')
      onChanged?.()
      onClose()
    } catch (err) {
      show(err instanceof ApiError ? err.message : 'صار خطأ', 'error')
    }
  }

  async function handleSaveListName() {
    if (!listNameDraft.trim()) return
    try {
      await api.updateList(listId, listNameDraft.trim())
      setList((l) => ({ ...l, list_name: listNameDraft.trim() }))
      setEditingListName(false)
      show('تم التعديل')
      onChanged?.()
    } catch (err) {
      show(err instanceof ApiError ? err.message : 'صار خطأ', 'error')
    }
  }

  async function handleAddItem(e) {
    e.preventDefault()
    if (!newItemName.trim()) return
    try {
      const price = newItemPrice.trim() ? Number(newItemPrice) : 0
      const item = await api.addListItem({ list_id: listId, order_name: newItemName.trim(), price })
      setItems((prev) => [...prev, item])
      setNewItemName('')
      setNewItemPrice('')
    } catch (err) {
      show(err instanceof ApiError ? err.message : 'صار خطأ', 'error')
    }
  }

  async function handleDeleteItem(itemId) {
    try {
      await api.deleteListItem(listId, itemId)
      setItems((prev) => prev.filter((it) => it.id !== itemId))
    } catch (err) {
      show(err instanceof ApiError ? err.message : 'صار خطأ', 'error')
    }
  }

  async function handleToggleDone(item) {
    const nextDone = !item.done
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, done: nextDone } : it)))
    try {
      await api.setItemDone(listId, item.id, nextDone)
    } catch (err) {
      setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, done: !nextDone } : it)))
      show(err instanceof ApiError ? err.message : 'صار خطأ', 'error')
    }
  }

  return (
    <Sheet onClose={onClose}>
      {loading && <div className="loading-dot">جارٍ التحميل...</div>}
      {error && <div className="form-error">{error}</div>}

      {!loading && list && (
        <>
          {editingListName ? (
            <div className="row-gap" style={{ marginBottom: 14, alignItems: 'center' }}>
              <input
                className="grow"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--rule)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  fontSize: 15,
                  fontWeight: 700,
                }}
                value={listNameDraft}
                onChange={(e) => setListNameDraft(e.target.value)}
              />
              <button className="btn btn-gold btn-sm" onClick={handleSaveListName}>
                حفظ
              </button>
            </div>
          ) : (
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              📋 {list.list_name}
              {mode === 'owner' && (
                <button className="icon-btn" onClick={() => setEditingListName(true)}>
                  ✎
                </button>
              )}
            </h2>
          )}

          <p className="card-sub" style={{ marginBottom: 16 }}>
            {mode === 'owner' ? 'قائمتك' : `من ${list.applicant_name}`}
          </p>

          {items.length === 0 && <p className="center-msg">ما فيه عناصر بعد</p>}

          {items.map((item) => (
            <div className="item-row" key={item.id}>
              {mode === 'taker' ? (
                <button
                  className={`item-check ${item.done ? 'checked' : ''}`}
                  onClick={() => handleToggleDone(item)}
                >
                  {item.done ? '✓' : ''}
                </button>
              ) : null}
              <span className={`name ${item.done ? 'done' : ''}`}>{item.order_name}</span>
              {item.price > 0 && <span className="price">{item.price} ر.س</span>}
              {mode === 'owner' && (
                <button className="icon-btn danger" onClick={() => handleDeleteItem(item.id)}>
                  ✕
                </button>
              )}
            </div>
          ))}

          {mode === 'owner' && (
            <form onSubmit={handleAddItem} className="row-gap" style={{ marginTop: 14, alignItems: 'flex-end' }}>
              <div className="field grow" style={{ marginBottom: 0 }}>
                <input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="عنصر جديد"
                />
              </div>
              <div className="field" style={{ marginBottom: 0, width: 80 }}>
                <input
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="السعر"
                  inputMode="decimal"
                />
              </div>
              <button className="btn btn-ghost btn-sm">أضف</button>
            </form>
          )}

          <hr className="rule" style={{ marginTop: 20 }} />

          {mode === 'browse' && !list.is_took && (
            <button className="btn btn-gold btn-block" onClick={handleTake}>
              خذ القائمة
            </button>
          )}
          {mode === 'taker' && (
            <button className="btn btn-ghost btn-block" onClick={handleUntake}>
              اترك القائمة
            </button>
          )}
          {mode === 'owner' && (
            <button className="btn btn-danger btn-block" onClick={handleDeleteList}>
              احذف القائمة
            </button>
          )}
        </>
      )}
    </Sheet>
  )
}
