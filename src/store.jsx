import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { PLURAL, STR, TYPES } from './i18n'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

// district type flag -> type key; commune type follows its district
export const DKEY = { s: 'srok', k: 'krong', x: 'khan' }
export const cKeyOf = (dt) => (dt === 's' ? 'khum' : 'sangkat')
export const pKeyOf = (code) => (code === '12' ? 'capital' : 'province')

const read = (k, d) => {
  try {
    return localStorage.getItem(k) || d
  } catch {
    return d
  }
}
const write = (k, v) => {
  try {
    localStorage.setItem(k, v)
  } catch {}
}

const KH_DIGITS = '០១២៣៤៥៦៧៨៩'
const toKh = (s) => String(s).replace(/\d/g, (d) => KH_DIGITS[d])

const typedIn = (l, k, it) =>
  l === 'kh' ? TYPES.kh[k] + it.kh.replace(/^រាជធានី/, '') : it.en + ' ' + TYPES.en[k]

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => read('lang', 'kh'))
  const [theme, setTheme] = useState(() => read('theme', 'dark'))
  const [provinces, setProvinces] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [postcodes, setPostcodes] = useState({})

  useEffect(() => {
    document.documentElement.lang = lang === 'kh' ? 'km' : 'en'
    write('lang', lang)
  }, [lang])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    write('theme', theme)
  }, [theme])

  useEffect(() => {
    fetch('/data/provinces.json')
      .then((r) => r.json())
      .then(setProvinces)
      .catch(() => setLoadError(true))
    // optional: { "<admin code>": "<postal code>" } — see README
    fetch('/data/postcodes.json')
      .then((r) => r.json())
      .then((d) => setPostcodes(d && typeof d === 'object' ? d : {}))
      .catch(() => {})
  }, [])

  const t = useCallback((k) => STR[lang][k] ?? k, [lang])
  const num = useCallback(
    (n, digits = 0) => {
      const s = Number(n).toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits })
      return lang === 'kh' ? toKh(s) : s
    },
    [lang]
  )
  // [primary, secondary] name in current language
  const nm = useCallback((it) => (lang === 'kh' ? [it.kh, it.en] : [it.en, it.kh]), [lang])

  // "ភូមិអូរធំ" / "Ou Thum Village" — name with its type word, in the current / the other language
  const typed = useCallback((k, it) => typedIn(lang, k, it), [lang])
  const typed2 = useCallback((k, it) => typedIn(lang === 'kh' ? 'en' : 'kh', k, it), [lang])
  const typeLabel = useCallback((k) => TYPES[lang][k], [lang])
  const plural = useCallback((k) => PLURAL[lang][k], [lang])
  const count = useCallback(
    (n, k) =>
      lang === 'kh'
        ? `${num(n)} ${TYPES.kh[k]}`
        : `${num(n)} ${(n === 1 ? TYPES.en[k] : PLURAL.en[k]).toLowerCase()}`,
    [lang, num]
  )

  const fullName = useCallback((p) => typedIn(lang, pKeyOf(p.code), p), [lang])
  const shortName = useCallback((p) => (lang === 'kh' ? p.kh.replace('រាជធានី', '') : p.en), [lang])

  // generic list headings: Phnum Penh has only khans/sangkats
  const lblDistricts = useCallback((pcode) => (pcode === '12' ? PLURAL[lang].khan : STR[lang].districts), [lang])
  const lblCommunes = useCallback(
    (dt) => (dt === 's' ? PLURAL[lang].khum : dt === 'k' || dt === 'x' ? PLURAL[lang].sangkat : STR[lang].communes),
    [lang]
  )

  // villages fall back to their commune's postal code
  const pc = useCallback(
    (code) => postcodes[code] ?? (code.length === 8 ? postcodes[code.slice(0, 6)] : undefined),
    [postcodes]
  )

  const totals = useMemo(() => {
    if (!provinces) return null
    const sum = (k) => provinces.reduce((a, p) => a + p[k], 0)
    const ranked = [...provinces].sort((a, b) => b.area - a.area)
    return {
      provinces: provinces.length,
      districts: sum('districts'),
      communes: sum('communes'),
      villages: sum('villages'),
      area: sum('area'),
      rank: Object.fromEntries(ranked.map((p, i) => [p.code, i + 1])),
    }
  }, [provinces])

  const describe = useCallback(
    (p) => {
      if (!totals) return ''
      const full = fullName(p)
      const pct = num((p.area / totals.area) * 100, 1)
      const rank = totals.rank[p.code]
      const cap = p.code === '12'
      if (lang === 'kh') {
        const dw = cap ? 'ខណ្ឌ' : 'ស្រុក/ក្រុង'
        const cw = cap ? 'សង្កាត់' : 'ឃុំ/សង្កាត់'
        return `${full} មាន ${num(p.districts)} ${dw} ${num(p.communes)} ${cw} និង ${num(p.villages)} ភូមិ។ មានផ្ទៃក្រឡាប្រមាណ ${num(p.area)} គីឡូម៉ែត្រការ៉េ ស្មើនឹង ${pct}% នៃផ្ទៃសរុបរបស់កម្ពុជា ហើយជាប់ចំណាត់ថ្នាក់ទី ${num(rank)} ក្នុងចំណោម ${num(totals.provinces)} តាមទំហំផ្ទៃ។`
      }
      const dw = cap ? count(p.districts, 'khan') : `${num(p.districts)} districts and municipalities`
      const cw = cap ? count(p.communes, 'sangkat') : `${num(p.communes)} communes and sangkats`
      return `${full} has ${dw}, ${cw} and ${count(p.villages, 'village')}. It covers about ${num(p.area)} km², roughly ${pct}% of Cambodia's mapped area, ranking #${rank} of ${totals.provinces} by size.`
    },
    [lang, totals, fullName, num, count]
  )

  const describeDistrict = useCallback(
    (d, p, nComm, nVill) => {
      const ck = cKeyOf(d.t)
      if (lang === 'kh') {
        return `${typedIn('kh', DKEY[d.t], d)} ស្ថិតនៅក្នុង${fullName(p)} មាន ${count(nComm, ck)} និង ${count(nVill, 'village')}។`
      }
      return `${typedIn('en', DKEY[d.t], d)} is in ${fullName(p)}. It has ${count(nComm, ck)} and ${count(nVill, 'village')}.`
    },
    [lang, fullName, count]
  )

  const describeCommune = useCallback(
    (c, d, p, nVill) => {
      const ck = cKeyOf(d.t)
      if (lang === 'kh') {
        return `${typedIn('kh', ck, c)} ស្ថិតនៅក្នុង${typedIn('kh', DKEY[d.t], d)} ${fullName(p)} មាន ${count(nVill, 'village')}។`
      }
      return `${typedIn('en', ck, c)} is in ${typedIn('en', DKEY[d.t], d)}, ${fullName(p)}. It has ${count(nVill, 'village')}.`
    },
    [lang, fullName, count]
  )

  const value = {
    lang, setLang, theme, setTheme, provinces, loadError, totals,
    t, num, nm, typed, typed2, typeLabel, plural, count, fullName, shortName,
    lblDistricts, lblCommunes, pc, describe, describeDistrict, describeCommune,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
