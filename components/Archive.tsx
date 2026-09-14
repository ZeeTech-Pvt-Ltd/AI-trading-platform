import type { Card } from '@/lib/data';
import PostStream from '@/components/PostStream';
import Pagination from '@/components/Pagination';

export default function Archive({
  cards,
  kicker,
  title,
  description,
  current,
  total,
  base,
  featured = false,
  columns = 1,
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
}) {
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
        <PostStream cards={cards} featured={featured} columns={columns} />
        <Pagination current={current} total={total} base={base} />
      </div>
    </main>
  );
}
