import { timeAgo } from '../utils/time.js'

export default function ListCard({ list, currentUsername, onOpen }) {
  const isMine = list.applicant_name === currentUsername

  return (
    <div className="card" onClick={() => onOpen(list)}>
      <div className="card-head">
        <div>
          <p className="card-title">📋 {list.list_name}</p>
          <p className="card-sub">
            {isMine ? 'قائمتك' : `من ${list.applicant_name}`} · {timeAgo(list.created_at)}
          </p>
        </div>
        {list.is_took && <span className="seal taken">مأخوذة</span>}
      </div>
    </div>
  )
}
