import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { getTypePages } from '@/lib/data';
import Archive from '@/components/Archive';

export const metadata: Metadata = {
  title: 'Bitcoin Articles',
  description: `In-depth Bitcoin development and technical articles on ${site.name}.`,
  alternates: { canonical: '/articles' },
  openGraph: {
    title: 'Bitcoin Articles',
    description: `In-depth Bitcoin development and technical articles on ${site.name}.`,
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
      featured
    />
  );
}
