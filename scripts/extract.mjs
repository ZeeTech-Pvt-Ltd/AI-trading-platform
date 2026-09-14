/**
 * Extraction script — converts the scraped WordPress HTML mirror into
 * structured JSON content for the Next.js rebuild.
 *
 * Run from the next-app/ directory:  node scripts/extract.mjs
 *
 * Outputs:
 *   content/posts/<type>/<slug>.json   — one file per article/review (full content)
 *   content/manifest.json              — ordered card metadata + author archives
 *   public/images/**                   — copied uploads (images)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(__dirname, '..');
const SRC = path.join(APP, '..'); // the scraped HTML mirror lives one level up
const CONTENT = path.join(APP, 'content');
const POSTS = path.join(CONTENT, 'posts');
const PUBLIC = path.join(APP, 'public');
const IMAGES = path.join(PUBLIC, 'images');

const read = (p) => fs.readFileSync(p, 'utf8');
const writeJson = (p, obj) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj));
};

// ---------------------------------------------------------------- helpers

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
}

const stripTags = (s) => s.replace(/<[^>]*>/g, ' ');

// Cloudflare email obfuscation decoder (removes cdn-cgi/email-protection)
function decodeCfEmail(hex) {
  if (!hex) return '';
  const key = parseInt(hex.slice(0, 2), 16);
  let out = '';
  for (let i = 2; i < hex.length; i += 2) {
    out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
  }
  return out;
}

function decodeCfEmails(html) {
  return html.replace(
    /<a[^>]*data-cfemail="([0-9a-fA-F]+)"[^>]*>[\s\S]*?<\/a>/g,
    (m, hex) => decodeCfEmail(hex),
  );
}

// Rewrite local upload paths to the Next.js /images path
function rewriteAssets(html) {
  return html
    .replace(/https?:\/\/ai-trading-platform\.com\/wp-content\/uploads\//g, '/images/')
    .replace(/(\.\.\/)?wp-content\/uploads\//g, '/images/');
}

// Strip Medium's obfuscated class/id attributes (bitcoin articles)
function stripClasses(html) {
  return html.replace(/ class="[^"]*"/g, '').replace(/ id="[^"]*"/g, '');
}

// Slice the inner HTML of a <div> opened at `startIdx` (just past its ">").
function sliceBalanced(html, startIdx) {
  let depth = 1;
  const re = /<(\/?)div\b[^>]*>/gi;
  re.lastIndex = startIdx;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m[1] === '/') {
      depth--;
      if (depth === 0) return html.slice(startIdx, m.index);
    } else {
      depth++;
    }
  }
  return html.slice(startIdx);
}

function extractDivContent(html, openPattern) {
  const m = html.match(openPattern);
  if (!m) return '';
  const gt = html.indexOf('>', m.index);
  return sliceBalanced(html, gt + 1);
}

// ---------------------------------------------------------------- post extraction

function meta(html, name) {
  const m = html.match(new RegExp('<meta name="' + name + '" content="([^"]*)"'));
  return m ? m[1] : '';
}
function metaProp(html, prop) {
  const m = html.match(new RegExp('<meta property="' + prop + '" content="([^"]*)"'));
  return m ? m[1] : '';
}
function postTitle(html) {
  const m = html.match(/<h1 class="btt-article__title">([\s\S]*?)<\/h1>/);
  return m ? decodeEntities(stripTags(m[1])).trim() : '';
}
function authorName(html) {
  const m = html.match(/<a class="btt-byline__name"[^>]*>([\s\S]*?)<\/a>/);
  return m ? decodeEntities(stripTags(m[1])).trim() : '';
}
function authorSlug(html) {
  const m = html.match(/<a class="btt-byline__name"[^>]*href="[^"]*@([^"./]+)\.html"/);
  return m ? m[1] : '';
}
function postDate(html) {
  const m = html.match(/<time datetime="([^"]+)"/);
  return m ? m[1] : '';
}
function readingTime(html) {
  const m = html.match(/(\d+)\s*min read/);
  return m ? m[1] + ' min read' : '';
}
function categories(html) {
  const m = html.match(/<article[^>]*class="([^"]*)"/);
  if (!m) return [];
  const out = [];
  for (const c of m[1].split(/\s+/)) if (c.startsWith('category-')) out.push(c.slice(9));
  return out;
}
function excerptHtml(html) {
  return extractDivContent(html, /<div class="btt-excerpt"[^>]*>/);
}
function contentHtml(html) {
  return extractDivContent(html, /<div class="[^"]*btt-article__content[^"]*"[^>]*>/);
}
function extractJsonLd(html) {
  const m = html.match(/<script type="application\/ld\+json" class="yoast-schema-graph">([\s\S]*?)<\/script>/);
  return m ? m[1].trim() : '';
}

function extractPost(filePath, type, slug) {
  const html = read(filePath);
  let content = contentHtml(html);
  if (type === 'bitcoin') content = stripClasses(content);
  content = rewriteAssets(decodeCfEmails(content));
  const excerpt = rewriteAssets(decodeCfEmails(excerptHtml(html)));

  return {
    type,
    slug,
    title: postTitle(html),
    description: meta(html, 'description'),
    author: authorName(html),
    authorSlug: authorSlug(html),
    date: postDate(html),
    readingTime: readingTime(html),
    categories: categories(html),
    excerpt,
    content,
    jsonLd: extractJsonLd(html),
    ogImage: metaProp(html, 'og:image'),
  };
}

// ---------------------------------------------------------------- card extraction

function extractCards(html) {
  const cards = [];
  const articleRe = /<article class="btt-card[^"]*"[^>]*>([\s\S]*?)<\/article>/g;
  let am;
  while ((am = articleRe.exec(html)) !== null) {
    const body = am[1];
    const linkM = body.match(
      /<h2 class="btt-card__title">\s*<a href="(?:\.\.\/)*(trading|bitcoin)\/([a-z0-9-]+)\.html"[^>]*>([\s\S]*?)<\/a>/,
    );
    if (!linkM) continue;
    const type = linkM[1];
    const slug = linkM[2];
    const title = decodeEntities(stripTags(linkM[3])).trim();

    const exM = body.match(/<p class="btt-card__excerpt">([\s\S]*?)<\/p>/);
    const excerpt = exM ? decodeEntities(stripTags(exM[1])).trim() : '';

    const auM = body.match(
      /<a class="btt-card__author"[^>]*href="[^"]*@([^"./]+)\.html"[^>]*>([\s\S]*?)<\/a>/,
    );
    const authorSlug = auM ? auM[1] : '';
    const author = auM ? decodeEntities(stripTags(auM[2])).trim() : '';

    const dM = body.match(/<time datetime="([^"]+)"/);
    const date = dM ? dM[1] : '';

    const rtM = body.match(/(\d+)\s*min read/);
    const readingTime = rtM ? rtM[1] + ' min read' : '';

    cards.push({ type, slug, title, excerpt, author, authorSlug, date, readingTime });
  }
  return cards;
}

// ---------------------------------------------------------------- main

function main() {
  fs.rmSync(CONTENT, { recursive: true, force: true });
  fs.rmSync(IMAGES, { recursive: true, force: true });

  // 1. posts
  let tradingCount = 0;
  let bitcoinCount = 0;
  for (const type of ['trading', 'bitcoin']) {
    const dir = path.join(SRC, type);
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.html')) continue;
      const slug = f.replace(/\.html$/, '');
      const post = extractPost(path.join(dir, f), type, slug);
      writeJson(path.join(POSTS, type, slug + '.json'), post);
      if (type === 'trading') tradingCount++;
      else bitcoinCount++;
    }
  }

  // 2. home pagination
  const homePages = [extractCards(read(path.join(SRC, 'index.html')))];
  const pageDir = path.join(SRC, 'page');
  const pageNums = fs
    .readdirSync(pageDir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => parseInt(f, 10))
    .sort((a, b) => a - b);
  for (const n of pageNums) {
    homePages[n - 1] = extractCards(read(path.join(pageDir, n + '.html')));
  }

  // 3. authors
  const authors = {};
  const authorFiles = fs.readdirSync(SRC).filter((f) => /^@.+\.html$/.test(f));
  for (const f of authorFiles) {
    const slug = f.replace(/^@/, '').replace(/\.html$/, '');
    const html = read(path.join(SRC, f));
    const nameM = html.match(/<h1 class="btt-author-hero__name">([\s\S]*?)<\/h1>/);
    const avatarM = html.match(
      /<img[^>]*src=["'](https:\/\/secure\.gravatar\.com\/avatar\/[^"']+)["']/,
    );
    const pages = [extractCards(html)];
    const pdir = path.join(SRC, '@' + slug, 'page');
    if (fs.existsSync(pdir)) {
      const nums = fs
        .readdirSync(pdir)
        .filter((x) => x.endsWith('.html'))
        .map((x) => parseInt(x, 10))
        .sort((a, b) => a - b);
      for (const n of nums) pages.push(extractCards(read(path.join(pdir, n + '.html'))));
    }
    authors[slug] = {
      slug,
      name: nameM ? decodeEntities(stripTags(nameM[1])).trim() : slug,
      avatar: avatarM ? decodeEntities(avatarM[1]) : '',
      pages,
    };
  }

  writeJson(path.join(CONTENT, 'manifest.json'), { homePages, authors });

  // 4. images — copy uploads into public/images preserving structure
  const uploads = path.join(SRC, 'wp-content', 'uploads');
  copyTree(uploads, IMAGES);

  console.log('Extraction complete.');
  console.log('  trading posts :', tradingCount);
  console.log('  bitcoin posts :', bitcoinCount);
  console.log('  home pages    :', homePages.length);
  console.log('  authors       :', Object.keys(authors).length);
  console.log('  images        :', countFiles(IMAGES));
}

function copyTree(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyTree(s, d);
    else fs.copyFileSync(s, d);
  }
}

function countFiles(dir) {
  let n = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    n += entry.isDirectory() ? countFiles(path.join(dir, entry.name)) : 1;
  }
  return n;
}

main();
