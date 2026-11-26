import { Link } from 'react-router-dom'
import { DKEY, cKeyOf, useApp } from '../store'

// Village card: "ភូមិ…" title plus the full place line "ភូមិ… ឃុំ/សង្កាត់… ស្រុក/ក្រុង/ខណ្ឌ… ខេត្ត/រាជធានី…".
// v = village, c = commune, d = district, p = province (all {code, kh, en}); d.t is the district type.
export default function VillageCard({ v, c, d, p, to, highlight }) {
  const { typed, typed2, fullName, pc } = useApp()
  const post = pc(v.code)
  const line = [typed('village', v), typed(cKeyOf(d.t), c), typed(DKEY[d.t], d), fullName(p)].join(' ')
  const body = (
    <>
      <div className="p-card-top">
        <span className="badge">{v.code}</span>
        {post && <span className="badge post">{post}</span>}
      </div>
      <h3>{typed('village', v)}</h3>
      <p className="muted small">{typed2('village', v)}</p>
      <p className="line">{line}</p>
    </>
  )
  const cls = 'card v-card' + (highlight ? ' hl' : '')
  return to ? (
    <Link to={to} className={cls} id={'v-' + v.code}>
      {body}
    </Link>
  ) : (
    <div className={cls} id={'v-' + v.code}>
      {body}
    </div>
  )
}
