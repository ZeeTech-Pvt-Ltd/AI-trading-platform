'use client';

import { useState } from 'react';
import Link from 'next/link';
import { site } from '@/lib/site';
import Search from '@/components/Search';

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Best Platforms', href: '/best-ai-trading-platforms' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Articles', href: '/articles' },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </>
      )}
    </svg>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <button
            type="button"
            className="btt-nav-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="btt-mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav id="btt-mobile-menu" className="btt-mobile-menu" aria-label="Mobile">
          <ul className="btt-mobile-menu__list">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  className="btt-mobile-menu__link"
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
