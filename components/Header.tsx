import Link from 'next/link';
import { site } from '@/lib/site';
import Search from '@/components/Search';

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Best Platforms', href: '/best-ai-trading-platforms' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Articles', href: '/articles' },
];

export default function Header() {
  return (
    <header id="masthead" className="lucky-site-header">
      <div className="lucky-container lucky-header-inner">
        <div className="lucky-site-branding">
          <div className="btt-brand">
            <div className="btt-brand__site">
              <Link
                className="btt-brand__site-link"
                href="/"
                rel="home"
                title={site.name}
              >
                <span className="btt-brand__text">
                  <span className="btt-wordmark">
                    <span className="btt-wordmark__check" aria-hidden="true">
                      ✓
                    </span>
                    <span>AI Trading</span>
                    <span className="btt-wordmark__accent">Platform</span>
                  </span>
                  <span className="btt-brand__tagline">
                    verified &amp; honest reviews
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="btt-header-actions">
          <nav className="btt-nav" aria-label="Primary">
            <ul className="btt-nav__list">
              {NAV.map((item) => (
                <li className="btt-nav__item" key={item.href}>
                  <Link className="btt-nav__link" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Search />
        </div>
      </div>
    </header>
  );
}
