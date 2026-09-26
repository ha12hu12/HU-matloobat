import { useEffect, useState, useCallback } from 'react'
import { api, ApiError } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import OrderCard from '../components/OrderCard.jsx'
import ListCard from '../components/ListCard.jsx'
import CreateSheet from '../components/CreateSheet.jsx'
import ListDetail from '../components/ListDetail.jsx'

export default function HomePage() {
  const { username } = useAuth()
  const { show } = useToast()
  const [orders, setOrders] = useState([])
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [openListId, setOpenListId] = useState(null)

  const load = useCallback(async (searchTerm) => {
    setLoading(true)
    try {
      const [o, l] = await Promise.all([api.allOrders(searchTerm), api.allLists()])
      setOrders(o)
      setLists(searchTerm ? l.filter((x) => x.list_name.includes(searchTerm)) : l)
    } catch (err) {
      show(err instanceof ApiError ? err.message : 'ما قدرنا نجيب الطلبات', 'error')
    } finally {
      setLoading(false)
    }
  }, [show])

  useEffect(() => {
    load('')
  }, [load])

  useEffect(() => {
    const t = setTimeout(() => load(search), 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  async function handleTake(order) {
    try {
      await api.takeOrUntakeOrder(order.id)
      show('خذيت الطلب')
      load(search)
    } catch (err) {
      show(err instanceof ApiError ? err.message : 'صار خطأ', 'error')
    }
  }

  const feed = [
    ...orders.map((o) => ({ ...o, __type: 'order' })),
    ...lists.map((l) => ({ ...l, __type: 'list' })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return (
    <>
      <div className="search-bar">
        <span>🔍</span>
        <input
          placeholder="دوّر عن طلب أو قائمة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <div className="loading-dot">جارٍ التحميل...</div>}

      {!loading && feed.length === 0 && (
        <div className="empty-state">
          <img src="/logo.png" className="mark" alt="" />
          <h3>ما فيه طلبات حاليًا</h3>
          <p>كن أول من ينشر طلب</p>
        </div>
      )}

      {!loading &&
        feed.map((item) =>
          item.__type === 'order' ? (
            <OrderCard key={`o-${item.id}`} order={item} currentUsername={username} onTake={handleTake} />
          ) : (
            <ListCard key={`l-${item.id}`} list={item} currentUsername={username} onOpen={() => setOpenListId(item.id)} />
          )
        )}

      <button className="fab" onClick={() => setShowCreate(true)} aria-label="أضف طلب">
        +
      </button>

      {showCreate && (
        <CreateSheet
          onClose={() => setShowCreate(false)}
          onDone={() => {
            setShowCreate(false)
            load(search)
          }}
        />
      )}

      {openListId && (
        <ListDetail
          listId={openListId}
          context="home"
          onClose={() => setOpenListId(null)}
          onChanged={() => load(search)}
        />
      )}
    </>
  )
}
