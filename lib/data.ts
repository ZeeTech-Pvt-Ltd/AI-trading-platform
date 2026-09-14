import fs from 'node:fs';
import path from 'node:path';

export type Verdict = 'safe' | 'warn' | 'risk' | 'na';

export type Card = {
  type: 'trading' | 'bitcoin';
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  authorSlug: string;
  date: string;
  readingTime: string;
  /** Per-review modification date; not present in the current content (falls back to `date`). */
  dateModified?: string;
  /** Editorial verdict; not present in the current content. */
  verdict?: Verdict;
  /** Markets the platform accepts; not present in the current content. */
  markets?: string[];
  /** Single main reason for a high-risk flag; not present in the current content. */
  riskReason?: string;
  /** ISO date the review was last checked/verified; not present in the current content. */
  lastChecked?: string;
};

export type Post = {
  type: 'trading' | 'bitcoin';
  slug: string;
  title: string;
  description: string;
  author: string;
  authorSlug: string;
  date: string;
  readingTime: string;
  categories: string[];
  excerpt: string;
  content: string;
  jsonLd: string;
  reviewJsonLd?: string;
  ogImage: string;
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

/** The per-review freshness date: `dateModified` when present, else publish `date`. */
export function cardDate(card: Card): string {
  return card.dateModified ?? card.date;
}

// "Quantum Investir Review: Honest Analysis Before You Register" -> "Quantum Investir"
const BRAND_RE = /^(.+?)\s+Review:/;

/** Bare brand name — the title text before " Review:". */
export function brandName(title: string): string {
  const m = title.match(BRAND_RE);
  return m ? m[1].trim() : title;
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
