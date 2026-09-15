import Link from 'next/link';
import type { Card } from '@/lib/data';
import { brandName } from '@/lib/format';

export default function TopRatedWidget({
  cards,
  excludeSlug,
  count = 5,
}: {
  cards: Card[];
  excludeSlug?: string;
  count?: number;
}) {
  const items = cards.filter((c) => c.slug !== excludeSlug).slice(0, count);
  if (!items.length) return null;

  return (
    <aside className="btt-h-toprated">
      <div className="btt-h-toprated__head">
        <span>Top rated</span>
        <span className="btt-h-toprated__sub">Our scores</span>
      </div>
      <ol className="btt-h-toprated__list">
        {items.map((c, i) => (
          <li key={c.slug}>
            <Link href={`/${c.type}/${c.slug}`}>
              <span className="btt-h-toprated__rank">{String(i + 1).padStart(2, '0')}</span>
              <span className="btt-h-toprated__name">{brandName(c.title)}</span>
              <span className="btt-h-toprated__score">{c.ratingValue}</span>
            </Link>
          </li>
        ))}
      </ol>
      <Link className="btt-h-toprated__more" href="/reviews">
        View all reviews →
      </Link>
    </aside>
  );
}
