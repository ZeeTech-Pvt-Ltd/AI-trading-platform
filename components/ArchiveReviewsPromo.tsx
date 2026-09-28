import Link from 'next/link';
import TopRatedWidget from './TopRatedWidget';
import { getTopRatedCards } from '@/lib/data';

export default function ArchiveReviewsPromo() {
  return (
    <section className="btt-archive-promo" aria-label="Top rated AI trading platforms">
      <div className="btt-archive-promo__head">
        <h2 className="btt-archive-promo__title">Looking to trade instead?</h2>
        <p className="btt-archive-promo__desc">
          We also review AI-powered trading platforms &mdash; here are our top-rated picks.
        </p>
      </div>
      <div className="btt-archive-promo__widget">
        <TopRatedWidget cards={getTopRatedCards(6)} count={6} />
      </div>
      <Link className="btt-archive-promo__more" href="/best-ai-trading-platforms">
        See the full ranked list →
      </Link>
    </section>
  );
}
