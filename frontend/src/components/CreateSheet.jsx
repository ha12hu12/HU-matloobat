import { useState } from 'react'
import Sheet from './Sheet.jsx'
import { api, ApiError } from '../api.js'
import { useToast } from '../context/ToastContext.jsx'

export default function CreateSheet({ onClose, onDone }) {
  const { show } = useToast()
  const [kind, setKind] = useState('order') // 'order' | 'list'
  const [step, setStep] = useState('form') // 'form' | 'items'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [orderName, setOrderName] = useState('')
  const [desc, setDesc] = useState('')

  const [listName, setListName] = useState('')
  const [createdListId, setCreatedListId] = useState(null)
  const [items, setItems] = useState([])
  const [itemName, setItemName] = useState('')
  const [itemPrice, setItemPrice] = useState('')

  async function handleCreateOrder(e) {
    e.preventDefault()
    if (!orderName.trim()) return setError('اكتب اسم الطلب')
    setLoading(true)
    setError('')
    try {
      await api.createOrder({ order_name: orderName.trim(), desc: desc.trim() || undefined })
      show('تم نشر طلبك')
      onDone()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'صار خطأ')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateList(e) {
    e.preventDefault()
    if (!listName.trim()) return setError('اكتب اسم القائمة')
    setLoading(true)
    setError('')
    try {
      const res = await api.createList(listName.trim())
      setCreatedListId(res.id)
      setStep('items')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'صار خطأ')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddItem(e) {
    e.preventDefault()
    if (!itemName.trim()) return
    setLoading(true)
    setError('')
    try {
      const price = itemPrice.trim() ? Number(itemPrice) : 0
      const item = await api.addListItem({ list_id: createdListId, order_name: itemName.trim(), price })
      setItems((prev) => [...prev, item])
      setItemName('')
      setItemPrice('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'صار خطأ')
    } finally {
      setLoading(false)
    }
  }

  function finishList() {
    show('تم نشر قائمتك')
    onDone()
  }

  return (
    <Sheet title={step === 'items' ? `عناصر «${listName}»` : 'طلب جديد'} onClose={onClose}>
      {step === 'form' && (
        <>
          <div className="segmented">
            <button className={kind === 'order' ? 'active' : ''} onClick={() => setKind('order')}>
              طلب مفرد
            </button>
            <button className={kind === 'list' ? 'active' : ''} onClick={() => setKind('list')}>
              قائمة طلبات
            </button>
          </div>

          {error && <div className="form-error">{error}</div>}

          {kind === 'order' ? (
            <form onSubmit={handleCreateOrder}>
              <div className="field">
                <label>اسم الطلب</label>
                <input value={orderName} onChange={(e) => setOrderName(e.target.value)} placeholder="مثلاً: كتاب من المكتبة" />
              </div>
              <div className="field">
                <label>وصف (اختياري)</label>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="أي تفاصيل تساعد اللي بياخذ الطلب" />
              </div>
              <button className="btn btn-gold btn-block" disabled={loading}>
                {loading ? 'لحظة...' : 'انشر الطلب'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateList}>
              <div className="field">
                <label>اسم القائمة</label>
                <input value={listName} onChange={(e) => setListName(e.target.value)} placeholder="مثلاً: تسوق البيت" />
              </div>
              <button className="btn btn-gold btn-block" disabled={loading}>
                {loading ? 'لحظة...' : 'التالي: أضف العناصر'}
              </button>
            </form>
          )}
        </>
      )}

      {step === 'items' && (
        <>
          {items.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {items.map((it) => (
                <div className="item-row" key={it.id}>
                  <span className="name">{it.order_name}</span>
                  {it.price > 0 && <span className="price">{it.price} ر.س</span>}
                </div>
              ))}
            </div>
          )}

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleAddItem} className="row-gap" style={{ alignItems: 'flex-end' }}>
            <div className="field grow" style={{ marginBottom: 0 }}>
              <label>اسم العنصر</label>
              <input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="مثلاً: حليب" />
            </div>
            <div className="field" style={{ marginBottom: 0, width: 90 }}>
              <label>السعر</label>
              <input value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="0" inputMode="decimal" />
            </div>
            <button className="btn btn-ghost btn-sm" disabled={loading} style={{ marginBottom: 1 }}>
              أضف
            </button>
          </form>

          <button className="btn btn-moss btn-block" style={{ marginTop: 18 }} onClick={finishList}>
            تم — انشر القائمة
          </button>
        </>
      )}
    </Sheet>
  )
}
