import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DKEY, cKeyOf, pKeyOf, useApp } from '../store'
import { loadIndex, norm } from '../searchIndex'
import { slug } from '../slug'

const CAPS = [6, 10, 12, 24] // max results per level: province, district, commune, village

export default function SearchOverlay({ open, onClose }) {
  const { t, typed, typed2, plural, fullName } = useApp()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const dq = useDeferredValue(q)
  const [index, setIndex] = useState(null)
  const [failed, setFailed] = useState(false)
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    if (!open) {
      setQ('')
      setCursor(0)
      return
    }
    setFailed(false)
    loadIndex().then(setIndex).catch(() => setFailed(true))
    const id = setTimeout(() => inputRef.current?.focus(), 30)
    return () => clearTimeout(id)
  }, [open])

  const keyOf = (it, idx) =>
    it.lvl === 0 ? pKeyOf(it.code) : it.lvl === 1 ? DKEY[it.t] : it.lvl === 2 ? cKeyOf(idx.dtype.get(it.code.slice(0, 4))) : 'village'

  const results = useMemo(() => {
    if (!index) return []
    const s = norm(dq)
    if (!s) return index.items.filter((i) => i.lvl === 0).map((it) => ({ it, key: keyOf(it, index) }))
    const buckets = [[], [], [], []]
    for (const it of index.items) {
      if (!it.h.includes(s)) continue
      const starts = it.kh.startsWith(s) || it.en.toLowerCase().startsWith(s) || it.code === s ? 0 : 1
      buckets[it.lvl].push({ it, score: starts })
    }
    return buckets.flatMap((b, i) =>
      b
        .sort((a, c) => a.score - c.score)
        .slice(0, CAPS[i])
        .map(({ it }) => ({ it, key: keyOf(it, index) }))
    )
  }, [index, dq])

  useEffect(() => setCursor(0), [dq])
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  if (!open) return null

  // ancestors, nearest first: commune → district → province
  const trail = (it) => {
    const parts = []
    const get = (c) => index.names.get(c)
    if (it.lvl === 3) {
      const c = get(it.code.slice(0, 6))
      if (c) parts.push(typed(cKeyOf(index.dtype.get(it.code.slice(0, 4))), c))
    }
    if (it.lvl >= 2) {
      const d = get(it.code.slice(0, 4))
      if (d) parts.push(typed(DKEY[d.t], d))
    }
    if (it.lvl >= 1) {
      const p = get(it.code.slice(0, 2))
      if (p) parts.push(fullName(p))
    }
    return parts.join(' · ')
  }

  const go = (it) => {
    const to =
      it.lvl === 0 ? `/province/${slug(it.en)}`
      : it.lvl === 1 ? `/district/${slug(index.names.get(it.code.slice(0, 2))?.en || it.code.slice(0, 2))}/${slug(it.en)}`
      : it.lvl === 2 ? `/commune/${it.code}`
      : `/commune/${it.code.slice(0, 6)}?v=${it.code}`
    onClose()
    nav(to)
  }

  const onKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => Math.min(results.length - 1, c + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => Math.max(0, c - 1))
    } else if (e.key === 'Enter' && results[cursor]) {
      go(results[cursor].it)
    }
  }

  let lastLvl = -1
  return (
    <div className="so-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="so-box" role="dialog" aria-modal="true" aria-label={t('navSearch')}>
        <div className="so-bar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder={t('searchAll')}
            aria-label={t('searchAll')}
          />
          <button className="icon-btn" onClick={onClose} aria-label={t('close')}>
            ✕
          </button>
        </div>

        <div className="so-list" ref={listRef}>
          {failed && <p className="notice so-pad">{t('loadError')}</p>}
          {!index && !failed && <p className="muted so-pad">{t('searchLoading')}</p>}
          {index && !norm(dq) && <p className="muted small so-pad">{t('searchHint')}</p>}
          {index && norm(dq) && results.length === 0 && <p className="muted so-pad">{t('noResults')}</p>}

          {results.map(({ it, key }, i) => {
            const head = it.lvl !== lastLvl
            lastLvl = it.lvl
            const groupKey = it.lvl === 0 ? 'province' : it.lvl === 1 ? 'srok' : it.lvl === 2 ? 'khum' : 'village'
            return (
              <div key={it.code}>
                {head && <div className="so-group">{it.lvl === 0 ? t('provinces') : it.lvl === 1 ? t('districts') : it.lvl === 2 ? t('communes') : plural(groupKey)}</div>}
                <button
                  className="so-item"
                  data-active={i === cursor}
                  onMouseMove={() => setCursor(i)}
                  onClick={() => go(it)}
                >
                  <span className={'so-dot l' + it.lvl} />
                  <span className="so-text">
                    <b>{typed(key, it)}</b>
                    <small className="muted">{typed2(key, it)}</small>
                    {it.lvl > 0 && <small className="line">{trail(it)}</small>}
                  </span>
                  <span className="badge">{it.code}</span>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
