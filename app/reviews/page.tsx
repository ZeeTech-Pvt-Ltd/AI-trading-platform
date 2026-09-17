import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { getAllCards, getTypePages } from '@/lib/data';
import Archive from '@/components/Archive';

const YEAR = new Date().getFullYear();

export function generateMetadata(): Metadata {
  const count = getAllCards().filter((c) => c.type === 'trading').length;
  const title = `${count.toLocaleString('en-US')}+ AI Trading Platform Reviews (${YEAR})`;
  const description = `Browse ${count.toLocaleString('en-US')}+ independent AI trading platform reviews: real sign-up steps, minimum deposits, and payout checks, rated for ${YEAR}.`;

  return {
    title,
    description,
    alternates: { canonical: '/reviews' },
    openGraph: {
      title,
      description,
      url: `${site.url}/reviews`,
    },
  };
}

export default function ReviewsPage() {
  const pages = getTypePages('trading');
  const count = getAllCards().filter((c) => c.type === 'trading').length;
  return (
    <Archive
      cards={pages[0] ?? []}
      kicker={`${count.toLocaleString('en-US')}+ Platforms Reviewed`}
      title="AI Trading Platform Reviews"
      description={`Independent, fact-checked reviews of ${count.toLocaleString('en-US')}+ AI trading platforms: what's real, what to avoid, and how to register safely. Every review is scored against the same criteria and updated as platforms change.`}
      current={1}
      total={pages.length}
      base="/reviews"
      columns={3}
      sortable
    />
  );
}
