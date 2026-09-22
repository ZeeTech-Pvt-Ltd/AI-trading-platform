import type { Metadata } from 'next';
import { site } from '@/lib/site';
import BestOfPage from '@/components/BestOfPage';

const title = 'Best AI Trading Platforms 2026: Ranked & Reviewed';
const description =
  'We ranked the top 10 AI trading platforms for 2026 by onboarding, demo quality, transparency and risk controls. See which ones are worth your deposit, and which to avoid.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${site.url}/best-ai-trading-platforms` },
  openGraph: {
    title,
    description,
    url: `${site.url}/best-ai-trading-platforms`,
    type: 'website',
    images: [
      {
        url: `${site.url}/images/2026/07/og-default.png`,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
};

export default function Page() {
  return (
    <BestOfPage
      title={title}
      subtitle="We tested the onboarding, demo accounts, fee transparency and risk controls of the leading automated trading platforms. Here is how they stack up in 2026."
      description={description}
    />
  );
}
