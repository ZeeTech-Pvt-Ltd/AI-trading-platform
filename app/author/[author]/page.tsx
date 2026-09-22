import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { site } from '@/lib/site';
import { getAuthors, getAuthor } from '@/lib/data';
import AuthorHero from '@/components/AuthorHero';
import PostStream from '@/components/PostStream';
import Pagination from '@/components/Pagination';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(getAuthors()).map((author) => ({ author }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ author: string }>;
}): Promise<Metadata> {
  const { author } = await params;
  const a = getAuthor(author);
  if (!a) return { title: 'Not Found' };
  const total = a.pages.reduce((sum, p) => sum + p.length, 0);
  return {
    title: `${a.name} — ${site.name}`,
    description: `${a.name} has written ${total} articles on ${site.name}.`,
    alternates: { canonical: `/author/${author}` },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ author: string }>;
}) {
  const { author } = await params;
  const a = getAuthor(author);
  if (!a) notFound();

  const cards = a.pages[0] ?? [];
  const total = a.pages.reduce((sum, p) => sum + p.length, 0);

  return (
    <main id="primary" className="lucky-site-main btt-home">
      <AuthorHero name={a.name} avatar={a.avatar} count={total} />
      <div className="lucky-container btt-home__container">
        <PostStream cards={cards} featured />
        <Pagination current={1} total={a.pages.length} base={`/author/${author}`} />
      </div>
    </main>
  );
}
