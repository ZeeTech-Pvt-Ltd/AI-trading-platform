import { Link, NavLink } from 'react-router-dom'
import { NAV_LINKS } from '../data/site.js'
import LogoMark from './LogoMark.jsx'

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="header__brand">
          <LogoMark size={40} />
          <span className="header__name">
            AI Trading Platform
            <span className="header__sub">Reviews &amp; verdicts</span>
          </span>
        </Link>

        <nav aria-label="Primary">
          <ul className="header__links">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <NavLink to={link.to} end={link.to === '/'}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <Link to="/" className="btn btn--green btn--sm header__cta">
          All reviews
        </Link>
      </div>
    </header>
  )
}
