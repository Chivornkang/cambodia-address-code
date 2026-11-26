import { Link } from 'react-router-dom'
import { useApp } from '../store'

export default function Footer() {
  const { t } = useApp()
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <img src="/favicon.svg" alt="" width="30" height="30" />
            <strong>{t('appName')}</strong>
          </div>
          <p className="muted">{t('footerAbout')}</p>
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
          </ul>
        </div>
        <div>
          <h4>{t('footerData')}</h4>
          <ul className="muted">
            <li>{t('footerList')}</li>
            <li>
              <a href="https://www.geoboundaries.org" target="_blank" rel="noreferrer">
                {t('footerBounds')}
              </a>
            </li>
            <li>{t('footerTypes')}</li>
            <li>{t('footerNote')}</li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        © {new Date().getFullYear()} {t('appName')}. {t('rights')}
      </div>
    </footer>
  )
}
