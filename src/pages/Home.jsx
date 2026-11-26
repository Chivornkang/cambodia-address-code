import { useSearchParams } from 'react-router-dom'
import CambodiaMap from '../components/CambodiaMap'
import ProvincePanel from '../components/ProvincePanel'
import Stat from '../components/Stat'
import { useApp } from '../store'
import { useSeo } from '../useSeo'

export default function Home() {
  const { t, num, nm, provinces, totals, loadError } = useApp()
  const [sp, setSp] = useSearchParams()

  const province = provinces?.find((p) => p.code === sp.get('p'))
  useSeo(null, null, '/')

  const select = (code) => {
    // stay where we are — the user scrolls to the details themselves
    setSp({ p: code }, { replace: true })
  }
  const clear = () => setSp({}, { replace: true })

  return (
    <div className="container">
      <section className="hero">
        <h1>{t('heroTitle')}</h1>
        {/* <p className="muted">{t('heroSub')}</p> */}
      </section>

      {loadError && <p className="notice">{t('loadError')}</p>}

      <div className="home-grid">
        <section className="card map-card">
          <label className="select-wrap">
            <span className="sr-only">{t('choose')}</span>
            {/* <select value={province?.code || ''} onChange={(e) => e.target.value && select(e.target.value)}>
              <option value="">{t('choose')}</option>
              {provinces?.map((p) => (
                <option key={p.code} value={p.code}>
                  {nm(p)[0]}
                </option>
              ))}
            </select> */}
          </label>
          <CambodiaMap active={province?.code} onSelect={select} />
        </section>

        <aside className="card panel">
          {province ? (
            <ProvincePanel key={province.code} province={province} onClose={clear} />
          ) : (
            <div className="panel-body">
              <h2 className="panel-title">{t('overview')}</h2>
              <p className="muted">{t('hint')}</p>
              {totals && (
                <div className="stats">
                  <Stat label={t('provinces')} value={num(totals.provinces)} />
                  <Stat label={t('districts')} value={num(totals.districts)} />
                  <Stat label={t('communes')} value={num(totals.communes)} />
                  <Stat label={t('villages')} value={num(totals.villages)} />
                </div>
              )}
              <p className="muted hierarchy">{t('hierarchy')}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
