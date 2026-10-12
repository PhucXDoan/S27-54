import { Activity } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link className="app-brand" to="/" aria-label="FoalWatch patient board">
          <span className="app-brand__mark">
            <Activity aria-hidden="true" size={19} strokeWidth={2.4} />
          </span>
          <span>
            <span className="app-brand__name">FoalWatch</span>
            <span className="app-brand__sub">Neonatal monitor</span>
          </span>
        </Link>
        <div className="app-header__meta">
          <span>Equine neonatal unit</span>
          <span className="prototype-label">UI prototype</span>
        </div>
      </div>
    </header>
  )
}
