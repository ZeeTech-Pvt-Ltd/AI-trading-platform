import type { Metadata } from 'next';
import InfoPage from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'High-Risk Platforms',
  alternates: { canonical: '/high-risk' },
};

export default function HighRiskPage() {
  return (
    <InfoPage title="High-Risk Platforms">
      <p>Content to be written.</p>
    </InfoPage>
  );
}
