'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  slug: string;
  name: string;
  href: string;
};

// Switch the popup off here without touching the page code.
const SHOW_POPUP = false;

// No timer is involved: the popup opens purely on scroll, once the reader has scrolled down far enough
// for the first call-to-action in the article to come into view.
const FIRST_CTA = '.btt-article__content .bd-product-link, .btt-article__content .bd-banner-cta, .btt-article__content .bd-cta-bar';
// Scroll limit: the CTA counts as reached when its top edge rises above this share of the viewport height
// (0.85 means "as soon as it is on screen"; use 0.5 for "when it reaches the middle").
const REACH_AT = 0.85;
const MIN_SCROLL_PX = 150; // and the reader has really scrolled, so it never opens on page load
const HIDE_DAYS = 7; // after a dismissal or a click it stays away this long
const STORE_KEY = 'btt-popup-hidden-until';

function hiddenNow(): boolean {
  // ?popup=test on any review URL ignores the "hidden for 7 days" memory, so the popup can be checked again
  try {
    if (new URLSearchParams(window.location.search).get('popup') === 'test') return false;
  } catch {
    // ignore
  }
  try {
    const until = Number(window.localStorage.getItem(STORE_KEY) || 0);
    return until > Date.now();
  } catch {
    return false;
  }
}

function hideFor(days: number) {
  try {
    window.localStorage.setItem(STORE_KEY, String(Date.now() + days * 86400000));
  } catch {
    // storage may be blocked; the popup then simply shows once per page view
  }
}

/**
 * A small card, centred on the screen, that appears once the reader has scrolled down to the first
 * call-to-action. It renders nothing on the server and nothing until that happens, so the page HTML,
 * the layout and the crawlable content are unchanged. It does not lock scrolling, does not take focus,
 * closes with the button, the backdrop or Esc, and stays away for a week after that.
 */
export default function ReviewPopup({ name, href }: Props) {
  const [open, setOpen] = useState(false);
  const shown = useRef(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const short = name.length > 22 ? 'This Platform' : name;
  const who = name.length > 22 ? 'this platform' : name;

  useEffect(() => {
    if (!SHOW_POPUP || hiddenNow()) return;

    let pending: number | undefined;

    const check = () => {
      pending = undefined;
      if (shown.current) return;
      const cta = document.querySelector(FIRST_CTA);
      if (!cta || window.scrollY < MIN_SCROLL_PX) return;
      if (cta.getBoundingClientRect().top <= window.innerHeight * REACH_AT) {
        shown.current = true;
        window.removeEventListener('scroll', onScroll);
        setOpen(true);
      }
    };

    function onScroll() {
      if (pending === undefined) pending = window.setTimeout(check, 120);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (pending !== undefined) window.clearTimeout(pending);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function close() {
    hideFor(HIDE_DAYS);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="btt-popup-wrap">
      <div className="btt-popup-backdrop" onClick={close} aria-hidden="true" />
      <aside
        ref={cardRef}
        className="btt-popup"
        role="dialog"
        aria-modal="false"
        aria-label={`More about ${who}`}
      >
      <button type="button" className="btt-popup__close" aria-label="Close" onClick={close}>
        ×
      </button>
      <p className="btt-popup__title">Curious about {who}?</p>
      <p className="btt-popup__text">
        See the platform for yourself. If you do, start with a small amount and check the licence on the
        regulator&rsquo;s register first.
      </p>
      <a
        className="btt-popup__btn"
        href={href}
        rel="sponsored nofollow noopener noreferrer"
        target="_blank"
        onClick={() => hideFor(HIDE_DAYS)}
      >
        Explore {short}
      </a>
      </aside>
    </div>
  );
}
