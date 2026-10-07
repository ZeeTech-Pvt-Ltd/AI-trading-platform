import fs from 'node:fs';
import path from 'node:path';
import type { Post } from './data';
import { getAllPostSlugs } from './data';

export type CompareSide = {
  slug: string;
  name: string;
  score: number;
  minDeposit: string;
  demo: string;
  support: string;
  payout: string;
  pros: string[];
  cons: string[];
};

const CONTENT_DIR = path.join(process.cwd(), 'content');

let legacyCache: Record<string, string> | null = null;
function legacySlugs(): Record<string, string> {
  if (!legacyCache) {
    try {
      legacyCache = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, 'legacy-slugs.json'), 'utf8'));
    } catch {
      legacyCache = {};
    }
  }
  return legacyCache!;
}

function readPost(slug: string): Post | null {
  try {
    const file = path.join(CONTENT_DIR, 'posts', 'trading', slug + '.json');
    return JSON.parse(fs.readFileSync(file, 'utf8')) as Post;
  } catch {
    return null;
  }
}

/** A URL segment may or may not carry the "-review" suffix; normalize to the file slug. */
export function normalizeSlug(segment: string): string {
  return segment.endsWith('-review') ? segment : segment + '-review';
}

/** Split "/compare/<a>-vs-<b>" into two normalized slugs, or null if malformed. */
export function parsePair(pair: string): [string, string] | null {
  const parts = pair.split('-vs-');
  if (parts.length !== 2) return null;
  const a = normalizeSlug(parts[0].trim());
  const b = normalizeSlug(parts[1].trim());
  if (!a || !b || a === b) return null;
  return [a, b];
}

function scrape(content: string, re: RegExp): string {
  const m = content.match(re);
  if (!m) return '';
  return m[1].replace(/&#8217;/g, '’').replace(/&amp;/g, '&').trim();
}

function listItems(content: string, panelClass: string): string[] {
  const m = content.match(new RegExp(`${panelClass}([\\s\\S]*?)(?:</ul>\\s*</div>)`));
  if (!m) return [];
  const items = m[1].match(/<li>([\s\S]*?)<\/li>/g) ?? [];
  return items
    .map((li) =>
      li
        .replace(/<li>|<\/li>/g, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&#8217;/g, '’')
        .replace(/&#8220;|&#8221;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean)
    .slice(0, 5);
}

// Shown when a review does not state the value.
const NOT_VERIFIED = 'N/A';

function normalizeSupport(v: string): string {
  const t = v.trim();
  if (/^(7|24|24\/7)$/.test(t)) return '24/7';
  return t || NOT_VERIFIED;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Different review templates use different label text for the same field.
// Anchored on a leading <td> so a label like "Support" can't accidentally
// match inside an unrelated row such as "Mobile Support".
function scrapeAny(content: string, labels: string[]): string {
  for (const label of labels) {
    // The value cell may contain inline markup, so capture up to </td> and strip tags.
    const re = new RegExp(`<td>${escapeRegExp(label)}</td>\\s*<td>([\\s\\S]*?)</td>`);
    const m = content.match(re);
    const clean = m ? plainText(m[1]) : '';
    if (clean) return clean;
  }
  return '';
}

function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

const AMOUNT = '([$\\u00a3\\u20ac]\\s?\\d[\\d,]*(?:\\.\\d+)?)';

/**
 * Reviews without an overview table still state the minimum deposit in their prose
 * (banner "Minimum deposit $250", "The minimum deposit is $250", FAQ answers).
 */
function depositFromText(content: string): string {
  const t = plainText(content);
  const patterns = [
    new RegExp(`Minimum deposit\\s*${AMOUNT}`, 'i'),
    new RegExp(`minimum (?:deposit|funding|start(?:ing)? (?:deposit|amount))\\s*(?:is|of|:)?\\s*${AMOUNT}`, 'i'),
    new RegExp(`(?:start(?:ing)? (?:deposit|amount)|entry deposit)\\s*(?:is|of|:)?\\s*${AMOUNT}`, 'i'),
  ];
  for (const re of patterns) {
    const m = t.match(re);
    if (m) return m[1].replace(/\s+/g, '');
  }
  return '';
}

const DEPOSIT_LABELS = ['Initial Funding', 'Minimum Deposit', 'Starting Deposit', 'Entry Deposit', 'Starting Amount'];
const DEMO_LABELS = ['Trial Account', 'Demo Account', 'Practice Account', 'Demo Mode'];
const SUPPORT_LABELS = ['Customer Support', 'Help Desk', 'Support'];
const PAYOUT_LABELS = ['Payout Time', 'Withdrawal Time', 'Withdrawals', 'Payout Timing'];

function extractSide(slug: string): CompareSide | null {
  const post = readPost(slug);
  if (!post) return null;
  const c = post.content;
  const name = post.title.split(' Review')[0].trim();
  // The rating bar is not on every page, so fall back to the verdict card's stars.
  const scoreRaw =
    c.match(/bd-stars" aria-label="([\d.]+) out of 5"/) ??
    c.match(/bd-stars[^"]*" aria-label="([\d.]+) out of 5"/);
  const score = scoreRaw ? Number(scoreRaw[1]) : 0;
  return {
    slug,
    name,
    score,
    minDeposit: scrapeAny(c, DEPOSIT_LABELS) || depositFromText(c) || NOT_VERIFIED,
    demo: scrapeAny(c, DEMO_LABELS) || NOT_VERIFIED,
    support: normalizeSupport(scrapeAny(c, SUPPORT_LABELS)),
    payout: scrapeAny(c, PAYOUT_LABELS) || NOT_VERIFIED,
    pros: listItems(c, 'bd-panel--pros'),
    cons: listItems(c, 'bd-panel--cons'),
  };
}

export function getCompareSides(pair: string): [CompareSide, CompareSide] | null {
  const parsed = parsePair(pair);
  if (!parsed) return null;
  const a = extractSide(parsed[0]);
  const b = extractSide(parsed[1]);
  if (!a || !b) return null;
  return [a, b];
}

/** Deterministic (seeded) sample of distinct pairs, stable across builds. */
export function getSamplePairs(count = 120): string[] {
  const slugs = getAllPostSlugs('trading');
  const pairs: string[] = [];
  const seen = new Set<string>();
  // mulberry32 PRNG with a fixed seed so the sample is reproducible.
  let seed = 0x9e3779b9;
  const rand = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const guard = 0;
  while (pairs.length < count && guard < slugs.length * slugs.length) {
    const i = Math.floor(rand() * slugs.length);
    const j = Math.floor(rand() * slugs.length);
    if (i === j) continue;
    const key = [slugs[i], slugs[j]].sort().join('__');
    if (seen.has(key)) continue;
    seen.add(key);
    // URL form uses the "-review"-suffixed slugs separated by "-vs-".
    pairs.push(`${slugs[i]}-vs-${slugs[j]}`);
  }
  return pairs;
}

/** If a compare URL uses a review slug that was renamed, return the corrected pair segment. */
export function legacyPair(pair: string): string | null {
  const parts = pair.split('-vs-');
  if (parts.length !== 2) return null;
  const map = legacySlugs();
  let changed = false;
  const fixed = parts.map((raw) => {
    const part = raw.trim();
    const hit = map[part] ?? map[normalizeSlug(part)];
    if (!hit) return part;
    changed = true;
    return hit;
  });
  return changed ? fixed.join('-vs-') : null;
}

let indexableCache: Set<string> | null = null;

/** Canonical form of a compare URL segment: both slugs carry the "-review" suffix. */
export function canonicalPair(pair: string): string | null {
  const parsed = parsePair(pair);
  return parsed ? `${parsed[0]}-vs-${parsed[1]}` : null;
}

/**
 * Only the comparison pairs listed in content/compare-indexable.json (the ones that already
 * earn search clicks) are indexable. Every other pair is noindex so the review pages themselves
 * are what search engines rank.
 */
export function getIndexablePairs(): string[] {
  if (!indexableCache) {
    try {
      const list = JSON.parse(
        fs.readFileSync(path.join(CONTENT_DIR, 'compare-indexable.json'), 'utf8'),
      ) as string[];
      indexableCache = new Set(list);
    } catch {
      indexableCache = new Set();
    }
  }
  return Array.from(indexableCache);
}

export function isIndexablePair(pair: string): boolean {
  const canon = canonicalPair(pair);
  return canon ? getIndexablePairs().includes(canon) : false;
}
