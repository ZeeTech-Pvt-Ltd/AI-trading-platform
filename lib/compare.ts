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

function normalizeSupport(v: string): string {
  const t = v.trim();
  if (/^(7|24|24\/7)$/.test(t)) return '24/7';
  return t || 'Not disclosed';
}

function extractSide(slug: string): CompareSide | null {
  const post = readPost(slug);
  if (!post) return null;
  const c = post.content;
  const name = post.title.split(' Review')[0].trim();
  const scoreRaw = c.match(/bd-stars" aria-label="([\d.]+) out of 5"/);
  const score = scoreRaw ? Number(scoreRaw[1]) : 0;
  return {
    slug,
    name,
    score,
    minDeposit: scrape(c, /Initial Funding<\/td>\s*<td>([^<]+)</) || 'Not disclosed',
    demo: scrape(c, /Trial Account<\/td>\s*<td>([^<]+)</) || 'Not disclosed',
    support: normalizeSupport(scrape(c, /Customer Support<\/td>\s*<td>([^<]+)</)),
    payout: scrape(c, /Payout Time<\/td>\s*<td>([^<]+)</) || 'Not disclosed',
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
