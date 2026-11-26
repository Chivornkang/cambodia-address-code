import { useDeferredValue, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import DetailHero from '../components/DetailHero'
import NotFoundBox from '../components/NotFoundBox'
import PlaceCard from '../components/PlaceCard'
import VillageCard from '../components/VillageCard'
import { DKEY, cKeyOf, useApp } from '../store'
import { useProvinceData } from '../useProvinceData'
import { useScoped } from '../useScoped'
import { biDistrict, biProvince, useSeo } from '../useSeo'

const LIMIT = 60

export default function DistrictDetail() {
  const { code } = useParams() // 4-digit district code
  const pcode = code.slice(0, 2)
  const { t, num, typed, typed2, fullName, describeDistrict, pc, provinces, loadError, lblCommunes } = useApp()
  const { data, error } = useProvinceData(pcode)
  const [q, setQ] = useState('')
  const dq = useDeferredValue(q)
  useEffect(() => setQ(''), [code])

  const province = provinces?.find((p) => p.code === pcode)
  const district = data?.d.find((d) => d.code === code)
  const res = useScoped(data, dq, code)
  useSeo(
    province && district && `${biDistrict(district)}, ${province.en} | លេខកូដតំបន់ Postcode · Cambodia Explorer`,
    province &&
      district &&
      `${biDistrict(district)} ស្ថិតក្នុង ${biProvince(province)}៖ ឃុំ ភូមិ និងលេខកូដតំបន់។ Communes, villages and area codes of ${biDistrict(district)}, ${province.en}, Cambodia.`,
    `/district/${code}`
  )

  if (provinces && !province) return <NotFoundBox to="/provinces" />
  if (data && !district) return <NotFoundBox to={`/province/${pcode}`} />
  if (!province || !district) {
    return (
      <div className="container">
        <p className={error || loadError ? 'notice' : 'muted'}>{error || loadError ? t('loadError') : t('loading')}</p>
      </div>
    )
  }

  const dk = DKEY[district.t]
  const ck = cKeyOf(district.t)
  const nVill = district.c.reduce((a, c) => a + c.v.length, 0)
  const searching = dq.trim().length > 0

  return (
    <div className="container">
      <DetailHero
        crumbs={[
          { to: '/provinces', label: t('navProvinces') },
          { to: `/province/${pcode}`, label: fullName(province) },
          { label: typed(dk, district) },
        ]}
        badges={
          <>
            <span className="badge">
              {t('code')} {district.code}
            </span>
            {pc(district.code) && <span className="badge post">{pc(district.code)}</span>}
          </>
        }
        title={typed(dk, district)}
        subtitle={typed2(dk, district)}
        desc={describeDistrict(district, province, district.c.length, nVill)}
        stats={[
          { label: lblCommunes(district.t), value: num(district.c.length) },
          { label: t('villages'), value: num(nVill) },
          { label: t('postcode'), value: pc(district.code) || '—' },
          { label: t('code'), value: district.code },
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
          {lblCommunes(district.t)} <span className="count">{num(res.communes.length)}</span>
        </h2>
        {res.communes.length === 0 && <p className="muted">{t('noResults')}</p>}
        <div className="grid">
          {res.communes.map(({ c }) => (
            <PlaceCard
              key={c.code}
              to={`/commune/${c.code}`}
              code={c.code}
              post={pc(c.code)}
              title={typed(ck, c)}
              sub={typed2(ck, c)}
              stats={[{ v: num(c.v.length), l: t('villages') }]}
            />
          ))}
        </div>

        {searching && res.villages.length > 0 && (
          <>
            <h2 className="sec-title">
              {t('villages')} <span className="count">{num(res.villages.length)}</span>
            </h2>
            <div className="grid">
              {res.villages.slice(0, LIMIT).map(({ v, c, d }) => (
                <VillageCard key={v.code} v={v} c={c} d={d} p={province} to={`/commune/${c.code}?v=${v.code}`} />
              ))}
            </div>
            {res.villages.length > LIMIT && (
              <p className="muted small">
                {t('showingFirst')} {num(LIMIT)}
              </p>
            )}
          </>
        )}
      </section>
    </div>
  )
}
