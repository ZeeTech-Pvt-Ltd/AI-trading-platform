import Link from 'next/link';
import type { Card } from '@/lib/data';
import { getAuthor } from '@/lib/data';
import { formatDate } from '@/lib/format';

export default function PostCard({ card, featured = false }: { card: Card; featured?: boolean }) {
  const avatar = getAuthor(card.authorSlug)?.avatar ?? '';
  const href = `/${card.type}/${card.slug}`;
  const authorHref = `/author/${card.authorSlug}`;

  return (
    <article
      className={`btt-card btt-card--${card.type}${featured ? ' btt-card--featured' : ''} hentry`}
    >
      <div className="btt-card__body">
        <h2 className="btt-card__title">
          <Link href={href}>{card.title}</Link>
        </h2>
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
