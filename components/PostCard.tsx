import Link from 'next/link';
import type { Card } from '@/lib/data';
import { getAuthor } from '@/lib/data';
import { formatDate, brandName, ratingVerdict } from '@/lib/format';

const LOGO_COLOR_COUNT = 8;

/** Deterministic 0..N-1 index from a string, so each platform keeps the same color. */
function colorIndex(name: string, count: number): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return hash % count;
}

export default function PostCard({ card, featured = false }: { card: Card; featured?: boolean }) {
  const avatar = getAuthor(card.authorSlug)?.avatar ?? '';
  const href = `/${card.type}/${card.slug}`;
  const authorHref = `/author/${card.authorSlug}`;

  const isTrading = card.type === 'trading';
  const rating = card.ratingValue;
  const name = brandName(card.title);
  const monogram = isTrading ? (name.charAt(0) || '?').toUpperCase() : '₿';
  const logoClass = isTrading
    ? `btt-card__logo--trading btt-card__logo--c${colorIndex(name, LOGO_COLOR_COUNT)}`
    : 'btt-card__logo--bitcoin';
  const ratingPct =
    rating && !Number.isNaN(Number.parseFloat(rating))
      ? `${(Math.min(5, Math.max(0, Number.parseFloat(rating))) / 5) * 100}%`
      : '0%';
  const verdict = isTrading && rating ? ratingVerdict(rating) : null;

  return (
    <article
      className={`btt-card btt-card--${card.type}${featured ? ' btt-card--featured' : ''} hentry`}
      data-slug={`${card.type}/${card.slug}`}
    >
      <div className="btt-card__body">
        <div className="btt-card__head">
          <span className={`btt-card__logo ${logoClass}`} aria-hidden="true">
            {monogram}
          </span>
          <div className="btt-card__head-text">
            <h2 className="btt-card__title">
              <Link href={href}>{card.title}</Link>
            </h2>
            {isTrading && rating ? (
              <span
                className="btt-rating"
                role="img"
                aria-label={`Rated ${rating} out of 5`}
              >
                <span className="btt-stars" aria-hidden="true">
                  ★★★★★
                  <span className="btt-stars__fill" style={{ width: ratingPct }}>
                    ★★★★★
                  </span>
                </span>
                <strong className="btt-rating__value">{rating}</strong>
                <span className="btt-rating__max">/ 5</span>
              </span>
            ) : null}
          </div>
        </div>
        {card.excerpt ? <p className="btt-card__excerpt">{card.excerpt}</p> : null}
        <div className="btt-card__meta">
          <Link className="btt-card__avatar" href={authorHref}>
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                src={avatar}
                className="avatar avatar-36 photo"
                height="36"
                width="36"
                decoding="async"
              />
            ) : null}
          </Link>
          <div className="btt-card__meta-text">
            <Link className="btt-card__author" href={authorHref} rel="author">
              {card.author}
            </Link>
            <div className="btt-card__meta-sub">
              {card.date ? <time dateTime={card.date}>{formatDate(card.date)}</time> : null}
            </div>
          </div>
          {verdict ? (
            <span className={`btt-h-badge btt-h-badge--${verdict.tone} btt-card__verdict`}>
              <span className="btt-h-badge__dot" aria-hidden="true" />
              {verdict.label}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
