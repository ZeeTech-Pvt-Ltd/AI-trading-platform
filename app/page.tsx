import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { site } from '@/lib/site';
import {
  getAllCards,
  getAuthors,
  getTopRatedCards,
  getLastUpdatedDate,
  getTypePages,
} from '@/lib/data';
import { formatDate, brandName, ratingVerdict } from '@/lib/format';
import PostStream from '@/components/PostStream';
import Pagination from '@/components/Pagination';
import TopRatedWidget from '@/components/TopRatedWidget';

const HOME_TITLE = 'AI Trading Platform — Independent AI & Crypto Trading Platform Reviews';

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: site.description,
  alternates: { canonical: site.url },
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: HOME_TITLE,
    description: site.description,
    images: [
      {
        url: `${site.url}/images/2026/07/og-default.png`,
        width: 1200,
        height: 630,
        alt: site.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: site.description,
    images: [`${site.url}/images/2026/07/og-default.png`],
  },
};

const CRITERIA = [
  {
    title: 'Regulation & licensing',
    text: 'Is the platform registered or regulated anywhere, and can that be verified?',
  },
  {
    title: 'Security',
    text: 'Encryption, custody, two-factor authentication, and any history of breaches.',
  },
  {
    title: 'Fees & costs',
    text: 'Deposit minimums, trading fees, spreads, and any hidden charges.',
  },
  {
    title: 'Ease of use',
    text: 'Onboarding, interface clarity, and the quality of the demo account.',
  },
  {
    title: 'Markets & features',
    text: 'Supported assets, automation quality, and genuinely useful tooling.',
  },
  {
    title: 'Customer support',
    text: 'Availability, responsiveness, and whether you can actually reach a human.',
  },
];

export default function HomePage() {
  const cards = getAllCards();
  const reviewCount = cards.filter((c) => c.type === 'trading').length;
  const authorCount = Object.keys(getAuthors()).length;
  const lastUpdated = getLastUpdatedDate();

  const topRated = getTopRatedCards(5);
  const reviewPages = getTypePages('trading');
  const latest = reviewPages[0] ?? [];
  const lead = latest[0];
  const leadName = lead ? brandName(lead.title) : '';
  const leadVerdict = lead ? ratingVerdict(lead.ratingValue) : null;
  const leadAffiliate = lead
    ? `https://austerio-smart-up.com/?f=${lead.slug.replace(/-review$/, '')}`
    : null;
  const leadPct = lead?.ratingValue
    ? (Math.min(5, Math.max(0, Number.parseFloat(lead.ratingValue))) / 5) * 100
    : 0;

  return (
    <main id="primary" className="lucky-site-main btt-home">
      {/* Hero */}
      <section className="btt-h-hero">
        <div className="btt-h-hero__inner">
          <div className="btt-h-hero__content">
            <span className="btt-h-eyebrow">2026 Review Roundup</span>
            <h1 className="btt-h-hero__title">
              AI trading platform reviews that read the fine print{' '}
              <span className="btt-h-accent">so you don&rsquo;t have to.</span>
            </h1>
            <p className="btt-h-hero__lead">{site.description}</p>

            <ul className="btt-h-stats">
              <li className="btt-h-stat">
                <strong>{reviewCount.toLocaleString('en-US')}</strong>
                <span>Platforms reviewed</span>
              </li>
              <li className="btt-h-stat">
                <strong>{CRITERIA.length}</strong>
                <span>Rating criteria</span>
              </li>
              <li className="btt-h-stat">
                <strong>{authorCount}</strong>
                <span>Reviewers on the team</span>
              </li>
              <li className="btt-h-stat">
                <strong>{formatDate(lastUpdated)}</strong>
                <span>Last updated</span>
              </li>
            </ul>

            <div className="btt-h-hero__ctas">
              <Link className="btt-h-btn btt-h-btn--primary" href="/reviews">
                Browse reviews →
              </Link>
              <Link className="btt-h-btn btt-h-btn--ghost" href="/how-we-review">
                How we rate
              </Link>
            </div>
          </div>

          <TopRatedWidget cards={topRated} />
        </div>

        {lead ? (
          <a href="#lead-review" className="btt-h-scrollcue" aria-label="Scroll to the latest review">
            ↓
          </a>
        ) : null}
      </section>

      {/* Lead review */}
      {lead ? (
        <section className="btt-h-leadwrap" id="lead-review">
          <div className="btt-h-lead">
            <div className="btt-h-lead__content">
              <span className="btt-h-eyebrow btt-h-eyebrow--dark">★ Lead Review</span>
              <h2 className="btt-h-lead__title">{lead.title}</h2>
              {lead.excerpt ? <p className="btt-h-lead__excerpt">{lead.excerpt}</p> : null}
              <p className="btt-h-lead__byline">
                By {lead.author} · {formatDate(lead.date)}
                {lead.readingTime ? ` · ${lead.readingTime}` : ''}
              </p>
              <div className="btt-h-lead__ctas">
                <Link className="btt-h-btn btt-h-btn--primary" href={`/trading/${lead.slug}`}>
                  Read the review →
                </Link>
                {leadAffiliate ? (
                  <a
                    className="btt-h-btn btt-h-btn--outline-dark"
                    href={leadAffiliate}
                    rel="sponsored nofollow noopener noreferrer"
                    target="_blank"
                  >
                    Visit {leadName} ⧉
                  </a>
                ) : null}
              </div>
            </div>
            {lead.ratingValue && leadVerdict ? (
              <div className="btt-h-lead__score">
                <span className="btt-h-lead__scoreLabel">Our score</span>
                <span
                  className="btt-h-lead__scoreRing"
                  style={{ '--pct': `${leadPct}%` } as CSSProperties}
                >
                  <span className="btt-h-lead__scoreRing__inner">{lead.ratingValue}</span>
                </span>
                <span className={`btt-h-badge btt-h-badge--${leadVerdict.tone}`}>
                  <span className="btt-h-badge__dot" aria-hidden="true" />
                  {leadVerdict.label}
                </span>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Latest reviews */}
      <section className="btt-h-latest">
        <div className="btt-h-latest__inner">
          <div className="btt-h-latest__head">
            <div>
              <span className="btt-h-eyebrow">Latest reviews</span>
              <h2 className="btt-h-latest__title">Every platform we&rsquo;ve reviewed</h2>
            </div>
            <span className="btt-h-latest__note">New reviews added regularly</span>
          </div>

          <PostStream cards={latest} columns={2} />

          <Pagination current={1} total={reviewPages.length} base="/reviews" />
        </div>
      </section>

      {/* Methodology */}
      <section className="btt-h-method">
        <div className="btt-h-method__inner">
          <div className="btt-h-latest__head">
            <div>
              <span className="btt-h-eyebrow">Methodology</span>
              <h2 className="btt-h-latest__title">How we rate</h2>
            </div>
            <span className="btt-h-latest__note">
              {CRITERIA.length} criteria, one overall score
            </span>
          </div>

          <ol className="btt-h-method__list">
            {CRITERIA.map((c, i) => (
              <li key={c.title}>
                <span className="btt-h-method__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="btt-h-method__title">{c.title}</span>
                <span className="btt-h-method__text">{c.text}</span>
              </li>
            ))}
          </ol>

          <p className="btt-h-disclosure">
            <strong>Disclosure.</strong> Our editorial team decides what we review and what our
            verdict is, independently of any commercial relationship — a platform cannot buy a
            better score. Some outbound links are affiliate links, marked{' '}
            <code>rel=&quot;sponsored&quot;</code>. Nothing on this site is financial advice, and
            trading involves risk. See our{' '}
            <Link href="/affiliate-disclosure">affiliate disclosure</Link> and{' '}
            <Link href="/disclaimer">disclaimer</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
