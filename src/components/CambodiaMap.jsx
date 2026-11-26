import { useEffect, useMemo, useRef, useState } from 'react'
import mapData from '../data/mapData.json'
import { useApp } from '../store'

const MAX_K = 6
const clampView = (x, y, k) => ({
  k,
  x: Math.min(0, Math.max(mapData.w * (1 - k), x)),
  y: Math.min(0, Math.max(mapData.h * (1 - k), y)),
})

// rough text width in px (Khmer stacks vowels/subscripts, so they count less than base letters)
function textWidth(str, fs) {
  let w = 0
  for (const ch of str) {
    const c = ch.codePointAt(0)
    if (c === 0x17d2 || c === 0x200b) continue
    if (c >= 0x17b6 && c <= 0x17d3) w += 0.22
    else if (c >= 0x1780 && c <= 0x17ff) w += 0.64
    else w += 0.6
  }
  return w * fs + 4
}

const DIRS = [
  [1, 0], [-1, 0], [0, -1], [0, 1],
  [0.7, -0.7], [-0.7, -0.7], [0.7, 0.7], [-0.7, 0.7],
]

// Place every name at its province's visual centre; when two names would collide,
// move the later (smaller) one to the nearest free spot and join it with a leader line.
function placeLabels(items, W, H, fs) {
  const h = fs * 1.55
  const placed = []
  const hits = (r) => placed.some((p) => r.x0 < p.x1 && r.x1 > p.x0 && r.y0 < p.y1 && r.y1 > p.y0)
  const inside = (r) => r.x0 >= 2 && r.x1 <= W - 2 && r.y0 >= 2 && r.y1 <= H - 2
  const rect = (cx, cy, w) => ({ x0: cx - w / 2, x1: cx + w / 2, y0: cy - h / 2, y1: cy + h / 2 })

  return [...items]
    .sort((a, b) => b.area - a.area)
    .map((it) => {
      const w = textWidth(it.text, fs)
      let best = null
      outer: for (let step = 0; step <= 9; step++) {
        const rad = step === 0 ? 0 : h * 0.8 + step * h * 0.55
        for (const [dx, dy] of step === 0 ? [[0, 0]] : DIRS) {
          const cx = it.ax + dx * rad * (dx !== 0 && dy === 0 ? 1 + w / (h * 6) : 1)
          const cy = it.ay + dy * rad
          const r = rect(cx, cy, w)
          if (inside(r) && !hits(r)) {
            best = { cx, cy, r, moved: step > 0 }
            break outer
          }
        }
      }
      if (!best) {
        const r = rect(it.ax, it.ay, w)
        best = { cx: it.ax, cy: it.ay, r, moved: false }
      }
      placed.push(best.r)
      // leader ends on the label box edge nearest to the anchor
      const ex = Math.max(best.r.x0, Math.min(it.ax, best.r.x1))
      const ey = Math.max(best.r.y0, Math.min(it.ay, best.r.y1))
      return { ...it, x: best.cx, y: best.cy, moved: best.moved, ex, ey }
    })
}

export default function CambodiaMap({ active, onSelect, mini = false }) {
  const { provinces, shortName, nm, fullName, t, lang } = useApp()
  const wrap = useRef(null)
  const svgRef = useRef(null)
  const moved = useRef(false)
  const [tip, setTip] = useState(null)
  const [view, setView] = useState({ k: 1, x: 0, y: 0 })
  const [width, setWidth] = useState(600)

  useEffect(() => {
    const el = wrap.current
    const upd = () => setWidth(el.clientWidth || 600)
    upd()
    const ro = new ResizeObserver(upd)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const u0 = mapData.w / width // map units per screen pixel at zoom 1
  const H = width * (mapData.h / mapData.w)
  const fontPx = mini ? 11 : width < 420 ? 10 : width < 720 ? 11.5 : 13

  const zoomAt = (f, cx, cy) =>
    setView((v) => {
      const k = Math.min(MAX_K, Math.max(1, v.k * f))
      const r = k / v.k
      return clampView(cx - (cx - v.x) * r, cy - (cy - v.y) * r, k)
    })

  // Ctrl/⌘ + wheel zooms (plain wheel keeps scrolling the page)
  useEffect(() => {
    if (mini) return
    const el = svgRef.current
    const onWheel = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return
      e.preventDefault()
      const r = el.getBoundingClientRect()
      zoomAt(e.deltaY < 0 ? 1.25 : 0.8, ((e.clientX - r.left) / r.width) * mapData.w, ((e.clientY - r.top) / r.height) * mapData.h)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [mini])

  // drag to pan while zoomed in
  const onDown = (e) => {
    if (mini || view.k <= 1 || e.button > 0) return
    const start = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y }
    moved.current = false
    const unit = mapData.w / svgRef.current.clientWidth
    const mv = (ev) => {
      const dx = ev.clientX - start.x
      const dy = ev.clientY - start.y
      if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true
      setView((v) => clampView(start.vx + dx * unit, start.vy + dy * unit, v.k))
    }
    const up = () => {
      window.removeEventListener('pointermove', mv)
      window.removeEventListener('pointerup', up)
      setTimeout(() => (moved.current = false), 0)
    }
    window.addEventListener('pointermove', mv)
    window.addEventListener('pointerup', up)
  }

  const byCode = useMemo(() => Object.fromEntries((provinces || []).map((p) => [p.code, p])), [provinces])
  const shapes = useMemo(
    () => [...mapData.shapes].sort((a, b) => (a.code === active) - (b.code === active)),
    [active]
  )

  // labels live in screen-pixel space so they stay the same size at every width and zoom level
  const labels = useMemo(() => {
    if (!provinces) return []
    const items = mapData.shapes
      .filter((s) => !mini || s.code === active)
      .map((s) => ({
        code: s.code,
        area: s.area,
        text: shortName(byCode[s.code] || { kh: '', en: '' }),
        ax: ((s.cx * view.k + view.x) / mapData.w) * width,
        ay: ((s.cy * view.k + view.y) / mapData.h) * H,
      }))
    return placeLabels(items, width, H, fontPx)
  }, [provinces, mini, active, view, width, H, fontPx, lang, byCode, shortName])

  const move = (e, code) => {
    const r = wrap.current.getBoundingClientRect()
    setTip({ code, x: e.clientX - r.left, y: e.clientY - r.top })
  }
  const tipProv = tip && byCode[tip.code]

  return (
    <div className={'map-wrap' + (mini ? ' mini' : '')} ref={wrap}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${mapData.w} ${mapData.h}`}
        className={'map-svg' + (active ? ' has-active' : '') + (view.k > 1 ? ' zoomed' : '')}
        style={{ touchAction: view.k > 1 ? 'none' : 'auto' }}
        role={mini ? 'img' : 'group'}
        aria-label="Map of Cambodia"
        onPointerDown={onDown}
      >
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          {shapes.map((s) => {
            const p = byCode[s.code]
            const isActive = s.code === active
            return (
              <path
                key={s.code}
                d={s.d}
                vectorEffect="non-scaling-stroke"
                className={'shape ' + (isActive ? 'active' : 'c' + s.ci)}
                {...(mini
                  ? {}
                  : {
                      tabIndex: 0,
                      role: 'button',
                      'aria-pressed': isActive,
                      'aria-label': p ? nm(p)[0] : s.code,
                      onClick: () => !moved.current && onSelect?.(s.code),
                      onKeyDown: (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onSelect?.(s.code)
                        }
                      },
                      onPointerMove: (e) => move(e, s.code),
                      onPointerLeave: () => setTip(null),
                      onBlur: () => setTip(null),
                    })}
              />
            )
          })}
        </g>

        {/* province names, drawn above the shapes in pixel space */}
        <g transform={`scale(${u0})`} className="labels">
          {labels.map((l) =>
            l.moved ? (
              <g key={'l' + l.code}>
                <line x1={l.ax} y1={l.ay} x2={l.ex} y2={l.ey} className="leader" vectorEffect="non-scaling-stroke" />
                <circle cx={l.ax} cy={l.ay} r="2.2" className="leader-dot" />
              </g>
            ) : null
          )}
          {labels.map((l) => (
            <text
              key={l.code}
              x={l.x}
              y={l.y}
              textAnchor="middle"
              dominantBaseline="central"
              className={'map-label' + (l.code === active ? ' active' : '')}
              style={{ fontSize: fontPx, strokeWidth: fontPx * 0.3 }}
            >
              {l.text}
            </text>
          ))}
        </g>
      </svg>

      {!mini && (
        <div className="zoom-ctl">
          <button onClick={() => zoomAt(1.5, mapData.w / 2, mapData.h / 2)} aria-label={t('zoomIn')} title={t('zoomIn')}>
            +
          </button>
          <button onClick={() => zoomAt(1 / 1.5, mapData.w / 2, mapData.h / 2)} aria-label={t('zoomOut')} title={t('zoomOut')}>
            −
          </button>
          <button
            onClick={() => setView({ k: 1, x: 0, y: 0 })}
            aria-label={t('zoomReset')}
            title={t('zoomReset')}
            disabled={view.k === 1}
          >
            ⟲
          </button>
        </div>
      )}

      {!mini && tipProv && (
        <div className="map-tip" style={{ left: tip.x, top: tip.y }}>
          <strong>{fullName(tipProv)}</strong>
          <span>{nm(tipProv)[1]}</span>
        </div>
      )}
    </div>
  )
}
