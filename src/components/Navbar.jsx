import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useApp } from '../store'

// Hide on scroll down, show on scroll up.
function useScrollHide() {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    let last = window.scrollY
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const d = y - last
        if (Math.abs(d) > 6) {
          setHidden(y > 80 && d > 0)
          last = y
        }
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return hidden
}

const Icon = ({ children }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

export default function Navbar({ onSearch }) {
  const { t, lang, setLang, theme, setTheme } = useApp()
  const hidden = useScrollHide()

  return (
    <header className={'dock-wrap' + (hidden ? ' hide' : '')}>
      <nav className="dock" aria-label="Main">
        <Link to="/" className="dock-brand" aria-label={t('appName')}>
          <img src="/favicon.svg" alt="" width="34" height="34" />
          <span className="dock-brand-text">{t('appName')}</span>
        </Link>
        <span className="dock-sep" />
        <button className="dock-item" onClick={onSearch} aria-label={t('navSearch')}>
          <Icon>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </Icon>
          <span className="label">{t('navSearch')}</span>
        </button>
        <NavLink to="/provinces" className="dock-item">
          <Icon>
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </Icon>
          <span className="label">{t('navProvinces')}</span>
        </NavLink>
        <span className="dock-sep" />
        <button className="dock-btn" onClick={() => setLang(lang === 'kh' ? 'en' : 'kh')} aria-label="Language">
          {lang === 'kh' ? 'EN' : 'ខ្មែរ'}
        </button>
        <button className="dock-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Theme">
          {theme === 'dark' ? (
            <Icon>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </Icon>
          ) : (
            <Icon>
              <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
            </Icon>
          )}
        </button>
      </nav>
    </header>
  )
}
