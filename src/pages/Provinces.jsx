import { useMemo, useState } from 'react'
import PlaceCard from '../components/PlaceCard'
import { useApp } from '../store'

export default function Provinces() {
  const { t, num, nm, fullName, provinces, loadError, lblDistricts, lblCommunes, pc } = useApp()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('code')

  const list = useMemo(() => {
    if (!provinces) return []
    const s = q.trim().toLowerCase()
    const f = provinces.filter((p) => !s || p.kh.includes(s) || p.en.toLowerCase().includes(s) || p.code.includes(s))
    const by = {
      code: (a, b) => a.code.localeCompare(b.code),
      name: (a, b) => a.en.localeCompare(b.en),
      area: (a, b) => b.area - a.area,
      villages: (a, b) => b.villages - a.villages,
    }[sort]
    return [...f].sort(by)
  }, [provinces, q, sort])

  return (
    <div className="container">
      <section className="hero">
        <h1>{t('navProvinces')}</h1>
      </section>

      <div className="toolbar">
        <input
          className="input"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('searchProvince')}
          aria-label={t('searchProvince')}
        />
        <select className="input select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="code">{t('sortCode')}</option>
          <option value="name">{t('sortName')}</option>
          <option value="area">{t('sortArea')}</option>
          <option value="villages">{t('sortVillages')}</option>
        </select>
      </div>

      {loadError && <p className="notice">{t('loadError')}</p>}
      {!provinces && !loadError && <p className="muted">{t('loading')}</p>}
      {provinces && list.length === 0 && <p className="muted">{t('noResults')}</p>}

      <div className="grid">
        {list.map((p) => (
          <PlaceCard
            key={p.code}
            to={`/province/${p.code}`}
            code={p.code}
            post={pc(p.code)}
            title={fullName(p)}
            sub={nm(p)[1]}
            stats={[
              { v: num(p.districts), l: lblDistricts(p.code) },
              { v: num(p.communes), l: lblCommunes(p.code === '12' ? 'x' : undefined) },
              { v: num(p.villages), l: t('villages') },
              { v: num(p.area), l: t('km2') },
            ]}
          />
        ))}
      </div>
    </div>
  )
}
