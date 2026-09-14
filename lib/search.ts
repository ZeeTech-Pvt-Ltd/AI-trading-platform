import { getAllCards, brandName, type Card, type Verdict } from './data';

export type { Verdict };

export type SearchEntry = {
  /** Bare brand name — the title text before " Review:". */
  name: string;
  /** Review slug — the URL segment under /trading/. */
  slug: string;
  type: 'trading' | 'bitcoin';
  /**
   * Brand domain, when the content model carries one. The current content
   * only stores the shared affiliate redirect, so this is absent until a
   * per-brand domain field is added upstream.
   */
  domain?: string;
  /**
   * Editorial verdict (safe/warn/risk/na), when assigned. Not present in the
   * current content — the only per-review signal is ratingValue "4.6".
   */
  verdict?: Verdict;
};

/**
 * Flat, client-searchable review index. Trading cards only — the `bitcoin`
 * cards are guides/articles, not platform reviews.
 */
export function getSearchIndex(): SearchEntry[] {
  return getAllCards()
    .filter((c) => c.type === 'trading')
    .map((c: Card): SearchEntry => ({
      name: brandName(c.title),
      slug: c.slug,
      type: c.type,
    }));
}
