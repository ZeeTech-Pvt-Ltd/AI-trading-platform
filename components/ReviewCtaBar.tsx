'use client';

import { useEffect, useRef, useState } from 'react';

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
  if (link.closest('.btt-sticky-cta')) return 'sticky_mobile';
  if (link.closest('.btt-side-card')) return 'sidebar';
  if (link.closest('.btt-article__quickverdict')) return 'top_quickverdict';
  if (link.closest('.bd-banner-cta')) return 'content_banner';
  if (content && content.contains(link)) {
    const box = content.getBoundingClientRect();
    const at = link.getBoundingClientRect().top - box.top;
    const ratio = box.height > 0 ? at / box.height : 0;
    return ratio < 0.34 ? 'content_top' : ratio < 0.67 ? 'content_mid' : 'content_bottom';
  }
  return 'other';
}

export default function ReviewCtaBar({ slug, name, href, score }: Props) {
  const [visible, setVisible] = useState(false);
  const pastHero = useRef(false);
  const nearEnd = useRef(false);

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

  // Mobile bar: appears once the reader scrolls past the intro, hides again near the
  // closing banner and the related reviews so it never sits on top of another CTA.
  useEffect(() => {
    const update = () => setVisible(pastHero.current && !nearEnd.current);

    const onScroll = () => {
      pastHero.current = window.scrollY > 600;
      update();
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const watched = Array.from(
      document.querySelectorAll('.bd-banner-cta, .btt-related'),
    );
    const inView = new Set<Element>();
    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined' && watched.length) {
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inView.add(entry.target);
          else inView.delete(entry.target);
        }
        nearEnd.current = inView.size > 0;
        update();
      });
      watched.forEach((el) => observer!.observe(el));
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer?.disconnect();
    };
  }, []);

  return (
    <div
      className={`btt-sticky-cta${visible ? ' is-visible' : ''}`}
      aria-hidden={!visible}
    >
      <div className="btt-sticky-cta__info">
        <span className="btt-sticky-cta__name">{name}</span>
        {score ? <span className="btt-sticky-cta__score">Our score: {score}/5</span> : null}
      </div>
      <a
        className="btt-h-btn btt-h-btn--primary btt-sticky-cta__btn"
        href={href}
        rel="sponsored nofollow noopener noreferrer"
        target="_blank"
        tabIndex={visible ? 0 : -1}
      >
        Visit {name} →
      </a>
    </div>
  );
}
