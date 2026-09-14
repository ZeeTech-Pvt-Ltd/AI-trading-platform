// One-off SEO cleanup for trading posts:
//  - Replace templated, unverifiable "96/97/98% success/accuracy" descriptions with honest ones.
//  - Fix "a active" / "a authentic" grammar errors in excerpts.
//  - Sync the WebPage/Article description inside the existing jsonLd graph.
// Does NOT touch scores, ratings, content body, or reviewJsonLd.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, '..', 'content', 'posts', 'trading');

const templates = [
  (n) =>
    `${n} review: we test the sign-up process, minimum deposit, demo account and payout speed — and flag the risks to check before you register.`,
  (n) =>
    `Is ${n} safe? Our independent review covers registration, minimum deposit, fees, demo account and support — plus the warning signs to watch for.`,
  (n) =>
    `${n} review — how it works, the minimum deposit, demo account and customer support, and the red flags to know before you sign up.`,
  (n) =>
    `Considering ${n}? Read our independent review of its registration, minimum deposit, fees, payout times and the risks of automated trading.`,
];

const SPAM_RE =
  /(Fact-checked|prediction accuracy|success rate|accuracy rate|precision|crypto trading platform based on)/i;

function fixExcerptGrammar(s) {
  return s
    .replace(/\ba active\b/g, 'an active')
    .replace(/\ba authentic\b/g, 'an authentic')
    .replace(/\ba early\b/g, 'an early')
    .replace(/\ba average\b/g, 'an average')
    .replace(/\ba independent\b/g, 'an independent')
    .replace(/\ba affordable\b/g, 'an affordable');
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json'));

let changedDesc = 0;
let changedExcerpt = 0;
let changedJsonLd = 0;

files.forEach((file, i) => {
  const filePath = path.join(DIR, file);
  const post = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const brand = (post.title || '').split(' Review')[0].trim();

  if (!brand) return;

  let dirty = false;

  // 1. honest description
  const newDesc = templates[i % templates.length](brand);
  if (post.description !== newDesc) {
    post.description = newDesc;
    changedDesc++;
    dirty = true;
  }

  // 2. excerpt grammar
  if (post.excerpt) {
    const fixed = fixExcerptGrammar(post.excerpt);
    if (fixed !== post.excerpt) {
      post.excerpt = fixed;
      changedExcerpt++;
      dirty = true;
    }
  }

  // 3. sync jsonLd WebPage/Article description
  if (post.jsonLd) {
    try {
      const jld = JSON.parse(post.jsonLd);
      if (jld && Array.isArray(jld['@graph'])) {
        for (const node of jld['@graph']) {
          if (
            node &&
            typeof node.description === 'string' &&
            SPAM_RE.test(node.description)
          ) {
            node.description = newDesc;
            changedJsonLd++;
            dirty = true;
          }
        }
        post.jsonLd = JSON.stringify(jld);
      }
    } catch {
      // leave jsonLd untouched if malformed
    }
  }

  if (dirty) {
    fs.writeFileSync(filePath, JSON.stringify(post, null, 0));
  }
});

console.log(`processed ${files.length} files`);
console.log(`descriptions rewritten: ${changedDesc}`);
console.log(`excerpts grammar-fixed: ${changedExcerpt}`);
console.log(`jsonLd descriptions synced: ${changedJsonLd}`);
