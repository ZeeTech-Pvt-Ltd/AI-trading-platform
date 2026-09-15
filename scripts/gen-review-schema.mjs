import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

// Full Review schema: @graph of Review (itemReviewed: Service + name,
// reviewRating with best/worstRating, author, datePublished) plus FAQPage
// when the post has FAQ items. Keep in sync with content/posts/trading/*.json.

const DIR = 'content/posts/trading';
const files = readdirSync(DIR).filter((f) => f.endsWith('.json'));

function strip(s) {
  return s
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

let updated = 0;
let withFaq = 0;
let faqItems = 0;
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

  // FAQ items
  const faq = [];
  const items = p.content.match(/<div class="bd-faq__item">([\s\S]*?)<\/div>/g) || [];
  for (const item of items) {
    const qm = item.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
    const q = qm ? strip(qm[1]) : '';
    const as = [...item.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((a) => strip(a[1])).filter(Boolean);
    const a = as.join(' ');
    if (q && a) faq.push({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } });
  }

  const graph = [
    {
      '@type': 'Review',
      itemReviewed: { '@type': 'Product', name: brand },
      reviewRating: { '@type': 'Rating', ratingValue: rating, bestRating: '5', worstRating: '1' },
      author: { '@type': 'Person', name: p.author },
      datePublished: p.date,
    },
  ];
  if (faq.length) {
    graph.push({ '@type': 'FAQPage', mainEntity: faq });
    withFaq++;
    faqItems += faq.length;
  }

  const obj = { '@context': 'https://schema.org', '@graph': graph };

  p.reviewJsonLd = JSON.stringify(obj);
  writeFileSync(fp, JSON.stringify(p));
  updated++;
}

console.log(`updated posts: ${updated}`);
console.log(`with FAQPage: ${withFaq} | total FAQ items: ${faqItems}`);
console.log(`missing brand: ${missingBrand.length}`);
