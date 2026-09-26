const TABS = [
  { key: 'home', label: 'الرئيسية', icon: '🏠' },
  { key: 'mine', label: 'طلباتي', icon: '📋' },
  { key: 'taken', label: 'المأخوذات', icon: '📦' },
  { key: 'settings', label: 'الإعدادات', icon: '⚙️' },
]

export default function NavBar({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map((t) => (
        <button
          key={t.key}
          className={active === t.key ? 'active' : ''}
          onClick={() => onChange(t.key)}
        >
          <span className="icon">{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
