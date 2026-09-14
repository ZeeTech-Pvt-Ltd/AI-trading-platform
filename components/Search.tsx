'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type Result = {
  type: 'trading' | 'bitcoin';
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  authorSlug: string;
  date: string;
  readingTime: string;
};

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function Search() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = () => {
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

  const q = query.trim();

  return (
    <>
      <button
        type="button"
        className="btt-search-trigger"
        aria-label="Search"
        onClick={() => setOpen(true)}
      >
        <SearchIcon />
      </button>

      {open ? (
        <div className="btt-search" role="dialog" aria-modal="true" aria-label="Search">
          <div className="btt-search__backdrop" onClick={close} />
          <div className="btt-search__panel">
            <div className="btt-search__bar">
              <span className="btt-search__icon">
                <SearchIcon />
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reviews & articles…"
                aria-label="Search reviews and articles"
                autoComplete="off"
              />
              <button
                type="button"
                className="btt-search__close"
                onClick={close}
                aria-label="Close search"
              >
                ✕
              </button>
            </div>

            <div className="btt-search__results">
              {loading ? (
                <p className="btt-search__hint">Searching…</p>
              ) : q.length < 2 ? (
                <p className="btt-search__hint">Type at least 2 characters to search.</p>
              ) : results.length === 0 ? (
                <p className="btt-search__hint">No results for &ldquo;{query}&rdquo;.</p>
              ) : (
                <ul className="btt-search__list">
                  {results.map((r) => (
                    <li key={`${r.type}/${r.slug}`}>
                      <Link href={`/${r.type}/${r.slug}`} onClick={close}>
                        <span className="btt-search__row">
                          <span
                            className={`btt-search__chip btt-search__chip--${r.type}`}
                          >
                            {r.type === 'trading' ? 'Review' : 'Article'}
                          </span>
                          <span className="btt-search__title">{r.title}</span>
                        </span>
                        <span className="btt-search__meta">
                          {r.author}
                          {r.readingTime ? ` · ${r.readingTime}` : ''}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
