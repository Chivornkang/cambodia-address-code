import { Link } from 'react-router-dom'

// items: [{ to?, label }] — the last one is the current page
export default function Breadcrumb({ items }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map((it, i) => (
        <span key={i} className="crumb">
          {it.to ? <Link to={it.to}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
          {i < items.length - 1 && <i aria-hidden="true">›</i>}
        </span>
      ))}
    </nav>
  )
}
