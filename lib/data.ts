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
  /** Hide the "In this review" table of contents on this post only. */
  hideToc?: boolean;
  /** Hide the score box at the top of the page on this post only. */
  hideQuickVerdict?: boolean;
  /** Render the review sections as plain text instead of white cards, on this post only. */
  plainLayout?: boolean;
};

export type Author = {
  slug: string;
  name: string;
  avatar: string;
  bio?: string;
  pages: Card[][];
};

type Manifest = {
  homePages: Card[][];
  authors: Record<string, Author>;
};

const CONTENT_DIR = path.join(process.cwd(), 'content');

export const POSTS_PER_PAGE = 9;

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

/** Cheap deterministic hash for a string, used to pick a stable pseudo-random offset per slug. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Reviews to push internally: they rank just off page one (positions 8-10) with impressions
 * but no clicks, so extra internal links give them the best chance of moving up.
 */
const PRIORITY_SLUGS = [
  'loyal-fructoire-review',
  'model-maxalt-opt-review',
  'spotlight-evocorex-review',
  'should-veltron-review',
  'rang-nganminh-review',
  'profition-review',
  'citadelstrades-review',
  'verdant-kapitholt-review',
  'kestrel-fundast-ai-review',
  'capital-aura-growth-review',
  'clair-finances-review',
  'trxvector-review',
  'immediate-path-ai-review',
  'ching-x-sgx-fin-review',
  'forgreserve-ai-review',
];

/**
 * Related cards for a review's "More Platform Reviews" section.
 *
 * Half the links are "ring" neighbors (the next few cards in list order,
 * wrapping around) — a cycle through every card, so the whole set of
 * reviews forms a single connected graph no matter how many there are.
 * The other half are hash-based "spread" links, jumping to a different,
 * pseudo-random part of the list per slug, so pages a few positions apart
 * don't all link to the same neighbors and equity moves across the site
 * faster than the ring alone would.
 *
 * (A fixed arithmetic step here previously split the whole set into many
 * disconnected islands whenever the step evenly divided the list length —
 * e.g. exactly 6-card clusters with zero links between them at N=1398.)
 */
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
  const n = all.length;
  const ringCount = Math.ceil(count / 2);
  const seen = new Set<string>([slug]);
  const out: Card[] = [];

  for (let k = 1; out.length < ringCount && k < n; k++) {
    const c = all[(start + k) % n];
    if (!seen.has(c.slug)) {
      seen.add(c.slug);
      out.push(c);
    }
  }

  const baseHash = hashString(slug);

  // Two "priority" reviews (ones sitting just off page one in search) get a link from every
  // review page. Only slugs that exist in the manifest are used, so a removed or renamed
  // review can never produce a dead link.
  const byslug = new Map(all.map((c) => [c.slug, c]));
  const priority = PRIORITY_SLUGS.filter((s) => byslug.has(s));
  for (let k = 0; k < priority.length && out.length < Math.min(count, ringCount + 2); k++) {
    const c = byslug.get(priority[(baseHash + k * 7) % priority.length])!;
    if (!seen.has(c.slug)) {
      seen.add(c.slug);
      out.push(c);
    }
  }

  for (let k = 0; out.length < count && k < n; k++) {
    const jump = 1 + ((baseHash + k * 104729) % (n - 1));
    const c = all[(start + jump) % n];
    if (!seen.has(c.slug)) {
      seen.add(c.slug);
      out.push(c);
    }
  }

  return out;
}

/**
 * Trading reviews to cross-link from a bitcoin article's body content.
 * Purely hash-seeded (the source slug isn't itself in the trading list, so
 * there's no natural "position" to build a ring from) — each article gets a
 * different, deterministic set of reviews rather than every article linking
 * to the same handful.
 */
export function getReviewsForArticle(articleSlug: string, count = 3): Card[] {
  const all = getManifest()
    .homePages.flat()
    .filter((c) => c.type === 'trading');
  const n = all.length;
  if (n === 0) return [];
  const baseHash = hashString(`article:${articleSlug}`);
  const seen = new Set<string>();
  const out: Card[] = [];
  for (let k = 0; out.length < count && k < n; k++) {
    const c = all[(baseHash + k * 104729) % n];
    if (!seen.has(c.slug)) {
      seen.add(c.slug);
      out.push(c);
    }
  }
  return out;
}
