import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { getTypePages } from '@/lib/data';
import Archive from '@/components/Archive';

export const metadata: Metadata = {
  title: 'Crypto Platform Reviews',
  description: `Independent, fact-checked reviews of crypto trading platforms on ${site.name}.`,
  alternates: { canonical: '/reviews' },
  openGraph: {
    title: 'Crypto Platform Reviews',
    description: `Independent, fact-checked reviews of crypto trading platforms on ${site.name}.`,
    url: `${site.url}/reviews`,
  },
};

export default function ReviewsPage() {
  const pages = getTypePages('trading');
  return (
    <Archive
      cards={pages[0] ?? []}
      kicker="Reviews"
      title="Crypto Platform Reviews"
      description="Independent, fact-checked reviews of crypto trading platforms — what's real, what to avoid, and how to register safely."
      current={1}
      total={pages.length}
      base="/reviews"
    />
  );
}
