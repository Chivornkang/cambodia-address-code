import { Link } from 'react-router-dom'
import { DKEY, useApp } from '../store'
import { districtPath, provincePath } from '../slug'
import { useProvinceData } from '../useProvinceData'
import Stat from './Stat'

export default function ProvincePanel({ province, onClose }) {
  const { t, num, nm, typed, fullName, describe, pc, lblDistricts, lblCommunes } = useApp()
  const { data } = useProvinceData(province.code)
  const post = pc(province.code)
  const cap = province.code === '12'

  return (
    <div className="panel-body">
      <div className="panel-head">
        <div>
          <h2 className="panel-title">{fullName(province)}</h2>
          <p className="muted panel-sub">
            {nm(province)[1]} · {t('code')} {province.code}
          </p>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label={t('close')}>
          ✕
        </button>
      </div>

      <p className="desc">{describe(province)}</p>

      <div className="stats">
        <Stat label={lblDistricts(province.code)} value={num(province.districts)} />
        <Stat label={lblCommunes(cap ? 'x' : undefined)} value={num(province.communes)} />
        <Stat label={t('villages')} value={num(province.villages)} />
        <Stat label={t('area')} value={num(province.area)} unit={t('km2')} />
        {post && <Stat label={t('postcode')} value={post} />}
      </div>

      <h3 className="mini-title">{lblDistricts(province.code)}</h3>
      <div className="chips">
        {data
          ? data.d.map((d) => (
              <Link className="chip" key={d.code} to={districtPath(province, d)} title={typed(DKEY[d.t], d)}>
                {nm(d)[0]}
              </Link>
            ))
          : Array.from({ length: Math.min(province.districts, 8) }, (_, i) => <span className="chip skeleton" key={i} />)}
      </div>

      <Link className="btn primary block" to={provincePath(province)}>
        {t('viewDetails')} →
      </Link>
    </div>
  )
}
