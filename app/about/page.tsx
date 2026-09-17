import Link from 'next/link';
import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { getAllCards, getAuthors, getLastUpdatedDate } from '@/lib/data';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'About Us | Independent AI Trading Platform Reviews',
  description:
    'Who we are and how we review AI trading platforms: our independence, our process, and what we cover so you can decide what to trust.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Us | Independent AI Trading Platform Reviews',
    description:
      'Who we are and how we review AI trading platforms: our independence, our process, and what we cover so you can decide what to trust.',
    url: `${site.url}/about`,
  },
};

const RATING_CRITERIA_COUNT = 6;

export default function AboutPage() {
  const reviewCount = getAllCards().filter((c) => c.type === 'trading').length;
  const authors = Object.values(getAuthors())
    .map((a) => ({ ...a, count: a.pages.reduce((sum, p) => sum + p.length, 0) }))
    .sort((a, b) => b.count - a.count);
  const lastUpdated = getLastUpdatedDate();

  return (
    <main id="primary" className="lucky-site-main btt-single">
      <section className="btt-archive">
        <div className="btt-archive__inner">
          <span className="btt-archive__kicker">Who we are</span>
          <h1 className="btt-archive__title">
            We are not a marketing site. We are a team who actually test these platforms.
          </h1>
          <p className="btt-archive__desc">
            Every review on this site starts the same way: we open a real account, follow the
            same steps you would, and write down exactly what happened. No platform can pay us
            for a better score, and we say so when something looks wrong.
          </p>
        </div>
      </section>

      <div className="btt-about-stats">
        <div className="btt-about-stats__item">
          <strong>{reviewCount.toLocaleString('en-US')}</strong>
          <span>Platforms reviewed</span>
        </div>
        <div className="btt-about-stats__item">
          <strong>{RATING_CRITERIA_COUNT}</strong>
          <span>Rating criteria</span>
        </div>
        <div className="btt-about-stats__item">
          <strong>{authors.length}</strong>
          <span>Reviewers on the team</span>
        </div>
        <div className="btt-about-stats__item">
          <strong>{formatDate(lastUpdated)}</strong>
          <span>Last updated</span>
        </div>
      </div>

      <section className="btt-about-team">
        <div className="btt-about-team__inner">
          <h2>The team</h2>
          <p>Five reviewers, five perspectives, one rule: nobody gets a better review by paying more.</p>
          <ul className="btt-authors">
            {authors.map((a) => (
              <li key={a.slug}>
                <Link className="btt-author-card" href={`/author/${a.slug}`}>
                  {a.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt=""
                      src={a.avatar}
                      className="avatar avatar-120 photo"
                      height="120"
                      width="120"
                      decoding="async"
                    />
                  ) : null}
                  <span className="btt-author-card__name">{a.name}</span>
                  <span className="btt-author-card__count">{a.count} reviews</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="btt-article__inner">
        <div className="btt-article__content lucky-entry-content">
          <h2>How we stay independent</h2>
          <ul>
            <li>
              <strong>No pay-to-play.</strong> A platform cannot buy a positive rating from us.
              We don&rsquo;t accept payment in exchange for a review, rating, or placement.
            </li>
            <li>
              <strong>Editorial independence.</strong> Ratings and verdicts come from our
              editorial team, separate from any commercial relationship.
            </li>
            <li>
              <strong>Transparency.</strong> When we earn a commission from a link you click, we
              say so. See our <a href="/affiliate-disclosure">affiliate disclosure</a>.
            </li>
            <li>
              <strong>Corrections.</strong> If a review contains an error, we fix it and note the
              update. Tell us through the <a href="/contact">contact page</a>.
            </li>
          </ul>

          <h2>How we make money</h2>
          <p>
            Running a review site costs money. We may earn a commission from some of the
            platforms we cover when you sign up through our links. That never changes the
            verdict: we review platforms we recommend against just as carefully as the ones we
            recommend. Read more in our <a href="/affiliate-disclosure">affiliate disclosure</a>.
          </p>

          <h2>A note on risk</h2>
          <p>
            Trading, especially leveraged or automated crypto trading, carries a high risk of
            loss. Nothing on this site is financial advice. Please read our{' '}
            <a href="/disclaimer">disclaimer</a> before acting on anything you read here, and see{' '}
            <a href="/how-we-review">how we review</a> for the full criteria behind every rating.
          </p>
        </div>
      </div>
    </main>
  );
}
