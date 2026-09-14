/**
 * Removes the last residual mentions of the old author roster from article
 * content and excerpts (acknowledgements, co-author credits, cross-references).
 *
 * Run from the next-app/ directory:  node scripts/scrub-old-author-names.mjs
 *
 * Only touches the old author names — other people credited in the source
 * articles (e.g. Mark Friedenbach, Pieter Wuille) are left intact.
 */
import { readFileSync, writeFileSync } from 'node:fs';

// file → { excerpt?: [from, to][], content?: [from|RegExp, to][] }
const EDITS = {
  'bitcoin/bitcoin-tech-talk-mission-60941fd66832.json': {
    excerpt: [['Authored with John NewberyKeeping', 'Keeping']],
    content: [[/<p name="c8ae">[\s\S]*?<\/p>\n?/, '']],
  },
  'bitcoin/contributing-to-bitcoin-core-a-personal-account-35f3a594340b.json': {
    content: [['Jimmy Song has written a', 'see this']],
  },
  'bitcoin/what-is-a-bitcoin-merklized-abstract-syntax-tree-mast-33fdf2da5e2f.json': {
    content: [
      [
        'I thank Mark Friedenbach, Jimmy Song, and John Newbery for their reviews',
        'I thank Mark Friedenbach for his review',
      ],
    ],
  },
  'bitcoin/whats-new-in-bitcoin-core-v0-15-part-1-21085f4467fc.json': {
    content: [['Thanks to Pieter Wuille, Matt Corallo and Jimmy Song', 'Thanks to Pieter Wuille and Matt Corallo']],
  },
  'bitcoin/whats-new-in-bitcoin-core-v0-15-part-2-41b6d0493136.json': {
    content: [['Thanks to Matt Corallo, Alex Morcos and Jimmy Song', 'Thanks to Matt Corallo and Alex Morcos']],
  },
};

function applyRepls(s, repls) {
  let out = s;
  for (const [from, to] of repls) {
    out = typeof from === 'string' ? out.split(from).join(to) : out.replace(from, to);
  }
  return out;
}

let changed = 0;
for (const [rel, spec] of Object.entries(EDITS)) {
  const fp = `content/posts/${rel}`;
  const p = JSON.parse(readFileSync(fp, 'utf8'));
  if (spec.excerpt) p.excerpt = applyRepls(p.excerpt, spec.excerpt);
  if (spec.content) p.content = applyRepls(p.content, spec.content);
  writeFileSync(fp, JSON.stringify(p));
  changed++;
}

// Also scrub the single manifest card excerpt that still carried the old name.
const manifestPath = 'content/manifest.json';
const m = readFileSync(manifestPath, 'utf8');
const m2 = m.split('Authored with John Newbery Keeping').join('Keeping');
writeFileSync(manifestPath, m2);

console.log(`scrubbed post files: ${changed}`);
console.log(`manifest scrub     : ${m === m2 ? 'no change' : 'updated'}`);
