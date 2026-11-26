import { useEffect } from 'react'
import { TYPES } from './i18n'
import { pKeyOf, DKEY, cKeyOf } from './store'

export const SITE = (import.meta.env.VITE_SITE_URL || 'https://cambodia-explorer.vercel.app').replace(/\/$/, '')
export const BRAND = 'Cambodia Explorer'

export const DEFAULT_TITLE = 'Cambodia Explorer · ផែនទីកម្ពុជា | Cambodia Postcode, Map Code & ភូមិសាស្ត្រកម្ពុជា'
export const DEFAULT_DESC =
  'ផែនទីកម្ពុជា ភូមិសាស្ត្រកម្ពុជា លេខកូដតំបន់ ភូមិ ឃុំ ស្រុក ខេត្ត។ Cambodia Explorer: interactive Cambodia map with postcode and area codes for 25 provinces, districts, communes and villages.'

// "ភូមិអូរធំ Ou Thum Village" — Khmer + English name with type words, for titles.
export const biName = (typeKey, it) =>
  `${TYPES.kh[typeKey]}${it.kh.replace(/^រាជធានី/, '')} ${it.en} ${TYPES.en[typeKey]}`
export const biProvince = (p) => biName(pKeyOf(p.code), p)
export const biDistrict = (d) => biName(DKEY[d.t], d)
export const biCommune = (c, d) => biName(cKeyOf(d.t), c)

function setMeta(sel, attr, value) {
  let el = document.head.querySelector(sel)
  if (!el) {
    el = document.createElement(sel.startsWith('link') ? 'link' : 'meta')
    const m = sel.match(/\[(\w+)="([^"]+)"\]/)
    el.setAttribute(m[1], m[2])
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

// Per-page <title>, description, canonical and social tags (the app is a SPA).
export function useSeo(title, description, path = '/') {
  useEffect(() => {
    const full = title || DEFAULT_TITLE
    const desc = description || DEFAULT_DESC
    const url = SITE + path
    document.title = full
    setMeta('meta[name="description"]', 'content', desc)
    setMeta('link[rel="canonical"]', 'href', url)
    setMeta('meta[property="og:title"]', 'content', full)
    setMeta('meta[property="og:description"]', 'content', desc)
    setMeta('meta[property="og:url"]', 'content', url)
    setMeta('meta[name="twitter:title"]', 'content', full)
    setMeta('meta[name="twitter:description"]', 'content', desc)
  }, [title, description, path])
}
