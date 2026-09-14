import type { Card } from '@/lib/data';
import PostCard from './PostCard';

export default function PostStream({
  cards,
  featured = false,
  columns = 3,
}: {
  cards: Card[];
  featured?: boolean;
  columns?: 1 | 2 | 3;
}) {
  if (!cards.length) return null;

  const [first, ...rest] = cards;
  const grid = featured && first ? rest : cards;
  const gridClass =
    columns === 2
      ? 'btt-stream__grid btt-stream__grid--2'
      : columns === 1
        ? 'btt-stream__grid btt-stream__grid--1'
        : 'btt-stream__grid';

  return (
    <div className="btt-stream">
      {featured && first ? <PostCard card={first} featured /> : null}
      <div className={gridClass}>
        {grid.map((card) => (
          <PostCard key={`${card.type}/${card.slug}`} card={card} />
        ))}
      </div>
    </div>
  );
}
