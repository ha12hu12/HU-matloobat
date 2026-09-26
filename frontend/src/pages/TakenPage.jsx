import { useEffect, useState, useCallback } from 'react'
import { api, ApiError } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import ListCard from '../components/ListCard.jsx'
import ListDetail from '../components/ListDetail.jsx'
import { timeAgo } from '../utils/time.js'

export default function TakenPage() {
  const { username } = useAuth()
  const { show } = useToast()
  const [orders, setOrders] = useState([])
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [openListId, setOpenListId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.ordersITook('')
      setOrders(res.orders || [])
      setLists(res.orders_lists || [])
    } catch (err) {
      show(err instanceof ApiError ? err.message : 'ما قدرنا نجيب المأخوذات', 'error')
    } finally {
      setLoading(false)
    }
  }, [show])

  useEffect(() => {
    load()
  }, [load])

  async function handleUntakeOrder(order) {
    try {
      await api.takeOrUntakeOrder(order.id)
      show('تركت الطلب')
      load()
    } catch (err) {
      show(err instanceof ApiError ? err.message : 'صار خطأ', 'error')
    }
  }

  const isEmpty = !loading && orders.length === 0 && lists.length === 0

  return (
    <>
      {loading && <div className="loading-dot">جارٍ التحميل...</div>}

      {isEmpty && (
        <div className="empty-state">
          <img src="/logo.png" className="mark" alt="" />
          <h3>ما أخذت أي طلب بعد</h3>
          <p>روح الرئيسية وشوف اللي محتاجين مساعدة</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <>
          <div className="section-label">طلبات أخذتها</div>
          {orders.map((o) => (
            <div className="card" key={o.id}>
              <div className="card-head">
                <div>
                  <p className="card-title">{o.order_name}</p>
                  <p className="card-sub">
                    من {o.applicant_name} · {timeAgo(o.created_at)}
                  </p>
                </div>
                {o.done && <span className="seal done">تم</span>}
              </div>
              {o.desc && (
                <>
                  <hr className="rule" />
                  <p className="card-sub" style={{ color: 'var(--text)' }}>{o.desc}</p>
                </>
              )}
              <hr className="rule" />
              <div className="card-foot">
                <span />
                <button className="btn btn-ghost btn-sm" onClick={() => handleUntakeOrder(o)}>
                  اترك الطلب
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {!loading && lists.length > 0 && (
        <>
          <div className="section-label">قوائم أخذتها</div>
          {lists.map((l) => (
            <ListCard key={l.id} list={l} currentUsername={username} onOpen={() => setOpenListId(l.id)} />
          ))}
        </>
      )}

      {openListId && (
        <ListDetail listId={openListId} context="taken" onClose={() => setOpenListId(null)} onChanged={load} />
      )}
    </>
  )
}
