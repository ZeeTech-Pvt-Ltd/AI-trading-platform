'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SearchEntry } from '@/lib/search';
import VerdictBadge from './VerdictBadge';

const INDEX_URL = '/api/search-index';
const MAX_RESULTS = 8;
const DEBOUNCE_MS = 150;

// Fetched once per session and shared across navigations.
let indexCache: SearchEntry[] | null = null;

function rank(entry: SearchEntry, q: string): number {
  const name = entry.name.toLowerCase();
  const domain = (entry.domain ?? '').toLowerCase();
  const slug = entry.slug.toLowerCase();
  if (name === q || domain === q) return 0;
  if (name.startsWith(q) || domain.startsWith(q)) return 1;
  if (name.includes(q) || domain.includes(q) || slug.includes(q)) return 2;
  return -1;
}

function search(index: SearchEntry[], query: string): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return index
    .map((entry) => ({ entry, r: rank(entry, q) }))
    .filter((x) => x.r >= 0)
    .sort((a, b) => a.r - b.r || a.entry.name.localeCompare(b.entry.name))
    .slice(0, MAX_RESULTS)
    .map((x) => x.entry);
}

/**
 * Accessible combobox over the review index. The label and input are present
 * in the initial HTML (crawlable, focusable without JS); the typeahead is a
 * progressive enhancement fetched once and filtered with a short debounce.
 */
export default function SearchBox() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<SearchEntry[] | null>(indexCache);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    indexCache ? 'ready' : 'idle',
  );
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [filtering, setFiltering] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (indexCache) {
      setIndex(indexCache);
      setStatus('ready');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    fetch(INDEX_URL)
      .then((r) => (r.ok ? (r.json() as Promise<SearchEntry[]>) : Promise.reject()))
      .then((data) => {
        if (cancelled) return;
        indexCache = data;
        setIndex(data);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced filtering against the in-memory index.
  useEffect(() => {
    if (!index) return;
    const q = query.trim();
    if (!q) {
      setResults([]);
      setFiltering(false);
      return;
    }
    setFiltering(true);
    const t = setTimeout(() => {
      setResults(search(index, q));
      setFiltering(false);
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query, index]);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const select = useCallback(
    (entry: SearchEntry) => {
      setQuery(entry.name);
      setOpen(false);
      setActiveIndex(-1);
      router.push(`/trading/${entry.slug}`);
    },
    [router],
  );

  const commit = useCallback(() => {
    if (results.length > 0) {
      select(results[activeIndex >= 0 ? activeIndex : 0]);
    }
  }, [results, activeIndex, select]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) {
      if (e.key === 'Escape') close();
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
        break;
      case 'Enter':
        e.preventDefault();
        commit();
        break;
      case 'Escape':
        close();
        break;
    }
  };

  const showEmpty =
    status === 'ready' && !filtering && query.trim() !== '' && results.length === 0;

  return (
    <div className="home-search">
      <form
        className="home-search__form"
        role="search"
        action="/reviews"
        onSubmit={(e) => {
          e.preventDefault();
          commit();
        }}
        noValidate
      >
        <label className="home-search__label" htmlFor="platform-search-input">
          Check a platform
        </label>
        <div className="home-search__field">
          <input
            ref={inputRef}
            id="platform-search-input"
            name="q"
            type="search"
            className="home-search__input"
            placeholder="e.g. a platform name or domain"
            autoComplete="off"
            spellCheck={false}
            role="combobox"
            aria-expanded={open && results.length > 0}
            aria-controls="platform-search-listbox"
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `platform-search-option-${activeIndex}` : undefined
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
              setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query) setOpen(true);
            }}
            onBlur={() => setTimeout(close, 120)}
          />
          <button type="submit" className="home-search__submit">
            Search
          </button>
        </div>
      </form>

      {open && results.length > 0 && (
        <ul
          id="platform-search-listbox"
          role="listbox"
          aria-label="Matching platforms"
          className="home-search__listbox"
        >
          {results.map((entry, i) => (
            <li
              key={entry.slug}
              id={`platform-search-option-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={`home-search__option${i === activeIndex ? ' is-active' : ''}`}
            >
              <Link
                href={`/trading/${entry.slug}`}
                onMouseDown={(e) => {
                  // Plain left-click only, so cmd/ctrl-click still opens a new tab.
                  if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
                    select(entry);
                  }
                }}
              >
                <span className="home-search__name">{entry.name}</span>
                <VerdictBadge verdict={entry.verdict} />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showEmpty && (
        <div className="home-search__empty" role="status">
          <p>
            We haven&rsquo;t reviewed <strong>&ldquo;{query}&rdquo;</strong> yet.
          </p>
          <Link href="/contact">Request a review</Link>
        </div>
      )}
    </div>
  );
}
