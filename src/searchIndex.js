// Lazy-loaded flat index of every province / district / commune / village (public/data/search.json).
// Row: [level, code, kh, en, districtType?]   level 0 = province … 3 = village
let cache = null

export const norm = (s) => s.trim().toLowerCase().replace(/​/g, '')

export function loadIndex() {
  if (!cache) {
    cache = fetch('/data/search.json')
      .then((r) => {
        if (!r.ok) throw new Error('bad response')
        return r.json()
      })
      .then((rows) => {
        const names = new Map()
        const dtype = new Map()
        const items = rows.map((r) => {
          const it = { lvl: r[0], code: r[1], kh: r[2], en: r[3], t: r[4], h: norm(`${r[2]} ${r[3]} ${r[1]}`) }
          names.set(r[1], it)
          if (r[0] === 1) dtype.set(r[1], r[4])
          return it
        })
        return { items, names, dtype }
      })
      .catch((e) => {
        cache = null
        throw e
      })
  }
  return cache
}
