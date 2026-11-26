import { useDeferredValue, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import DetailHero from '../components/DetailHero'
import NotFoundBox from '../components/NotFoundBox'
import PlaceCard from '../components/PlaceCard'
import VillageCard from '../components/VillageCard'
import { DKEY, cKeyOf, useApp } from '../store'
import { useProvinceData } from '../useProvinceData'
import { useScoped } from '../useScoped'
import { biProvince, useSeo } from '../useSeo'

const LIMIT = 60

export default function ProvinceDetail() {
  const { code } = useParams()
  const {
    t, num, nm, typed, typed2, fullName, describe, pc, provinces, loadError, lblDistricts, lblCommunes,
  } = useApp()
  const { data, error } = useProvinceData(code)
  const [q, setQ] = useState('')
  const dq = useDeferredValue(q)
  useEffect(() => setQ(''), [code])

  const province = provinces?.find((p) => p.code === code)
  const res = useScoped(data, dq, null)
  useSeo(
    province && `${biProvince(province)} | លេខកូដតំបន់ Postcode · Cambodia Explorer`,
    province &&
      `ផែនទី និងលេខកូដតំបន់ ${province.kh}៖ ${province.districts} ស្រុក/ក្រុង/ខណ្ឌ ${province.communes} ឃុំ/សង្កាត់ ${province.villages} ភូមិ។ Map, postcode and area codes of ${province.en}, Cambodia.`,
    `/province/${code}`
  )

  if (provinces && !province) return <NotFoundBox to="/provinces" />
  if (!province) {
    return (
      <div className="container">
        <p className={loadError ? 'notice' : 'muted'}>{loadError ? t('loadError') : t('loading')}</p>
      </div>
    )
  }

  const cap = code === '12'
  const searching = dq.trim().length > 0
  const villages = res?.villages ?? []
  const communes = res?.communes ?? []

  return (
    <div className="container">
      <DetailHero
        crumbs={[{ to: '/provinces', label: t('navProvinces') }, { label: fullName(province) }]}
        badges={
          <>
            <span className="badge">
              {t('code')} {province.code}
            </span>
            {pc(province.code) && <span className="badge post">{pc(province.code)}</span>}
          </>
        }
        title={fullName(province)}
        subtitle={nm(province)[1]}
        desc={describe(province)}
        stats={[
          { label: lblDistricts(code), value: num(province.districts) },
          { label: lblCommunes(cap ? 'x' : undefined), value: num(province.communes) },
          { label: t('villages'), value: num(province.villages) },
          { label: t('area'), value: num(province.area), unit: t('km2') },
          { label: t('postcode'), value: pc(province.code) || '—' },
        ]}
        mapActive={province.code}
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

        {error && <p className="notice">{t('loadError')}</p>}
        {!data && !error && <p className="muted">{t('loading')}</p>}

        {data && (
          <>
            <h2 className="sec-title">
              {lblDistricts(code)} <span className="count">{num(res.districts.length)}</span>
            </h2>
            {res.districts.length === 0 && <p className="muted">{t('noResults')}</p>}
            <div className="grid">
              {res.districts.map((d) => {
                const nv = d.c.reduce((a, c) => a + c.v.length, 0)
                return (
                  <PlaceCard
                    key={d.code}
                    to={`/district/${d.code}`}
                    code={d.code}
                    post={pc(d.code)}
                    title={typed(DKEY[d.t], d)}
                    sub={typed2(DKEY[d.t], d)}
                    stats={[
                      { v: num(d.c.length), l: lblCommunes(d.t) },
                      { v: num(nv), l: t('villages') },
                    ]}
                  />
                )
              })}
            </div>

            {searching && communes.length > 0 && (
              <>
                <h2 className="sec-title">
                  {t('communes')} <span className="count">{num(communes.length)}</span>
                </h2>
                <div className="grid">
                  {communes.slice(0, LIMIT).map(({ c, d }) => (
                    <PlaceCard
                      key={c.code}
                      to={`/commune/${c.code}`}
                      code={c.code}
                      post={pc(c.code)}
                      title={typed(cKeyOf(d.t), c)}
                      sub={typed2(cKeyOf(d.t), c)}
                      line={`${typed(DKEY[d.t], d)}  ${fullName(province)}`}
                      stats={[{ v: num(c.v.length), l: t('villages') }]}
                    />
                  ))}
                </div>
                {communes.length > LIMIT && (
                  <p className="muted small">
                    {t('showingFirst')} {num(LIMIT)}
                  </p>
                )}
              </>
            )}

            {searching && villages.length > 0 && (
              <>
                <h2 className="sec-title">
                  {t('villages')} <span className="count">{num(villages.length)}</span>
                </h2>
                <div className="grid">
                  {villages.slice(0, LIMIT).map(({ v, c, d }) => (
                    <VillageCard key={v.code} v={v} c={c} d={d} p={province} to={`/commune/${c.code}?v=${v.code}`} />
                  ))}
                </div>
                {villages.length > LIMIT && (
                  <p className="muted small">
                    {t('showingFirst')} {num(LIMIT)}
                  </p>
                )}
              </>
            )}
          </>
        )}
      </section>
    </div>
  )
}
