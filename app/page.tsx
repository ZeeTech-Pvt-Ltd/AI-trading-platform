import Link from 'next/link';
import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { getAllCards, getAuthors, getCard, getLastUpdatedDate, getTypePages } from '@/lib/data';
import { formatDate } from '@/lib/format';
import EditorsPicks from '@/components/EditorsPicks';
import HeroSearch from '@/components/HeroSearch';
import SortableGrid from '@/components/SortableGrid';
import PostStream from '@/components/PostStream';
import Pagination from '@/components/Pagination';

const HOME_TITLE = 'Independent AI Trading Platform Reviews (2026)';

// Manually pinned Editor's Picks slugs, most important first. Falls back to
// the latest reviews to fill any remaining slots.
const PINNED_PICKS: string[] = ['polar-zinsmere-review', 'zephgain-review'];

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

  const reviewPages = getTypePages('trading');
  const latest = reviewPages[0] ?? [];

  const pinnedCards = PINNED_PICKS.map((slug) => getCard('trading', slug)).filter(
    (c): c is NonNullable<typeof c> => !!c
  );
  const pinnedSlugs = new Set(pinnedCards.map((c) => c.slug));
  const picks = [...pinnedCards, ...latest.filter((c) => !pinnedSlugs.has(c.slug))].slice(0, 3);

  return (
    <main id="primary" className="lucky-site-main btt-home">
      {/* Hero */}
      <section className="btt-h-hero">
        <div className="btt-h-hero__inner">
          <div className="btt-h-hero__content">
            <span className="btt-h-eyebrow">Updated for 2026</span>
            <h1 className="btt-h-hero__title">
              We read the fine print on AI trading platforms{' '}
              <span className="btt-h-accent">so you don&rsquo;t have to.</span>
            </h1>
            <p className="btt-h-hero__lead">
              We&rsquo;re a small team and we test each platform by hand: the sign-up, the
              minimum deposit, how support actually responds. Then we write down exactly what we
              found. No sponsorships deciding the score, no guesswork.
            </p>

            <HeroSearch />

            <div className="btt-h-hero__ctas">
              <Link className="btt-h-btn btt-h-btn--primary" href="/reviews">
                Browse all reviews →
              </Link>
              <Link className="btt-h-btn btt-h-btn--ghost" href="/how-we-review">
                How we rate
              </Link>
            </div>
          </div>

          <aside className="btt-h-trust">
            <span className="btt-h-trust__head">A quick intro</span>
            <div className="btt-h-trust__grid">
              <div className="btt-h-trust__item">
                <strong>{reviewCount.toLocaleString('en-US')}</strong>
                <span>Platforms reviewed</span>
              </div>
              <div className="btt-h-trust__item">
                <strong>{CRITERIA.length}</strong>
                <span>Rating criteria</span>
              </div>
              <div className="btt-h-trust__item">
                <strong>{authorCount}</strong>
                <span>Reviewers on the team</span>
              </div>
              <div className="btt-h-trust__item">
                <strong>{formatDate(lastUpdated)}</strong>
                <span>Last updated</span>
              </div>
            </div>
            <p className="btt-h-trust__note">
              No one pays us for a better score. Ever.
            </p>
          </aside>
        </div>
      </section>

      {/* Editor's picks */}
      <EditorsPicks cards={picks} />

      {/* Latest reviews */}
      <section className="btt-h-latest">
        <div className="btt-h-latest__inner">
          <SortableGrid
            cards={latest}
            heading={
              <div key="latest-heading">
                <span className="btt-h-eyebrow">Latest reviews</span>
                <h2 className="btt-h-latest__title">Every platform we&rsquo;ve reviewed</h2>
              </div>
            }
          >
            <PostStream cards={latest} columns={3} />
          </SortableGrid>

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
            verdict is, independently of any commercial relationship: a platform cannot buy a
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
