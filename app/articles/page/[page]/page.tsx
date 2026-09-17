import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { site } from '@/lib/site';
import { getTypePages } from '@/lib/data';
import Archive from '@/components/Archive';

export const dynamicParams = false;

export function generateStaticParams() {
  return getTypePages('bitcoin')
    .slice(1)
    .map((_, i) => ({ page: String(i + 2) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  return {
    title: `Bitcoin Articles | Page ${page}`,
    description: `In-depth Bitcoin development articles on ${site.name} (page ${page}).`,
    alternates: { canonical: `/articles/page/${page}` },
    robots: { index: false, follow: true },
  };
}

export default async function ArticlesNumbered({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const pages = getTypePages('bitcoin');
  const n = Number.parseInt(page, 10);
  if (Number.isNaN(n) || n < 2 || n > pages.length) notFound();

  return (
    <Archive
      cards={pages[n - 1]}
      kicker="Articles"
      title={`Bitcoin Articles | Page ${n}`}
      description="Deep technical writing on Bitcoin Core development and the open-source ecosystem."
      current={n}
      total={pages.length}
      base="/articles"
      columns={3}
    />
  );
}
