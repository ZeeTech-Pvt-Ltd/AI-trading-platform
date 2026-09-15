// Add an honest critical review of "Boyne Wealthholm" (boyne-wealthholm.com).
// Based on research of the live site on 2026-09-15: no named regulator, no
// registered company, no contact details, an "85% Accuracy" claim with no
// methodology, and conflicting review figures. Verdict: High Risk — Avoid.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const SLUG = 'boyne-wealthholm-review';
const TITLE = 'Boyne Wealthholm Review: Is It Legit or a High-Risk Signup?';
const DATE = '2026-09-15T09:00:00+00:00';
const AUTHOR_NAME = 'Sophia Reynolds';
const AUTHOR_SLUG = 'sophiareynolds';
const RATING = '1.5';
const READING_TIME = '6 min read';

const DESCRIPTION =
  'Boyne Wealthholm review — the claims it makes, the regulation and company details it does not disclose, and why we rate it high risk.';

const EXCERPT = `<p>Boyne Wealthholm markets an &#8220;Advanced AI Trading Engine&#8221; to Irish investors with an &#8220;85% accuracy&#8221; claim and 24/7 automated trading. Our review could not verify a regulator, a registered company, or even a phone number anywhere on the site, which is why we rate it high risk and recommend caution before signing up.</p>`;

const CONTENT = `
<div class="bd-review">
<section class="bd-section bd-intro">
<p class="bd-text">Boyne Wealthholm presents itself as an AI-driven automated trading platform aimed at Irish investors, built around a &#8220;machine learning&#8221; engine, an &#8220;Advanced AI Trading Engine&#8221;, and a claim of &#8220;85% Accuracy&#8221;. It also promises 24/7 trading across Bitcoin, Ethereum, forex, equities, commodities, precious metals and CFDs, with a manual override option.</p>
<p class="bd-text">Before you take the &#8220;Limited Access — Register Now&#8221; prompt at face value, know this: we could not find a licence number, a named regulator, a registered company, or even a phone number or email address anywhere on the site. That is not how a regulated broker operates, and it is the reason this review reaches the verdict it does.</p>
</section>
<div class="bd-rating-bar">
<div class="bd-rating-item">
<div class="bd-rating-icon bd-rating-icon--star" aria-hidden="true"></div>
<div class="bd-rating-label">Overall Rating</div>
<div class="bd-stars" aria-label="1.5 out of 5">
<div class="bd-stars__fill" style="width:30%"></div>
</div>
<div class="bd-rating-score">1.5/5</div>
</div>
<div class="bd-rating-item">
<div class="bd-rating-icon bd-rating-icon--ease" aria-hidden="true"></div>
<div class="bd-rating-label">Ease of Use</div>
<div class="bd-stars" aria-label="2 out of 5">
<div class="bd-stars__fill" style="width:40%"></div>
</div>
<div class="bd-rating-score">2/5</div>
</div>
<div class="bd-rating-item">
<div class="bd-rating-icon bd-rating-icon--features" aria-hidden="true"></div>
<div class="bd-rating-label">Features</div>
<div class="bd-stars" aria-label="2 out of 5">
<div class="bd-stars__fill" style="width:40%"></div>
</div>
<div class="bd-rating-score">2/5</div>
</div>
<div class="bd-rating-item">
<div class="bd-rating-icon bd-rating-icon--value" aria-hidden="true"></div>
<div class="bd-rating-label">Value</div>
<div class="bd-stars" aria-label="1 out of 5">
<div class="bd-stars__fill" style="width:20%"></div>
</div>
<div class="bd-rating-score">1/5</div>
</div>
<div class="bd-rating-item">
<div class="bd-rating-icon bd-rating-icon--support" aria-hidden="true"></div>
<div class="bd-rating-label">Support</div>
<div class="bd-stars" aria-label="1 out of 5">
<div class="bd-stars__fill" style="width:20%"></div>
</div>
<div class="bd-rating-score">1/5</div>
</div>
</div>
<section class="bd-section bd-section--overview">
<h2 class="bd-heading">Boyne Wealthholm Explained: What the Site Claims</h2>
<p class="bd-text">This assessment is based on the platform&#8217;s own website, boyne-wealthholm.com, accessed on 15 September 2026. The site describes an &#8220;Advanced AI Trading Engine&#8221; that uses machine learning to scan markets and place trades automatically, with a manual override for users who want to make the final call. It lists a wide range of tradable assets and says funding is available via major credit cards, bank transfer and PayPal.</p>
<p class="bd-text">What it does <em>not</em> provide is the basic information any genuine investment firm must publish. The table below records what we were and were not able to verify.</p>
<h3 class="bd-subheading">What We Could and Could Not Verify</h3>
<div class="bd-table-wrap">
<table class="bd-specs">
<thead>
<tr>
<th>Item</th>
<th>Value</th>
</tr>
</thead>
<tbody>
<tr>
<td>Access Type</td>
<td>Web registration form (single page)</td>
</tr>
<tr>
<td>Core Technology</td>
<td>Claimed AI / machine learning engine (unverified)</td>
</tr>
<tr>
<td>Regulator / Licence</td>
<td>None disclosed — no regulator or licence number named</td>
</tr>
<tr>
<td>Company Registration</td>
<td>None disclosed — no legal entity or number</td>
</tr>
<tr>
<td>Minimum Deposit</td>
<td>Not disclosed (&#8220;a small initial deposit&#8221;)</td>
</tr>
<tr>
<td>Fees</td>
<td>Not disclosed</td>
</tr>
<tr>
<td>Contact Details</td>
<td>None — only a &#8220;Contact us&#8221; link to /help</td>
</tr>
<tr>
<td>Demo Account</td>
<td>Not mentioned</td>
</tr>
<tr>
<td>Claimed Accuracy</td>
<td>&#8220;85% Accuracy&#8221; — no methodology or audit provided</td>
</tr>
</tbody>
</table>
</div>
<p class="bd-text bd-note">A trading platform that asks you to deposit money but does not identify who operates it, where it is registered, or who regulates it, fails the first due-diligence check we run on every product.</p>
</section>
<section class="bd-section bd-section--balance">
<h2 class="bd-heading">Boyne Wealthholm Strengths and Drawbacks</h2>
<p class="bd-text">A fair review records what the platform does reasonably, alongside where it falls short. Here is our honest balance.</p>
<div class="bd-balance-grid">
<div class="bd-panel bd-panel--pros">
<div class="bd-panel__head">
<div class="bd-panel__badge bd-panel__badge--ok" aria-hidden="true"></div>
<h3 class="bd-subheading bd-subheading--pros">What it does acceptably:</h3>
</div>
<ul class="bd-list bd-list--pros">
<li>
<div class="bd-ico-check" aria-hidden="true"></div>
<div>a simple, single-page registration form that is quick to complete.</div>
</li>
<li>
<div class="bd-ico-check" aria-hidden="true"></div>
<div>it lists a broad range of asset classes rather than crypto alone.</div>
</li>
<li>
<div class="bd-ico-check" aria-hidden="true"></div>
<div>it includes a brief risk disclaimer acknowledging trading losses.</div>
</li>
</ul>
</div>
<div class="bd-panel bd-panel--cons">
<div class="bd-panel__head">
<div class="bd-panel__badge bd-panel__badge--mix" aria-hidden="true"></div>
<h3 class="bd-subheading bd-subheading--cons">Where it fails basic checks:</h3>
</div>
<ul class="bd-list bd-list--cons">
<li>
<div class="bd-ico-x" aria-hidden="true"></div>
<div>no regulator, licence number, or registered company is disclosed anywhere.</div>
</li>
<li>
<div class="bd-ico-x" aria-hidden="true"></div>
<div>no phone, email, or postal address — the only contact route is a /help link.</div>
</li>
<li>
<div class="bd-ico-x" aria-hidden="true"></div>
<div>an &#8220;85% Accuracy&#8221; claim with no methodology or evidence to support it.</div>
</li>
<li>
<div class="bd-ico-x" aria-hidden="true"></div>
<div>conflicting review figures on a single widget (4.7/189, then 247, then &#8220;Score of 5&#8221;).</div>
</li>
<li>
<div class="bd-ico-x" aria-hidden="true"></div>
<div>testimonials are first names only, with stock-style avatars and no verification.</div>
</li>
<li>
<div class="bd-ico-x" aria-hidden="true"></div>
<div>&#8220;Limited Access — Register Now&#8221; scarcity pressure repeated across the page.</div>
</li>
</ul>
</div>
</div>
<p class="bd-text bd-note">The common thread is opacity: a platform that cannot be identified cannot be held accountable.</p>
</section>
<section class="bd-section bd-section--credibility">
<h2 class="bd-heading">The Red Flags We Could Not Ignore</h2>
<p class="bd-text">Several findings on this site are individually concerning and collectively decisive.</p>
<div class="bd-mistake">
<h3 class="bd-subheading">No verifiable regulation or company.</h3>
<p class="bd-text">Regulated brokers in Ireland and across the EU must name their authorising regulator and publish company details. This site names none. Its only compliance statement — that accounts &#8220;comply with Ireland&#8217;s regulations&#8221; — is not tied to any actual licence or authority.</p>
</div>
<div class="bd-mistake">
<h3 class="bd-subheading">An &#8220;85% accuracy&#8221; claim with no proof.</h3>
<p class="bd-text">No trading system can guarantee accuracy, and no credible one advertises a figure like this without a methodology or audit. Presented with no evidence, the claim is a marketing device, not a performance record.</p>
</div>
<div class="bd-mistake">
<h3 class="bd-subheading">Contradictory review numbers.</h3>
<p class="bd-text">The ratings block shows &#8220;4.7&#8221; beside 189 reviews, then &#8220;Based on 247 reviews&#8221;, then &#8220;Score of 5&#8221; — three different figures in one place. Genuine platforms do not display inconsistent social proof.</p>
</div>
<div class="bd-mistake">
<h3 class="bd-subheading">No contact details or fee schedule.</h3>
<p class="bd-text">There is no phone, email, or physical address, and no minimum deposit or fee is stated before sign-up. A firm you cannot contact and whose costs you cannot see is not one you can safely trust with money.</p>
</div>
</section>
<section class="bd-section bd-section--faq">
<h2 class="bd-heading">Boyne Wealthholm FAQ</h2>
<div class="bd-faq">
<div class="bd-faq__item">
<h3 class="bd-subheading">Is Boyne Wealthholm regulated?</h3>
<p class="bd-text">We could not find any regulator, licence number, or registered company named on the site, and could not verify any authorisation independently.</p>
</div>
<div class="bd-faq__item">
<h3 class="bd-subheading">What is the minimum deposit?</h3>
<p class="bd-text">The site does not state a figure. It refers only to &#8220;a small initial deposit&#8221; before registration.</p>
</div>
<div class="bd-faq__item">
<h3 class="bd-subheading">Does it really achieve 85% accuracy?</h3>
<p class="bd-text">The site offers no methodology, audit, or data to support this claim. Treat it as unverified marketing.</p>
</div>
<div class="bd-faq__item">
<h3 class="bd-subheading">Should I sign up?</h3>
<p class="bd-text">We recommend against it. A platform with no verifiable regulation, identity, or contact details is high risk, regardless of its stated accuracy.</p>
</div>
</div>
</section>
<section class="bd-verdict-card">
<div class="bd-verdict-card__icon" aria-hidden="true"></div>
<div class="bd-verdict-card__body">
<h2 class="bd-heading">Our Verdict on Boyne Wealthholm</h2>
<p class="bd-text">Boyne Wealthholm fails the basic due-diligence checks we apply before recommending any trading platform. It names no regulator, no registered company, and no way to contact the operator, while advertising an &#8220;85% accuracy&#8221; figure it does not support and showing contradictory review numbers on its own page.</p>
<p class="bd-text">Those are the warning signs we tell readers to look for, not the signs of a platform we would use ourselves. We rate it high risk and recommend avoiding it.</p>
</div>
<div class="bd-verdict-card__score">
<div class="bd-verdict-card__number">1.5</div>
<div>/5</div>
</div>
<div class="bd-stars bd-stars--lg" aria-label="1.5 out of 5">
<div class="bd-stars__fill" style="width:30%"></div>
</div>
<div class="bd-verdict-card__tag">High Risk — Avoid</div>
</div>
</section>
</div>
`;

// ---------- JSON-LD ----------
const SITE = 'https://ai-trading-platform.com';
const URL = `${SITE}/trading/${SLUG}`;
const PERSON_ID = `${SITE}/#/schema/person/sophiareynolds`;

const jsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      '@id': `${URL}#article`,
      isPartOf: { '@id': URL },
      author: { name: AUTHOR_NAME, '@id': PERSON_ID },
      headline: TITLE,
      datePublished: DATE,
      mainEntityOfPage: { '@id': URL },
      wordCount: 720,
      commentCount: 0,
      articleSection: ['Trading'],
      inLanguage: 'en-US',
      potentialAction: [
        { '@type': 'CommentAction', name: 'Comment', target: [`${URL}#respond`] },
      ],
    },
    {
      '@type': 'WebPage',
      '@id': URL,
      url: URL,
      name: TITLE,
      isPartOf: { '@id': `${SITE}/#website` },
      datePublished: DATE,
      author: { '@id': PERSON_ID },
      description: DESCRIPTION,
      breadcrumb: { '@id': `${URL}#breadcrumb` },
      inLanguage: 'en-US',
      potentialAction: [{ '@type': 'ReadAction', target: [URL] }],
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${URL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: TITLE },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: `${SITE}/`,
      name: 'AI Trading Platform',
      description: 'All About Bitcoin Development',
      potentialAction: [
        {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/?s={search_term_string}` },
          'query-input': {
            '@type': 'PropertyValueSpecification',
            valueRequired: true,
            valueName: 'search_term_string',
          },
        },
      ],
      inLanguage: 'en-US',
    },
    {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: AUTHOR_NAME,
      image: {
        '@type': 'ImageObject',
        inLanguage: 'en-US',
        '@id': `${SITE}/images/authors/sophiareynolds.svg`,
        url: `${SITE}/images/authors/sophiareynolds.svg`,
        contentUrl: `${SITE}/images/authors/sophiareynolds.svg`,
        caption: AUTHOR_NAME,
      },
      url: `${SITE}/@sophiareynolds`,
    },
  ],
});

const reviewJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Review',
      itemReviewed: { '@type': 'Product', name: 'Boyne Wealthholm' },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: RATING,
        bestRating: '5',
        worstRating: '1',
      },
      author: { '@type': 'Person', name: AUTHOR_NAME },
      datePublished: DATE,
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is Boyne Wealthholm regulated?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We could not find any regulator, licence number, or registered company named on the site, and could not verify any authorisation independently.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the minimum deposit?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The site does not state a figure. It refers only to a small initial deposit before registration.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does it really achieve 85% accuracy?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The site offers no methodology, audit, or data to support this claim. Treat it as unverified marketing.',
          },
        },
        {
          '@type': 'Question',
          name: 'Should I sign up?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We recommend against it. A platform with no verifiable regulation, identity, or contact details is high risk.',
          },
        },
      ],
    },
  ],
});

const post = {
  type: 'trading',
  slug: SLUG,
  title: TITLE,
  description: DESCRIPTION,
  author: AUTHOR_NAME,
  authorSlug: AUTHOR_SLUG,
  date: DATE,
  readingTime: READING_TIME,
  categories: ['trading'],
  excerpt: EXCERPT,
  content: CONTENT,
  jsonLd,
  reviewJsonLd,
  ogImage: '',
};

const card = {
  type: 'trading',
  slug: SLUG,
  title: TITLE,
  excerpt: EXCERPT,
  author: AUTHOR_NAME,
  authorSlug: AUTHOR_SLUG,
  date: DATE,
  readingTime: READING_TIME,
  ratingValue: RATING,
};

// ---------- Write content file ----------
const postPath = path.join(ROOT, 'content', 'posts', 'trading', `${SLUG}.json`);
fs.writeFileSync(postPath, JSON.stringify(post));

// ---------- Update manifest ----------
const manifestPath = path.join(ROOT, 'content', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Insert into homePages flat list at the front, then re-paginate (10/page).
const flat = [card, ...manifest.homePages.flat()];
const homePages = [];
for (let i = 0; i < flat.length; i += 10) homePages.push(flat.slice(i, i + 10));
manifest.homePages = homePages;

// Insert into the author's pages flat list at the front, then re-paginate.
const author = manifest.authors[AUTHOR_SLUG];
if (!author) throw new Error(`Author not found: ${AUTHOR_SLUG}`);
const authorFlat = [card, ...author.pages.flat()];
const authorPages = [];
for (let i = 0; i < authorFlat.length; i += 10) authorPages.push(authorFlat.slice(i, i + 10));
author.pages = authorPages;

fs.writeFileSync(manifestPath, JSON.stringify(manifest));

console.log('Wrote', postPath);
console.log('Manifest: homePages', manifest.homePages.length, 'pages /', manifest.homePages.flat().length, 'cards');
console.log('Author', AUTHOR_SLUG, 'now', author.pages.flat().length, 'cards');
console.log('New card at homePages[0][0]:', manifest.homePages[0][0].slug, manifest.homePages[0][0].ratingValue);
