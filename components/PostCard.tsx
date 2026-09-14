import Link from 'next/link';
import type { Card } from '@/lib/data';
import { getAuthor } from '@/lib/data';
import { formatDate } from '@/lib/format';

/** Brand name = the part of a review title before "Review". Falls back to the full title. */
function brandName(card: Card): string {
  const m = card.title.match(/^(.*?)\s+Review\b/i);
  return m ? m[1].trim() : card.title.trim();
}

export default function PostCard({ card, featured = false }: { card: Card; featured?: boolean }) {
  const avatar = getAuthor(card.authorSlug)?.avatar ?? '';
  const href = `/${card.type}/${card.slug}`;
  const authorHref = `/author/${card.authorSlug}`;

  const isTrading = card.type === 'trading';
  const rating = card.ratingValue;
  const monogram = isTrading ? (brandName(card).charAt(0) || '?').toUpperCase() : '₿';
  const ratingPct =
    rating && !Number.isNaN(Number.parseFloat(rating))
      ? `${(Math.min(5, Math.max(0, Number.parseFloat(rating))) / 5) * 100}%`
      : '0%';

  return (
    <article
      className={`btt-card btt-card--${card.type}${featured ? ' btt-card--featured' : ''} hentry`}
    >
      <div className="btt-card__body">
        <div className="btt-card__head">
          <span className={`btt-card__logo btt-card__logo--${card.type}`} aria-hidden="true">
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
              {card.date && card.readingTime ? (
                <span className="btt-card__dot" aria-hidden="true">
                  ·
                </span>
              ) : null}
              {card.readingTime ? <span>{card.readingTime}</span> : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
