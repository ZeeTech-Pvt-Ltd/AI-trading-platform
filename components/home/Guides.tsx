import Link from 'next/link';
import { getAllCards, cardDate } from '@/lib/data';
import { formatDate } from '@/lib/format';
import Section from './Section';

type GuidesProps = {
  /** Number of recent guides to show. Defaults to 4. */
  count?: number;
};

/**
 * Most recent guide articles, newest first. Server-rendered from the real
 * content model (the `bitcoin` article type); excerpts come from the content.
 */
export default function Guides({ count = 4 }: GuidesProps) {
  const guides = getAllCards()
    .filter((c) => c.type === 'bitcoin')
    .sort((a, b) => (cardDate(b) > cardDate(a) ? 1 : -1))
    .slice(0, count);

  return (
    <Section id="guides" className="home-section--guides">
      <div className="guides__header">
        <h2 className="home-section__title">Guides</h2>
        <Link className="guides__all" href="/articles">
          All guides
        </Link>
      </div>
      {guides.length === 0 ? (
        <p className="guides__empty">No guides published yet.</p>
      ) : (
        <ul className="guides__list">
          {guides.map((card) => {
            const iso = cardDate(card);
            return (
              <li key={card.slug}>
                <Link className="guides__item" href={`/bitcoin/${card.slug}`}>
                  <span className="guides__head">
                    <span className="guides__title">{card.title}</span>
                    <time className="guides__date" dateTime={iso}>
                      {formatDate(iso)}
                    </time>
                  </span>
                  <span className="guides__excerpt">{card.excerpt}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
