import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Card } from '@/lib/data';
import { ratingVerdict } from '@/lib/format';

export default function EditorsPicks({ cards }: { cards: Card[] }) {
  if (!cards.length) return null;

  return (
    <section className="btt-h-leadwrap" id="lead-review">
      <div className="btt-h-picks">
        <span className="btt-h-eyebrow btt-h-eyebrow--dark">★ Editor&rsquo;s Picks</span>
        <div className="btt-h-picks__grid">
          {cards.map((card) => {
            const verdict = ratingVerdict(card.ratingValue);
            const pct = card.ratingValue
              ? (Math.min(5, Math.max(0, Number.parseFloat(card.ratingValue))) / 5) * 100
              : 0;
            return (
              <article className="btt-h-picks__card" key={card.slug}>
                <div className="btt-h-picks__head">
                  <h3 className="btt-h-picks__title">
                    <Link href={`/trading/${card.slug}`}>{card.title}</Link>
                  </h3>
                  {card.ratingValue ? (
                    <span
                      className="btt-h-picks__ring"
                      style={{ '--pct': `${pct}%` } as CSSProperties}
                    >
                      <span className="btt-h-picks__ring__inner">{card.ratingValue}</span>
                    </span>
                  ) : null}
                </div>
                {card.excerpt ? <p className="btt-h-picks__excerpt">{card.excerpt}</p> : null}
                <div className="btt-h-picks__footer">
                  <span className={`btt-h-badge btt-h-badge--${verdict.tone}`}>
                    <span className="btt-h-badge__dot" aria-hidden="true" />
                    {verdict.label}
                  </span>
                  <Link className="btt-h-picks__link" href={`/trading/${card.slug}`}>
                    Read the review →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
