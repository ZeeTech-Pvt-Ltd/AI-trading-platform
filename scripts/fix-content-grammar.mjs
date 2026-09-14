// Fix systematic "a <vowel-word>" -> "an <vowel-word>" grammar errors in the
// review content BODY. Deliberately leaves "a useful" / "a unique" (y-sound) intact.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, '..', 'content', 'posts', 'trading');

// Words that take "an" (start with a vowel SOUND).
const VOWEL_WORDS = [
  'accessible',
  'extra',
  'authentic',
  'online',
  'uncertain',
  'alternative',
  'easy',
  'early',
  'assisted',
  'additional',
  'acceptable',
  'assurance',
  'advanced',
  'affordable',
  'active',
  'excellent',
  'independent',
  'average',
  'effective',
  'efficient',
  'intuitive',
  'instant',
];

const re = new RegExp(`\\ba (${VOWEL_WORDS.join('|')})\\b`, 'g');

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json'));

let changedFiles = 0;
let totalFixes = 0;

for (const file of files) {
  const filePath = path.join(DIR, file);
  const post = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!post.content) continue;
  const before = post.content;
  const fixed = before.replace(re, 'an $1');
  if (fixed !== before) {
    post.content = fixed;
    totalFixes += (before.match(re) || []).length;
    changedFiles++;
    fs.writeFileSync(filePath, JSON.stringify(post, null, 0));
  }
}

console.log(`files changed: ${changedFiles}`);
console.log(`total grammar fixes: ${totalFixes}`);
