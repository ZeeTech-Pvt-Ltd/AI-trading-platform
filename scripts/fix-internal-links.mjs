/**
 * Fix broken internal links in bitcoin article bodies.
 *
 * Old Medium-era content links to other bitcoin articles as
 *   https://ai-trading-platform.com/{slug}
 * but the current route is /bitcoin/{slug}. This prepends the missing
 * /bitcoin/ segment to any <a href="https://ai-trading-platform.com/{slug}">
 * whose {slug} is a known bitcoin article slug.
 *
 * Run from next-app/:  node scripts/fix-internal-links.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const DIR = 'content/posts/bitcoin';

const slugs = new Set(
  readdirSync(DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8')).slug),
);

let replacements = 0;

for (const f of readdirSync(DIR)) {
  if (!f.endsWith('.json')) continue;
  const file = `${DIR}/${f}`;
  const p = JSON.parse(readFileSync(file, 'utf8'));
  const c = p.content || '';

  const re = /href=(["'])(https?:\/\/ai-trading-platform\.com\/)([^"']+?)(["'])/gi;
  let changed = false;

  const next = c.replace(re, (m, q, base, rest, q2) => {
    const slug = rest.split(/[/?#]/)[0];
    if (slugs.has(slug)) {
      changed = true;
      replacements += 1;
      return `href=${q}${base}bitcoin/${rest}${q2}`;
    }
    return m;
  });

  if (changed) {
    p.content = next;
    writeFileSync(file, JSON.stringify(p));
    console.log(`fixed ${f}`);
  }
}

console.log(`\nTotal replacements: ${replacements}`);
