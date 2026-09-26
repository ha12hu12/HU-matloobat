import { useEffect, useState, useCallback } from 'react'
import { api, ApiError } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import OrderCard from '../components/OrderCard.jsx'
import ListCard from '../components/ListCard.jsx'
import OrderEditSheet from '../components/OrderEditSheet.jsx'
import ListDetail from '../components/ListDetail.jsx'

export default function MyOrdersPage() {
  const { username } = useAuth()
  const { show } = useToast()
  const [orders, setOrders] = useState([])
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingOrder, setEditingOrder] = useState(null)
  const [openListId, setOpenListId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [o, l] = await Promise.all([api.myOrders(''), api.myLists()])
      setOrders(o)
      setLists(l)
    } catch (err) {
      show(err instanceof ApiError ? err.message : 'ما قدرنا نجيب طلباتك', 'error')
    } finally {
      setLoading(false)
    }
  }, [show])

  useEffect(() => {
    load()
  }, [load])

  const isEmpty = !loading && orders.length === 0 && lists.length === 0

  return (
    <>
      {loading && <div className="loading-dot">جارٍ التحميل...</div>}

      {isEmpty && (
        <div className="empty-state">
          <img src="/logo.png" className="mark" alt="" />
          <h3>ما سويت أي طلب بعد</h3>
          <p>اضغط + من الرئيسية عشان تبدأ</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <>
          <div className="section-label">طلباتي المفردة</div>
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} currentUsername={username} onOpenActions={setEditingOrder} />
          ))}
        </>
      )}

      {!loading && lists.length > 0 && (
        <>
          <div className="section-label">قوائمي</div>
          {lists.map((l) => (
            <ListCard key={l.id} list={l} currentUsername={username} onOpen={() => setOpenListId(l.id)} />
          ))}
        </>
      )}

      {editingOrder && (
        <OrderEditSheet
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onChanged={load}
        />
      )}

      {openListId && (
        <ListDetail listId={openListId} context="mine" onClose={() => setOpenListId(null)} onChanged={load} />
      )}
    </>
  )
}
