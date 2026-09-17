'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Card } from '@/lib/data';

type SortMode = 'all' | 'top' | 'newest';

const CHIPS: { mode: SortMode; label: string }[] = [
  { mode: 'all', label: 'All' },
  { mode: 'top', label: 'Top Rated' },
  { mode: 'newest', label: 'Newest' },
];

function keyOf(card: Card) {
  return `${card.type}/${card.slug}`;
}

// Cards are rendered server-side (children) so PostCard/PostStream never
// enter the client bundle (they depend on lib/data's fs/path reads). This
// component only reorders the already-rendered DOM nodes via CSS `order`,
// matched up by the data-slug attribute PostCard renders on each card.
export default function SortableGrid({
  cards,
  heading,
  children,
}: {
  cards: Card[];
  heading?: ReactNode;
  children: ReactNode;
}) {
  const [sort, setSort] = useState<SortMode>('all');
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = gridRef.current;
    if (!container) return;

    let ordered = cards;
    if (sort === 'top') {
      ordered = [...cards].sort(
        (a, b) => Number.parseFloat(b.ratingValue ?? '0') - Number.parseFloat(a.ratingValue ?? '0'),
      );
    } else if (sort === 'newest') {
      ordered = [...cards].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    const rank = new Map(ordered.map((card, i) => [keyOf(card), i]));
    container.querySelectorAll<HTMLElement>('[data-slug]').forEach((node) => {
      const i = rank.get(node.dataset.slug ?? '');
      node.style.order = i !== undefined ? String(i) : '';
    });
  }, [cards, sort]);

  const chips = (
    <div className="btt-latest-filters" role="group" aria-label="Sort reviews">
      {CHIPS.map((chip) => (
        <button
          key={chip.mode}
          type="button"
          className={`btt-latest-filters__chip${sort === chip.mode ? ' btt-latest-filters__chip--active' : ''}`}
          aria-pressed={sort === chip.mode}
          onClick={() => setSort(chip.mode)}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      {heading ? (
        <div className="btt-h-latest__head">
          {heading}
          {chips}
        </div>
      ) : (
        <div className="btt-sortable-grid__bar">{chips}</div>
      )}
      <div ref={gridRef}>{children}</div>
    </div>
  );
}
