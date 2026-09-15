import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

// Minimal Review schema only: @context, @type, itemReviewed (Product + name),
// reviewRating (Rating + ratingValue). No FAQPage/author/datePublished/
// bestRating/worstRating - keep this in sync with content/posts/trading/*.json.

const DIR = 'content/posts/trading';
const files = readdirSync(DIR).filter((f) => f.endsWith('.json'));

let updated = 0;
const missingBrand = [];

for (const f of files) {
  const fp = `${DIR}/${f}`;
  const p = JSON.parse(readFileSync(fp, 'utf8'));
  if (typeof p.content !== 'string') continue;

  // brand from title
  const bm = p.title.match(/^(.*?)\s+Review\b/i);
  const brand = bm ? bm[1].trim() : p.title.trim();
  if (!brand) missingBrand.push(f);

  // rating value from verdict card
  let rating = '4.5';
  const vm = p.content.match(/bd-verdict-card__number[^>]*>([\s\S]*?)<\/div>/);
  if (vm) {
    const n = vm[1].replace(/<[^>]+>/g, ' ').match(/[\d]+(?:\.[\d]+)?/);
    if (n) rating = n[0];
  }

  const obj = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: { '@type': 'Product', name: brand },
    reviewRating: { '@type': 'Rating', ratingValue: rating },
  };

  p.reviewJsonLd = JSON.stringify(obj);
  writeFileSync(fp, JSON.stringify(p));
  updated++;
}

console.log(`updated posts: ${updated}`);
console.log(`missing brand: ${missingBrand.length}`);
