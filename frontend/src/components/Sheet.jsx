export default function Sheet({ title, onClose, children }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="إغلاق">
          ✕
        </button>
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </div>
  )
}
