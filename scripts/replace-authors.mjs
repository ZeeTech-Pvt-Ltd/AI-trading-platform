/**
 * Replaces the scraped author roster with the site's new author team.
 *
 * - Distributes ALL posts round-robin across the new authors.
 * - Rebuilds the `authors` archive (5 authors, paginated).
 * - Updates every post's byline (author/authorSlug) + JSON-LD author names.
 * - Writes generated monogram avatar SVGs (no fabricated photos).
 *
 * Run from the next-app/ directory:  node scripts/replace-authors.mjs
 *
 * NOTE: bulk, site-wide attribution change — run once, then commit.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://ai-trading-platform.com';
const POSTS_PER_PAGE = 10;

const NEW_AUTHORS = [
  { slug: 'danielcarter', name: 'Daniel Carter', initial: 'D', color: '#dcdcd9' },
  { slug: 'jameswhitmore', name: 'James Whitmore', initial: 'J', color: '#dcdcd9' },
  { slug: 'oliviabennett', name: 'Olivia Bennett', initial: 'O', color: '#dcdcd9' },
  { slug: 'michaelbrooks', name: 'Michael Brooks', initial: 'M', color: '#dcdcd9' },
  { slug: 'sophiareynolds', name: 'Sophia Reynolds', initial: 'S', color: '#dcdcd9' },
];

const manifestPath = 'content/manifest.json';
const m = JSON.parse(readFileSync(manifestPath, 'utf8'));

// Capture old author names → gravatar hash (for JSON-LD image replacement).
const oldNameToHash = new Map();
for (const a of Object.values(m.authors)) {
  const h = (a.avatar || '').match(/\/avatar\/([a-f0-9]+)\?/);
  oldNameToHash.set(a.name, h ? h[1] : '');
}

// 1. Flatten all cards in recency order and assign authors round-robin.
const flat = [];
for (const page of m.homePages) for (const card of page) flat.push(card);
const assign = new Map(); // "type/slug" -> new author slug
flat.forEach((card, i) => {
  const a = NEW_AUTHORS[i % NEW_AUTHORS.length];
  card.author = a.name;
  card.authorSlug = a.slug;
  assign.set(`${card.type}/${card.slug}`, a.slug);
});

// 2. Rebuild the authors archive.
const authors = {};
for (const a of NEW_AUTHORS) {
  const cards = flat.filter((c) => c.authorSlug === a.slug);
  const pages = [];
  for (let i = 0; i < cards.length; i += POSTS_PER_PAGE) {
    pages.push(cards.slice(i, i + POSTS_PER_PAGE));
  }
  authors[a.slug] = {
    slug: a.slug,
    name: a.name,
    avatar: `/images/authors/${a.slug}.svg`,
    pages,
  };
}
m.authors = authors;
writeFileSync(manifestPath, JSON.stringify(m));

// 3. Write generated monogram avatar SVGs.
const avatarDir = 'public/images/authors';
mkdirSync(avatarDir, { recursive: true });
for (const a of NEW_AUTHORS) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">` +
    `<rect width="120" height="120" rx="60" fill="${a.color}"/>` +
    `<text x="60" y="60" font-family="Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif" ` +
    `font-size="52" font-weight="700" fill="#1c1917" text-anchor="middle" dominant-baseline="central">` +
    `${a.initial}</text></svg>`;
  writeFileSync(path.join(avatarDir, `${a.slug}.svg`), svg);
}

// 4. Update each post file (byline + JSON-LD).
let updated = 0;
const updatePost = (type, slug) => {
  const fp = `content/posts/${type}/${slug}.json`;
  const p = JSON.parse(readFileSync(fp, 'utf8'));
  const newSlug = assign.get(`${type}/${slug}`);
  const a = NEW_AUTHORS.find((x) => x.slug === newSlug);
  if (!a) return;

  const oldName = p.author;
  const hash = oldNameToHash.get(oldName) || '';
  p.author = a.name;
  p.authorSlug = a.slug;

  if (p.jsonLd) {
    let s = p.jsonLd;
    if (oldName) s = s.split(oldName).join(a.name);
    if (hash) {
      // Tolerate both JSON-escaped ("\/") and plain slashes in the stored JSON-LD.
      s = s.replace(
        new RegExp(`https:[\\\\/]+secure\\.gravatar\\.com[\\\\/]+avatar[\\\\/]+${hash}[^"'\\\\]*`, 'g'),
        `${SITE_URL}/images/authors/${a.slug}.svg`,
      );
    }
    p.jsonLd = s;
  }
  if (p.reviewJsonLd && oldName) {
    p.reviewJsonLd = p.reviewJsonLd.split(oldName).join(a.name);
  }

  writeFileSync(fp, JSON.stringify(p));
  updated++;
};

for (const type of ['trading', 'bitcoin']) {
  const dir = `content/posts/${type}`;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.json')) continue;
    updatePost(type, f.replace(/\.json$/, ''));
  }
}

console.log(`new authors        : ${NEW_AUTHORS.length}`);
console.log(`cards redistributed: ${flat.length}`);
console.log(`posts updated      : ${updated}`);
console.log(`avatars written    : ${NEW_AUTHORS.length}`);
