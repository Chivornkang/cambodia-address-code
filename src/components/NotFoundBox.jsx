import { Link } from 'react-router-dom'
import { useApp } from '../store'

export default function NotFoundBox({ to = '/' }) {
  const { t } = useApp()
  return (
    <div className="container center-box">
      <h1>404</h1>
      <p className="muted">{t('notFound')}</p>
      <Link className="btn" to={to}>
        {t('goHome')}
      </Link>
    </div>
  )
}
