import type { Metadata } from 'next';
import { searchCards } from '@/lib/search';
import PostCard from '@/components/PostCard';

export const metadata: Metadata = {
  title: 'Search',
  alternates: { canonical: '/search' },
  robots: { index: false },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const results = searchCards(query);

  return (
    <main id="primary" className="lucky-site-main btt-home">
      <section className="btt-archive">
        <div className="btt-archive__inner">
          <span className="btt-archive__kicker">Search</span>
          <h1 className="btt-archive__title">Search</h1>
          <p className="btt-archive__desc">
            Search platform reviews and Bitcoin articles.
          </p>
        </div>
      </section>

      <div className="lucky-container btt-home__container">
        <form className="btt-search-page__form" action="/search" method="get" role="search">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search reviews & articles…"
            aria-label="Search reviews and articles"
            autoComplete="off"
          />
          <button type="submit">Search</button>
        </form>

        {query.length < 2 ? (
          <p className="btt-search-page__hint">Type at least 2 characters to search.</p>
        ) : results.length === 0 ? (
          <p className="btt-search-page__empty">No results for &ldquo;{query}&rdquo;.</p>
        ) : (
          <>
            <p className="btt-search-page__count">
              {results.length} result{results.length === 1 ? '' : 's'} for &ldquo;{query}
              &rdquo;
            </p>
            <div className="btt-stream__grid">
              {results.map((card) => (
                <PostCard key={`${card.type}/${card.slug}`} card={card} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
