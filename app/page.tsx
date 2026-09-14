import Link from 'next/link';
import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { getHomePages } from '@/lib/data';
import PostStream from '@/components/PostStream';
import Pagination from '@/components/Pagination';

export const metadata: Metadata = {
  title: 'AI Trading Platform — Independent AI & Crypto Trading Platform Reviews',
  alternates: { canonical: site.url },
  openGraph: {
    title: 'AI Trading Platform — Independent AI & Crypto Trading Platform Reviews',
  },
};

export default function HomePage() {
  const pages = getHomePages();

  return (
    <main id="primary" className="lucky-site-main btt-home">
      <section className="btt-hero">
        <div className="btt-hero__inner">
          <p className="btt-hero__eyebrow">Crypto Platform Reviews</p>
          <h1 className="btt-hero__title">{site.name}</h1>
          <p className="btt-hero__tagline">{site.tagline}</p>
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
        <PostStream cards={pages[0]} featured />
        <Pagination current={1} total={pages.length} base="" />
      </div>
    </main>
  );
}
