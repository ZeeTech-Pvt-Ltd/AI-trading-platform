/**
 * Audit: find broken internal links and missing local images across the site.
 * Run from next-app/:  node scripts/audit-links-images.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const POST_TYPES = ['trading', 'bitcoin'];

const missingImages = [];
const imgRefs = new Set();
const ogSet = new Map();
const hrefs = new Set();
const localHrefs = new Set();
const internalHrefs = new Set();

function checkLocalImage(ref, src) {
  if (!ref.startsWith('/images/')) return;
  const abs = path.join('public', ref.replace(/^\//, ''));
  if (!existsSync(abs)) missingImages.push({ src, ref });
}

for (const type of POST_TYPES) {
  for (const f of readdirSync(`content/posts/${type}`)) {
    if (!f.endsWith('.json')) continue;
    const p = JSON.parse(readFileSync(`content/posts/${type}/${f}`, 'utf8'));
    const key = `${type}/${f}`;

    const og = p.ogImage || '';
    if (og.startsWith('/images/')) {
      checkLocalImage(og, `${key} ogImage`);
      ogSet.set(og, (ogSet.get(og) || 0) + 1);
    }

    const c = p.content || '';
    const imgRe = /<img[^>]*src=["']([^"']+)["']/gi;
    let m;
    while ((m = imgRe.exec(c))) {
      imgRefs.add(m[1]);
      if (m[1].startsWith('/images/')) checkLocalImage(m[1], `${key} content`);
    }

    const aRe = /<a[^>]*href=["']([^"']+)["']/gi;
    while ((m = aRe.exec(c))) {
      hrefs.add(m[1]);
      if (m[1].startsWith('/')) localHrefs.add(m[1]);
      else if (/^https?:\/\/ai-trading-platform\.com/i.test(m[1])) internalHrefs.add(m[1]);
    }
  }
}

console.log('=== ogImage references (unique) ===');
for (const [o, n] of ogSet) console.log(`  ${n}x  ${o}`);
console.log(`\n=== content <img> src (unique: ${imgRefs.size}) ===`);
[...imgRefs].slice(0, 60).forEach((r) => console.log(' ', r));
if (imgRefs.size > 60) console.log(`  ... +${imgRefs.size - 60} more`);

console.log(`\n=== MISSING local images (${missingImages.length}) ===`);
if (missingImages.length === 0) console.log('  none — all /images/ refs exist');
else missingImages.forEach((x) => console.log(`  ${x.src} -> ${x.ref}`));

console.log(`\n=== internal hrefs in content (unique: ${localHrefs.size}) ===`);
[...localHrefs].slice(0, 80).forEach((r) => console.log(' ', r));
if (localHrefs.size > 80) console.log(`  ... +${localHrefs.size - 80} more`);

console.log(`\n=== absolute internal hrefs (ai-trading-platform.com, unique: ${internalHrefs.size}) ===`);
[...internalHrefs].slice(0, 80).forEach((r) => console.log(' ', r));
if (internalHrefs.size > 80) console.log(`  ... +${internalHrefs.size - 80} more`);
