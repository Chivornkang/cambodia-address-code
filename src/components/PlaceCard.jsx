import { Link } from 'react-router-dom'

// Clickable card for a province / district / commune.
export default function PlaceCard({ to, title, sub, line, stats = [], code, post }) {
  return (
    <Link to={to} className="card p-card">
      <div className="p-card-top">
        <span className="badge">{code}</span>
        {post && <span className="badge post">{post}</span>}
      </div>
      <h3>{title}</h3>
      {sub && <p className="muted small">{sub}</p>}
      {line && <p className="line">{line}</p>}
      <div className="p-card-stats">
        {stats.map((s) => (
          <span key={s.l}>
            <b>{s.v}</b> {s.l}
          </span>
        ))}
      </div>
      <span className="go" aria-hidden="true">
        →
      </span>
    </Link>
  )
}
