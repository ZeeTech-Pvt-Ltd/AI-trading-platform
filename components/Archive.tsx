import type { Card } from '@/lib/data';
import PostStream from '@/components/PostStream';
import Pagination from '@/components/Pagination';
import SortableGrid from '@/components/SortableGrid';

export default function Archive({
  cards,
  kicker,
  title,
  description,
  current,
  total,
  base,
  featured = false,
  columns = 2,
  sortable = false,
}: {
  cards: Card[];
  kicker: string;
  title: string;
  description: string;
  current: number;
  total: number;
  base: string;
  featured?: boolean;
  columns?: 1 | 2 | 3;
  sortable?: boolean;
}) {
  const grid = <PostStream cards={cards} featured={featured} columns={columns} />;

  return (
    <main id="primary" className="lucky-site-main btt-home">
      <section className="btt-archive">
        <div className="btt-archive__inner">
          <span className="btt-archive__kicker">{kicker}</span>
          <h1 className="btt-archive__title">{title}</h1>
          <p className="btt-archive__desc">{description}</p>
        </div>
      </section>

      <div className="lucky-container btt-home__container">
        {sortable ? <SortableGrid cards={cards}>{grid}</SortableGrid> : grid}
        <Pagination current={current} total={total} base={base} />
      </div>
    </main>
  );
}
