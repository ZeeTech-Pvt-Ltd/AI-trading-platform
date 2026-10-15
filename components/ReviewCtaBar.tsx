'use client';

import { useEffect } from 'react';

type Props = {
  slug: string;
  name: string;
  href: string;
  score?: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Which part of the review page an outbound CTA click came from.
function ctaPosition(link: HTMLAnchorElement, content: Element | null): string {
  if (link.closest('.btt-popup')) return 'popup';
  if (link.closest('.btt-sticky-cta')) return 'sticky_mobile';
  if (link.closest('.btt-side-card')) return 'sidebar';
  if (link.closest('.btt-article__quickverdict')) return 'top_quickverdict';
  if (content && content.contains(link)) {
    const box = content.getBoundingClientRect();
    const at = link.getBoundingClientRect().top - box.top;
    const ratio = box.height > 0 ? at / box.height : 0;
    const zone = ratio < 0.34 ? 'top' : ratio < 0.67 ? 'mid' : 'bottom';
    return link.closest('.bd-banner-cta') ? `content_banner_${zone}` : `content_${zone}`;
  }
  if (link.closest('.bd-banner-cta')) return 'content_banner';
  return 'other';
}

// The bottom sticky bar is switched off for now; set to true to bring it back. Click tracking below always runs.
const SHOW_STICKY_BAR = false;

export default function ReviewCtaBar({ slug, name, href }: Props) {

  // Click tracking: one GA4 event for every outbound click on this review's affiliate link.
  useEffect(() => {
    let host = '';
    try {
      host = new URL(href).host;
    } catch {
      return;
    }
    const content = document.querySelector('.btt-article__content');

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const link = target?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link || link.host !== host) return;
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.btt-article a[href]')).filter(
        (a) => a.host === host,
      );
      try {
        window.gtag?.('event', 'cta_click', {
          review_slug: slug,
          cta_position: ctaPosition(link, content),
          cta_index: links.indexOf(link) + 1,
          cta_text: (link.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
          destination: host,
          transport_type: 'beacon',
        });
      } catch {
        // tracking must never block the click
      }
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [slug, href]);

  if (!SHOW_STICKY_BAR) return null;

  const who = name.length > 22 ? 'this platform' : name;

  return (
    <div className="btt-sticky-cta is-visible">
      <div className="btt-sticky-cta__info">
        <span className="btt-sticky-cta__name">Curious about {who}? See it for yourself.</span>
        <span className="btt-sticky-cta__score">Create a free account with just your name and email, and get a free consultation to ask your questions before you decide.</span>
      </div>
      <a
        className="btt-h-btn btt-h-btn--primary btt-sticky-cta__btn"
        href={href}
        rel="sponsored nofollow noopener noreferrer"
        target="_blank"
      >
        RESERVE YOUR FREE SEAT
      </a>
    </div>
  );
}
