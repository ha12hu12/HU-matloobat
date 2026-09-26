import { timeAgo } from '../utils/time.js'

export default function OrderCard({ order, currentUsername, onTake, onOpenActions }) {
  const isMine = order.applicant_name === currentUsername
  const status = order.done ? 'done' : order.is_took ? 'taken' : null

  return (
    <div className="card" onClick={() => onOpenActions?.(order)}>
      <div className="card-head">
        <div>
          <p className="card-title">{order.order_name}</p>
          <p className="card-sub">
            {isMine ? 'طلبك' : `من ${order.applicant_name}`} · {timeAgo(order.created_at)}
          </p>
        </div>
        {status && (
          <span className={`seal ${status}`}>{status === 'done' ? 'تم' : 'مأخوذ'}</span>
        )}
      </div>

      {order.desc && (
        <>
          <hr className="rule" />
          <p className="card-sub" style={{ color: 'var(--text)' }}>
            {order.desc}
          </p>
        </>
      )}

      {!isMine && !order.is_took && onTake && (
        <>
          <hr className="rule" />
          <div className="card-foot">
            <span />
            <button
              className="btn btn-gold btn-sm"
              onClick={(e) => {
                e.stopPropagation()
                onTake(order)
              }}
            >
              خذه
            </button>
          </div>
        </>
      )}
    </div>
  )
}
