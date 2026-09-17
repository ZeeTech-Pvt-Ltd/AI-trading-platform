import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { site } from '@/lib/site';
import { getTypePages } from '@/lib/data';
import Archive from '@/components/Archive';

export const dynamicParams = false;

export function generateStaticParams() {
  return getTypePages('trading')
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
    title: `AI Trading Platform Reviews | Page ${page}`,
    description: `Independent, fact-checked AI trading platform reviews on ${site.name} (page ${page}).`,
    alternates: { canonical: `/reviews/page/${page}` },
    robots: { index: false, follow: true },
  };
}

export default async function ReviewsNumbered({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const pages = getTypePages('trading');
  const n = Number.parseInt(page, 10);
  if (Number.isNaN(n) || n < 2 || n > pages.length) notFound();

  return (
    <Archive
      cards={pages[n - 1]}
      kicker="Reviews"
      title={`AI Trading Platform Reviews | Page ${n}`}
      description="Independent, fact-checked reviews of AI trading platforms."
      current={n}
      total={pages.length}
      base="/reviews"
    />
  );
}
