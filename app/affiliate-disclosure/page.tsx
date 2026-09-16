import type { Metadata } from 'next';
import { site } from '@/lib/site';
import InfoPage from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure — AI Trading Platform',
  description: `How ${site.name} earns money through affiliate links, and how that does — and does not — affect our independent AI and crypto trading platform reviews.`,
  alternates: { canonical: '/affiliate-disclosure' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Affiliate Disclosure — AI Trading Platform',
    description: `How ${site.name} earns money through affiliate links, and how that does — and does not — affect our independent AI and crypto trading platform reviews.`,
    url: `${site.url}/affiliate-disclosure`,
  },
};

export default function AffiliateDisclosurePage() {
  return (
    <InfoPage
      title="Affiliate Disclosure"
      subtitle="Transparency about how this site earns money."
      wide
    >
      <p>
        {site.name} is free to read, but it is not free to run. To cover our costs, we may earn
        a commission when you visit a platform through one of our links and sign up or make a
        deposit. This is known as affiliate marketing.
      </p>

      <h2>How this affects our reviews</h2>
      <p>
        It doesn&rsquo;t. Our editorial team decides what we review, how we rate it, and what
        our verdict is, independently of any commercial relationship. We do not accept payment
        for a review, rating, or placement, and a platform cannot buy a better score.
      </p>

      <h2>How you can tell</h2>
      <p>
        Outbound links to platforms are marked with{' '}
        <code>rel=&quot;sponsored nofollow&quot;</code> and generally open in a new tab. This
        tells search engines that the link is a paid relationship and does not pass ranking
        credit. It also tells you, our reader, exactly which links may earn us a commission.
      </p>

      <h2>Why we recommend against some platforms</h2>
      <p>
        We publish critical reviews of platforms we would not use ourselves. Where a platform
        has no verifiable regulation, makes implausible return claims, or shows signs of
        operating as a scam, we say so plainly, regardless of whether an affiliate program
        exists.
      </p>

      <p>
        If you have questions about how we earn money, reach out through our{' '}
        <a href="/contact">contact page</a>.
      </p>
    </InfoPage>
  );
}
