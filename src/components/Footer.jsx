import { Link } from 'react-router-dom'
import { REVIEWS } from '../data/reviews/index.js'
import { SITE } from '../data/site.js'
import LogoMark from './LogoMark.jsx'

const PUBLICATION_LINKS = [
  { label: 'About the desk', to: '/about' },
  { label: 'Advertising disclosure', to: '/advertising-disclosure' },
  { label: 'Risk disclosure', to: '/risk-disclosure' },
  { label: 'Privacy policy', to: '/privacy-policy' },
  { label: 'Terms of use', to: '/terms-of-use' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand">
              <LogoMark size={38} />
              <p className="footer__brand-name">AI Trading Platform Reviews</p>
            </div>
            <p className="footer__brand-deck">
              Editorial reviews of AI-powered trading platforms. We read what each platform
              publishes, flag what it doesn&rsquo;t, and hand down a verdict.
            </p>
          </div>

          <nav aria-label="Reviews">
            <h2 className="footer__title">Reviews</h2>
            <ul className="footer__list">
              {REVIEWS.map((r) => (
                <li key={r.slug}>
                  <Link to={r.path}>
                    {r.name} <span className="footer__score">— {r.rating.toFixed(1)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Publication">
            <h2 className="footer__title">Publication</h2>
            <ul className="footer__list">
              {PUBLICATION_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="footer__bottom">
          <span>© 2026 {SITE.name}. All rights reserved.</span>
          <span>Reviews are editorial. Some outbound links are affiliate links.</span>
          <span>Nothing on this site is financial advice.</span>
        </div>
      </div>
    </footer>
  )
}
