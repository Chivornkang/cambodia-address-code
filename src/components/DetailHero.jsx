import Breadcrumb from './Breadcrumb'
import CambodiaMap from './CambodiaMap'
import Stat from './Stat'

// Shared header for province / district / commune pages.
export default function DetailHero({ crumbs, badges, title, subtitle, desc, stats, mapActive }) {
  return (
    <>
      <Breadcrumb items={crumbs} />
      <section className="detail-hero">
        <div className="card detail-main">
          <div className="badges">{badges}</div>
          <h1>{title}</h1>
          {subtitle && <p className="muted">{subtitle}</p>}
          <p className="desc">{desc}</p>
          <div className="stats">
            {stats.filter((s) => s.value !== '—').map((s) => (
              <Stat key={s.label} {...s} />
            ))}
          </div>
        </div>
        <div className="card detail-map">
          <CambodiaMap active={mapActive} mini />
        </div>
      </section>
    </>
  )
}
