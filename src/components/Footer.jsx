import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store'

const SOURCE_URL = 'https://data.mef.gov.kh/datasets/pd_68e370856a965e00074a5e7b'
const BOUNDS_URL = 'https://www.geoboundaries.org/visualize?version=current&country=KHM&level=ADM1&detail=simplified'
const TELEGRAM_URL = 'https://t.me/chivornkang'

const TelegramIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill="#29a9eb" />
    <path
      fill="#fff"
      d="M5.4 11.9l11.3-4.4c.5-.2 1 .1.8.9l-1.9 9c-.1.6-.5.8-1 .5l-2.9-2.1-1.4 1.4c-.2.2-.3.3-.6.3l.2-3 5.4-4.9c.2-.2 0-.3-.4-.1L8.2 13.7l-2.9-.9c-.6-.2-.6-.6.1-.9z"
    />
  </svg>
)

const ExtIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />
  </svg>
)

// "Contact me" button: click to open a small dropdown with the Telegram link.
function ContactMenu() {
  const { t } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="contact" ref={ref}>
      <button className="contact-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
          <path d="M3 7l9 6 9-6" />
        </svg>
        {t('contactMe')}
        <svg className={'chev' + (open ? ' up' : '')} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="contact-menu" role="menu">
          <a role="menuitem" href={TELEGRAM_URL} target="_blank" rel="noreferrer noopener">
            <TelegramIcon />
            <span>
              <small>Telegram</small>
              <b>t.me/@chivornkang</b>
            </span>
          </a>
        </div>
      )}
    </div>
  )
}

export default function Footer() {
  const { t } = useApp()
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <img src="/favicon.svg" alt="" width="34" height="34" />
            <strong>{t('appName')}</strong>
          </div>
          <p className="muted footer-about">{t('footerAbout')}</p>
          <p className="footer-tag">{t('footerTag')}</p>
        </div>

        <div>
          <h4>{t('footerLinks')}</h4>
          <ul>
            <li>
              <Link to="/">{t('appName')}</Link>
            </li>
            <li>
              <Link to="/provinces">{t('navProvinces')}</Link>
            </li>
            <li>
              <ContactMenu />
            </li>
          </ul>
        </div>

        <div>
          <h4>{t('footerData')}</h4>
          <ul className="sources">
            <li>
              <a className="source" href={SOURCE_URL} target="_blank" rel="noreferrer noopener">
                <span>
                  <b>{t('footerList')}</b>
                  <small>{t('footerListSub')}</small>
                </span>
                <ExtIcon />
              </a>
            </li>
            <li>
              <a className="source" href={BOUNDS_URL} target="_blank" rel="noreferrer noopener">
                <span>
                  <b>geoBoundaries</b>
                  <small>{t('footerBounds')}</small>
                </span>
                <ExtIcon />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} {t('appName')}. {t('rights')}
        </span>
      </div>
    </footer>
  )
}
