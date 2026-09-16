import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { site } from '@/lib/site';
import { getAuthors, getAuthor } from '@/lib/data';
import AuthorHero from '@/components/AuthorHero';
import PostStream from '@/components/PostStream';
import Pagination from '@/components/Pagination';

export const dynamicParams = false;

export function generateStaticParams() {
  const params: { author: string; page: string }[] = [];
  for (const [slug, a] of Object.entries(getAuthors())) {
    for (let i = 1; i < a.pages.length; i++) {
      params.push({ author: slug, page: String(i + 1) });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ author: string; page: string }>;
}): Promise<Metadata> {
  const { author, page } = await params;
  const a = getAuthor(author);
  if (!a) return { title: 'Not Found' };
  return {
    title: `${a.name} — ${site.name} — Page ${page}`,
    description: `${a.name}'s articles on ${site.name} — Page ${page}.`,
    alternates: { canonical: `/author/${author}/page/${page}` },
    robots: { index: false, follow: true },
  };
}

export default async function AuthorPageNumbered({
  params,
}: {
  params: Promise<{ author: string; page: string }>;
}) {
  const { author, page } = await params;
  const a = getAuthor(author);
  if (!a) notFound();

  const n = Number.parseInt(page, 10);
  if (Number.isNaN(n) || n < 2 || n > a.pages.length) notFound();

  const cards = a.pages[n - 1] ?? [];
  const total = a.pages.reduce((sum, p) => sum + p.length, 0);

  return (
    <main id="primary" className="lucky-site-main btt-home">
      <AuthorHero name={a.name} avatar={a.avatar} count={total} />
      <div className="lucky-container btt-home__container">
        <PostStream cards={cards} />
        <Pagination current={n} total={a.pages.length} base={`/author/${author}`} />
      </div>
    </main>
  );
}
