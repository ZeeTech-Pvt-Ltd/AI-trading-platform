import Link from 'next/link';
import { getAllCards, brandName, type Card } from '@/lib/data';
import { formatDate } from '@/lib/format';
import Section from './Section';

type HighRiskProps = {
  /** Number of high-risk platforms to show. Defaults to 6. */
  count?: number;
};

/**
 * Compact list of platforms currently carrying a high-risk verdict.
 * Server-rendered from real verdict data only — never generated entries.
 * Rows lacking a last-checked date are dropped per editorial policy.
 */
export default function HighRisk({ count = 6 }: HighRiskProps) {
  const rows = getAllCards()
    .filter(
      (c): c is Card & { lastChecked: string } =>
        c.verdict === 'risk' && Boolean(c.lastChecked),
    )
    .sort((a, b) => (b.lastChecked > a.lastChecked ? 1 : -1))
    .slice(0, count);

  return (
    <Section id="high-risk" className="home-section--high-risk">
      <div className="high-risk__header">
        <h2 className="home-section__title">High-risk platforms</h2>
        <Link className="high-risk__all" href="/high-risk">
          View all
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="high-risk__empty">
          No platforms are currently flagged as high risk.
        </p>
      ) : (
        <ul className="high-risk__list">
          {rows.map((card) => (
            <li key={card.slug}>
              <Link className="high-risk__item" href={`/trading/${card.slug}`}>
                <span className="high-risk__head">
                  <span className="high-risk__name">{brandName(card.title)}</span>
                  <time className="high-risk__date" dateTime={card.lastChecked}>
                    Last checked {formatDate(card.lastChecked)}
                  </time>
                </span>
                {card.riskReason ? (
                  <span className="high-risk__reason">{card.riskReason}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
