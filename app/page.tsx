import Link from 'next/link';
import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { getHomePages, getAllCards } from '@/lib/data';
import PostStream from '@/components/PostStream';
import Pagination from '@/components/Pagination';

// Number of markets the site covers (editorial scope — UK, AU, EU, CA, US, ZA, IN).
const MARKETS_COVERED = 7;

export const metadata: Metadata = {
  title: 'AI Trading Platform — Independent AI & Crypto Trading Platform Reviews',
  alternates: { canonical: site.url },
  openGraph: {
    title: 'AI Trading Platform — Independent AI & Crypto Trading Platform Reviews',
  },
};

export default function HomePage() {
  const pages = getHomePages();
  const cards = getAllCards();
  const reviewCount = cards.filter((c) => c.type === 'trading').length;
  const guideCount = cards.filter((c) => c.type === 'bitcoin').length;

  return (
    <main id="primary" className="lucky-site-main btt-home">
      <section className="btt-hero">
        <div className="btt-hero__inner">
          <p className="btt-hero__eyebrow">
            Independent AI &amp; Crypto Trading Platform Reviews
          </p>
          <h1 className="btt-hero__title">{site.name}</h1>
          <p className="btt-hero__tagline">{site.description}</p>

          <ul className="btt-hero__stats">
            <li className="btt-hero__stat">
              <strong className="btt-hero__statValue">
                {reviewCount.toLocaleString('en-US')}
              </strong>
              <span className="btt-hero__statLabel">platform reviews</span>
            </li>
            <li className="btt-hero__stat">
              <strong className="btt-hero__statValue">
                {guideCount.toLocaleString('en-US')}
              </strong>
              <span className="btt-hero__statLabel">in-depth guides</span>
            </li>
            <li className="btt-hero__stat">
              <strong className="btt-hero__statValue">
                {MARKETS_COVERED}
              </strong>
              <span className="btt-hero__statLabel">markets covered</span>
            </li>
          </ul>

          <div className="btt-hero__links">
            <Link className="btt-hero__pill" href="/reviews">
              Browse Reviews
            </Link>
            <Link className="btt-hero__pill btt-hero__pill--ghost" href="/articles">
              Read Articles
            </Link>
          </div>
        </div>
      </section>

      <div className="lucky-container btt-home__container">
        <PostStream cards={pages[0]} featured columns={2} />
        <Pagination current={1} total={pages.length} base="" />
      </div>
    </main>
  );
}
