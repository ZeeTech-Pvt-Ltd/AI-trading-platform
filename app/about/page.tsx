import type { Metadata } from 'next';
import { site } from '@/lib/site';
import InfoPage from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'About Us',
  description: `What ${site.name} is, what we cover, and how we stay independent.`,
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <InfoPage
      title="About Us"
      subtitle="Independent, fact-checked reviews of AI and crypto trading platforms."
    >
      <p>
        <strong>{site.name}</strong> exists to answer one question honestly: is a trading
        platform worth your money, or should you stay away? We review AI trading platforms,
        crypto exchanges, and automated trading services — then tell you what&rsquo;s real,
        what to avoid, and how to register safely if you do decide to proceed.
      </p>

      <h2>What we cover</h2>
      <p>
        Our focus is the fast-growing — and frequently misleading — world of automated and
        AI-assisted trading. Every review breaks down a platform&rsquo;s regulation, security,
        fees, ease of use, supported markets, and customer support, and ends with a clear
        verdict and rating.
      </p>

      <h2>How we stay independent</h2>
      <ul>
        <li>
          <strong>No pay-to-play.</strong> A platform cannot buy a positive rating from us.
          We do not accept payment in exchange for a review, rating, or placement.
        </li>
        <li>
          <strong>Editorial independence.</strong> Ratings and verdicts are made by our
          editorial team, independent of any commercial relationship.
        </li>
        <li>
          <strong>Transparency.</strong> When we earn a commission from a link you click, we
          say so — see our{' '}
          <a href="/affiliate-disclosure">affiliate disclosure</a>.
        </li>
        <li>
          <strong>Corrections.</strong> If a review contains an error, we fix it and note the
          update. Tell us via the <a href="/contact">contact page</a>.
        </li>
      </ul>

      <h2>How we make money</h2>
      <p>
        Running a review site costs money. We may receive a commission from some of the
        platforms we review when you sign up through our links. This never changes our
        verdict — we review platforms we recommend against just as rigorously as the ones we
        recommend. Read more in our{' '}
        <a href="/affiliate-disclosure">affiliate disclosure</a>.
      </p>

      <h2>A note on risk</h2>
      <p>
        Trading — especially leveraged or automated crypto trading — carries a high risk of
        loss. Nothing on this site is financial advice. Please read our{' '}
        <a href="/disclaimer">disclaimer</a> before acting on any review.
      </p>
    </InfoPage>
  );
}
