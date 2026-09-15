import Link from 'next/link';
import { site } from '@/lib/site';

const COLUMNS = [
  {
    heading: 'About',
    text: `${site.name} publishes independent crypto and AI trading platform reviews and deep technical writing on Bitcoin development.`,
  },
  {
    heading: 'Explore',
    links: [
      { label: 'Crypto Platform Reviews', href: '/reviews' },
      { label: 'Bitcoin Articles', href: '/articles' },
      { label: 'All Authors', href: '/authors' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'How We Review', href: '/how-we-review' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Affiliate Disclosure', href: '/affiliate-disclosure' },
      { label: 'Disclaimer', href: '/disclaimer' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms-of-use' },
    ],
  },
];

const MENU = [
  { label: 'Home', href: '/' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Articles', href: '/articles' },
];

export default function Footer() {
  return (
    <footer id="colophon" className="lucky-site-footer btt-footer">
      <div className="lucky-container btt-footer__inner">
        <div className="btt-footer__columns">
          {COLUMNS.map((col) => (
            <div className="btt-footer__column" key={col.heading}>
              <h3 className="btt-footer__heading">{col.heading}</h3>
              {col.links ? (
                <nav aria-label={col.heading}>
                  <ul className="btt-footer__menu">
                    {col.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href}>{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : (
                <p className="btt-footer__text">{col.text}</p>
              )}
            </div>
          ))}
        </div>

        <div className="btt-footer__bottom">
          <div className="btt-footer__brand">
            <Link className="btt-footer__brand-link" href="/">
              <span className="btt-wordmark">
                <span className="btt-wordmark__check" aria-hidden="true">
                  ✓
                </span>
                <span>AI Trading</span>
                <span className="btt-wordmark__accent">Platform</span>
              </span>
            </Link>
          </div>

          <nav className="btt-footer__nav" aria-label="Footer menu">
            <ul className="btt-footer__menu">
              {MENU.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="btt-footer__legal">
          &copy; {new Date().getFullYear()} {site.name}. All rights reserved. Content is for
          information only and is not financial advice. See our{' '}
          <Link href="/disclaimer">disclaimer</Link>.
        </p>
      </div>
    </footer>
  );
}
