import type { Metadata } from 'next';
import { site } from '@/lib/site';
import InfoPage from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'Disclaimer | AI Trading Platform',
  description: `${site.name} disclaimer: all content is for information only, not financial advice, and crypto and automated trading involve substantial risk of loss.`,
  alternates: { canonical: '/disclaimer' },
  openGraph: {
    title: 'Disclaimer | AI Trading Platform',
    description: `${site.name} disclaimer: all content is for information only, not financial advice, and crypto and automated trading involve substantial risk of loss.`,
    url: `${site.url}/disclaimer`,
  },
};

export default function DisclaimerPage() {
  return (
    <InfoPage
      title="Disclaimer"
      subtitle="Please read this before acting on anything you see here."
      wide
    >
      <h2>Not financial advice</h2>
      <p>
        All content on {site.name}, including reviews, ratings, articles, and comparisons, is
        provided for general information and education only. It is <strong>not</strong>{' '}
        financial, investment, legal, or tax advice, and it is not a recommendation to buy,
        sell, or hold any asset or to use any platform.
      </p>

      <h2>Trading is risky</h2>
      <p>
        Cryptocurrency and automated trading involve substantial risk, including the risk of
        losing some or all of your money. Prices are highly volatile. Leveraged trading can
        amplify losses. Past performance, including any performance claims made by platforms we
        review, is not a guarantee of future results.
      </p>

      <h2>Do your own research</h2>
      <p>
        Always conduct your own due diligence and, where appropriate, consult a licensed
        financial professional before making any investment decision. Never deposit money you
        cannot afford to lose.
      </p>

      <h2>No guarantees</h2>
      <p>
        We work hard to keep our information accurate and current, but platforms change quickly
        and we cannot guarantee that everything on this site is complete, accurate, or
        up-to-date at all times. Information is provided &ldquo;as is&rdquo; without warranty of
        any kind.
      </p>

      <h2>Liability</h2>
      <p>
        To the maximum extent permitted by law, {site.name} and its authors accept no liability
        for any loss or damage arising from your use of this site or from any decision made in
        reliance on its content.
      </p>
    </InfoPage>
  );
}
