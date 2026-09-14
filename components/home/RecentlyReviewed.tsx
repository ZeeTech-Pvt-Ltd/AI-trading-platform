import Link from 'next/link';
import { getAllCards, brandName, cardDate } from '@/lib/data';
import { formatDate } from '@/lib/format';
import VerdictBadge from './VerdictBadge';
import Section from './Section';

type RecentlyReviewedProps = {
  /** Number of recent reviews to show. Defaults to 8. */
  count?: number;
};

/**
 * Most recent reviews, newest first. Server-rendered from the content model;
 * ordered by `dateModified` when present, falling back to publish `date`.
 */
export default function RecentlyReviewed({ count = 8 }: RecentlyReviewedProps) {
  const reviews = getAllCards()
    .filter((c) => c.type === 'trading')
    .sort((a, b) => (cardDate(b) > cardDate(a) ? 1 : -1))
    .slice(0, count);

  return (
    <Section id="recently-reviewed" className="home-section--recently-reviewed">
      <h2 className="home-section__title">Recently reviewed</h2>
      {reviews.length === 0 ? (
        <p className="recently-reviewed__empty">No reviews published yet.</p>
      ) : (
        <ul className="recently-reviewed__list">
          {reviews.map((card) => {
            const iso = cardDate(card);
            return (
              <li key={card.slug}>
                <Link
                  className="recently-reviewed__item"
                  href={`/trading/${card.slug}`}
                >
                  <span className="recently-reviewed__head">
                    <span className="recently-reviewed__meta">
                      <span className="recently-reviewed__name">
                        {brandName(card.title)}
                      </span>
                      <VerdictBadge verdict={card.verdict} />
                      {card.markets && card.markets.length > 0 ? (
                        <span className="recently-reviewed__markets">
                          {card.markets.map((m) => (
                            <span key={m} className="recently-reviewed__market">
                              {m}
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </span>
                    <time className="recently-reviewed__date" dateTime={iso}>
                      {formatDate(iso)}
                    </time>
                  </span>
                  <span className="recently-reviewed__summary">
                    {card.excerpt}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
