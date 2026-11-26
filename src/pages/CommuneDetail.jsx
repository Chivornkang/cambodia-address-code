import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import DetailHero from '../components/DetailHero'
import NotFoundBox from '../components/NotFoundBox'
import VillageCard from '../components/VillageCard'
import { DKEY, cKeyOf, useApp } from '../store'
import { norm } from '../searchIndex'
import { useProvinceData } from '../useProvinceData'

export default function CommuneDetail() {
  const { code } = useParams() // 6-digit commune code
  const pcode = code.slice(0, 2)
  const dcode = code.slice(0, 4)
  const [sp] = useSearchParams()
  const hl = sp.get('v')
  const { t, num, typed, typed2, fullName, describeCommune, pc, provinces, loadError } = useApp()
  const { data, error } = useProvinceData(pcode)
  const [q, setQ] = useState('')
  const dq = useDeferredValue(q)
  useEffect(() => setQ(''), [code])

  const province = provinces?.find((p) => p.code === pcode)
  const district = data?.d.find((d) => d.code === dcode)
  const commune = district?.c.find((c) => c.code === code)

  const villages = useMemo(() => {
    if (!commune) return []
    const s = norm(dq)
    if (!s) return commune.v
    return commune.v.filter((v) => v.kh.includes(s) || v.en.toLowerCase().includes(s) || v.code.includes(s))
  }, [commune, dq])

  // jump to the village opened from search
  useEffect(() => {
    if (!commune || !hl) return
    const id = setTimeout(() => document.getElementById('v-' + hl)?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 150)
    return () => clearTimeout(id)
  }, [commune, hl])

  if (provinces && !province) return <NotFoundBox to="/provinces" />
  if (data && !commune) return <NotFoundBox to={`/province/${pcode}`} />
  if (!province || !commune) {
    return (
      <div className="container">
        <p className={error || loadError ? 'notice' : 'muted'}>{error || loadError ? t('loadError') : t('loading')}</p>
      </div>
    )
  }

  const dk = DKEY[district.t]
  const ck = cKeyOf(district.t)

  return (
    <div className="container">
      <DetailHero
        crumbs={[
          { to: '/provinces', label: t('navProvinces') },
          { to: `/province/${pcode}`, label: fullName(province) },
          { to: `/district/${dcode}`, label: typed(dk, district) },
          { label: typed(ck, commune) },
        ]}
        badges={
          <>
            <span className="badge">
              {t('code')} {commune.code}
            </span>
            {pc(commune.code) && <span className="badge post">{pc(commune.code)}</span>}
          </>
        }
        title={typed(ck, commune)}
        subtitle={typed2(ck, commune)}
        desc={describeCommune(commune, district, province, commune.v.length)}
        stats={[
          { label: t('villages'), value: num(commune.v.length) },
          { label: t('postcode'), value: pc(commune.code) || '—' },
          { label: t('code'), value: commune.code },
        ]}
        mapActive={pcode}
      />

      <section className="card section-card">
        <div className="toolbar">
          <input
            className="input"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('search')}
            aria-label={t('search')}
          />
        </div>

        <h2 className="sec-title">
          {t('villages')} <span className="count">{num(villages.length)}</span>
        </h2>
        {villages.length === 0 && <p className="muted">{t('noResults')}</p>}
        <div className="grid">
          {villages.map((v) => (
            <VillageCard key={v.code} v={v} c={commune} d={district} p={province} highlight={v.code === hl} />
          ))}
        </div>
      </section>
    </div>
  )
}
