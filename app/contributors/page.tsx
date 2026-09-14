import type { Metadata } from 'next';
import InfoPage from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'Contributors',
  alternates: { canonical: '/contributors' },
};

export default function ContributorsPage() {
  return (
    <InfoPage title="Contributors">
      <p>Content to be written.</p>
    </InfoPage>
  );
}
