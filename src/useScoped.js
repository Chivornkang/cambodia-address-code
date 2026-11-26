import { useMemo } from 'react'
import { norm } from './searchIndex'

const hit = (it, q) => it.kh.replace(/​/g, '').includes(q) || it.en.toLowerCase().includes(q) || it.code.includes(q)

// Search inside one province (optionally one district). With no query, districts/communes are returned whole.
export function useScoped(data, query, dcode) {
  return useMemo(() => {
    if (!data) return null
    const q = norm(query)
    const out = { districts: [], communes: [], villages: [] }
    for (const d of data.d) {
      if (dcode && d.code !== dcode) continue
      if (!dcode && (!q || hit(d, q))) out.districts.push(d)
      for (const c of d.c) {
        if (!q || hit(c, q)) out.communes.push({ c, d })
        if (q) for (const v of c.v) if (hit(v, q)) out.villages.push({ v, c, d })
      }
    }
    return out
  }, [data, query, dcode])
}
