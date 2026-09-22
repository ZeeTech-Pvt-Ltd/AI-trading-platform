'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type Result = {
  type: 'trading' | 'bitcoin';
  slug: string;
  title: string;
  author: string;
  readingTime: string;
};

// Most visitors land already holding a specific platform name in mind
// ("is X legit?"), this puts that check front and center in the hero
// instead of making them scroll or find the header search icon.
// The <form> submits to the existing /search page (works with no JS);
// the dropdown is a client-side enhancement on top of that.
export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { results: Result[] };
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const q = query.trim();
  const showDropdown = open && q.length >= 2;

  return (
    <div className="btt-h-search-wrap" ref={containerRef}>
      <form className="btt-h-search" action="/search" method="get" role="search">
        <span className="btt-h-search__glass" aria-hidden="true">
          🔍
        </span>
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Check a platform, e.g. “Quantum Investir”"
          aria-label="Check if a trading platform has been reviewed"
          autoComplete="off"
        />
        <button type="submit">Check now →</button>
      </form>

      {showDropdown ? (
        <div className="btt-h-search__dropdown">
          {loading ? (
            <p className="btt-h-search__hint">Searching…</p>
          ) : results.length === 0 ? (
            <p className="btt-h-search__hint">
              No review found for &ldquo;{query}&rdquo; yet. Press Enter to search anyway.
            </p>
          ) : (
            results.slice(0, 6).map((r) => (
              <Link
                key={`${r.type}/${r.slug}`}
                href={`/${r.type}/${r.slug}`}
                className="btt-h-search__row"
              >
                <span className="btt-h-search__title">{r.title}</span>
                <span className="btt-h-search__meta">
                  {r.type === 'trading' ? 'Review' : 'Article'}
                  {r.author ? ` · ${r.author}` : ''}
                </span>
              </Link>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
