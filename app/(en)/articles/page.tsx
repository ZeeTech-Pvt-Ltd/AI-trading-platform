import type { Metadata } from 'next';
import { ogDefault } from '@/lib/seo';
import { site } from '@/lib/site';
import { getTypePages } from '@/lib/data';
import Archive from '@/components/Archive';
import ArchiveReviewsPromo from '@/components/ArchiveReviewsPromo';

export const metadata: Metadata = {
  title: 'Bitcoin Development Articles | AI Trading Platform',
  description: `In-depth Bitcoin development and technical articles on ${site.name}: protocol, Bitcoin Core, transaction fees and the open-source ecosystem.`,
  alternates: { canonical: '/articles' },
  openGraph: {
    type: 'website',
    images: ogDefault,
    title: 'Bitcoin Development Articles | AI Trading Platform',
    description: `In-depth Bitcoin development and technical articles on ${site.name}: protocol, Bitcoin Core, transaction fees and the open-source ecosystem.`,
    url: `${site.url}/articles`,
  },
};

export default function ArticlesPage() {
  const pages = getTypePages('bitcoin');
  return (
    <Archive
      cards={pages[0] ?? []}
      kicker="Articles"
      title="Bitcoin Articles"
      description="Deep technical writing on Bitcoin Core development, protocol, and the open-source ecosystem."
      current={1}
      total={pages.length}
      base="/articles"
      columns={3}
      extra={<ArchiveReviewsPromo />}
    />
  );
}
