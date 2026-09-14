import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { site } from '@/lib/site';
import { getHomePages } from '@/lib/data';
import PostStream from '@/components/PostStream';
import Pagination from '@/components/Pagination';

export const dynamicParams = false;

export function generateStaticParams() {
  const pages = getHomePages();
  return pages.slice(1).map((_, i) => ({ page: String(i + 2) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  return {
    title: `${site.name} — Page ${page}`,
    description: `${site.description} — Page ${page}`,
    alternates: { canonical: `/page/${page}` },
  };
}

export default async function HomePageNumbered({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const pages = getHomePages();
  const n = Number.parseInt(page, 10);

  if (Number.isNaN(n) || n < 2 || n > pages.length) notFound();
  const cards = pages[n - 1];

  return (
    <main id="primary" className="lucky-site-main btt-home">
      <div className="lucky-container btt-home__container">
        <PostStream cards={cards} columns={1} />
        <Pagination current={n} total={pages.length} base="" />
      </div>
    </main>
  );
}
