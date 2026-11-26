import { useEffect, useState } from 'react'

const cache = new Map()

// Loads /data/p/<code>.json (districts → communes → villages) with an in-memory cache.
export function useProvinceData(code) {
  const [data, setData] = useState(() => (code ? cache.get(code) || null : null))
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!code) return
    setError(false)
    if (cache.has(code)) {
      setData(cache.get(code))
      return
    }
    setData(null)
    let off = false
    fetch(`/data/p/${code}.json`)
      .then((r) => {
        if (!r.ok) throw new Error('bad response')
        return r.json()
      })
      .then((d) => {
        cache.set(code, d)
        if (!off) setData(d)
      })
      .catch(() => !off && setError(true))
    return () => {
      off = true
    }
  }, [code])

  return { data: data && data.code === code ? data : null, error }
}
