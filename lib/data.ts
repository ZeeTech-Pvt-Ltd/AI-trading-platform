import fs from 'node:fs';
import path from 'node:path';

export type Card = {
  type: 'trading' | 'bitcoin';
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  authorSlug: string;
  date: string;
  /** Last-modified date, when known. Absent in current content (falls back to `date`). */
  dateModified?: string;
  readingTime: string;
  /** Review score (trading cards only), e.g. "4.6". Absent on bitcoin guides. */
  ratingValue?: string;
};

export type Post = {
  type: 'trading' | 'bitcoin';
  slug: string;
  title: string;
  description: string;
  author: string;
  authorSlug: string;
  date: string;
  /** Last-modified date, when known. Absent in current content (falls back to `date`). */
  dateModified?: string;
  readingTime: string;
  categories: string[];
  excerpt: string;
  content: string;
  jsonLd: string;
  reviewJsonLd?: string;
  ogImage: string;
  /** Override for the CTA/sidebar link when it isn't the standard affiliate
   *  tracker URL (e.g. a platform that gets sent direct instead). Falls back
   *  to the usual `?f=<slug>` pattern when absent. */
  ctaUrl?: string;
};

export type Author = {
  slug: string;
  name: string;
  avatar: string;
  pages: Card[][];
};

type Manifest = {
  homePages: Card[][];
  authors: Record<string, Author>;
};

const CONTENT_DIR = path.join(process.cwd(), 'content');

export const POSTS_PER_PAGE = 10;

let manifestCache: Manifest | null = null;

export function getManifest(): Manifest {
  if (!manifestCache) {
    manifestCache = JSON.parse(
      fs.readFileSync(path.join(CONTENT_DIR, 'manifest.json'), 'utf8'),
    ) as Manifest;
  }
  return manifestCache;
}

export function getHomePages(): Card[][] {
  return getManifest().homePages;
}

export function getAuthors(): Record<string, Author> {
  return getManifest().authors;
}

export function getAuthor(slug: string): Author | undefined {
  return getManifest().authors[slug];
}

export function getPost(type: string, slug: string): Post | null {
  try {
    const file = path.join(CONTENT_DIR, 'posts', type, slug + '.json');
    return JSON.parse(fs.readFileSync(file, 'utf8')) as Post;
  } catch {
    return null;
  }
}

export function getAllPostSlugs(type: string): string[] {
  const dir = path.join(CONTENT_DIR, 'posts', type);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));
}

export function getAllCards(): Card[] {
  return getManifest().homePages.flat();
}

export function getTypePages(type: 'trading' | 'bitcoin'): Card[][] {
  const all = getManifest()
    .homePages.flat()
    .filter((c) => c.type === type);
  const pages: Card[][] = [];
  for (let i = 0; i < all.length; i += POSTS_PER_PAGE) {
    pages.push(all.slice(i, i + POSTS_PER_PAGE));
  }
  return pages;
}

/** The Card (title/rating/author/etc.) matching a given post, if any. */
export function getCard(type: string, slug: string): Card | undefined {
  return getAllCards().find((c) => c.type === type && c.slug === slug);
}

/** Trading cards sorted by rating (desc), newest first among ties. */
export function getTopRatedCards(count = 5): Card[] {
  return getAllCards()
    .filter((c) => c.type === 'trading' && c.ratingValue)
    .sort((a, b) => {
      const byRating = Number.parseFloat(b.ratingValue!) - Number.parseFloat(a.ratingValue!);
      if (byRating !== 0) return byRating;
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
    })
    .slice(0, count);
}

/** Most recent date across every card, for a real "last updated" stat. */
export function getLastUpdatedDate(): string {
  return getAllCards().reduce((latest, c) => (c.date > latest ? c.date : latest), '');
}

export function getRelatedCards(
  type: 'trading' | 'bitcoin',
  slug: string,
  count = 6,
): Card[] {
  const all = getManifest()
    .homePages.flat()
    .filter((c) => c.type === type);
  if (all.length <= 1) return [];
  const idx = all.findIndex((c) => c.slug === slug);
  const start = idx === -1 ? 0 : idx;
  const step = Math.max(1, Math.floor(all.length / count));
  const seen = new Set<string>();
  const out: Card[] = [];
  for (let k = 1; out.length < count && k <= all.length; k++) {
    const c = all[(start + k * step) % all.length];
    if (c.slug !== slug && !seen.has(c.slug)) {
      seen.add(c.slug);
      out.push(c);
    }
  }
  return out;
}
