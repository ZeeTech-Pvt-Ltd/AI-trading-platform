import type { Metadata } from 'next';
import { site } from '@/lib/site';
import InfoPage from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'How We Review Trading Platforms',
  description: `The methodology and criteria ${site.name} uses to rate AI and crypto trading platforms.`,
  alternates: { canonical: '/how-we-review' },
};

export default function HowWeReviewPage() {
  return (
    <InfoPage
      title="How We Review Trading Platforms"
      subtitle="Our methodology, rating criteria, and process — so you can trust the verdict."
    >
      <p>
        Every platform we cover is assessed against the same six criteria. We score each on a
        1&ndash;5 scale, then combine them into a single overall rating. This keeps reviews
        comparable across platforms and prevents any single feature from skewing the verdict.
      </p>

      <h2>Our rating criteria</h2>
      <ul>
        <li>
          <strong>Regulation &amp; licensing (25%).</strong> Is the platform registered or
          regulated anywhere, and can that be verified? Unregulated claims are treated as a
          serious risk.
        </li>
        <li>
          <strong>Security (20%).</strong> Encryption, custody, two-factor authentication, and
          history of breaches or scams.
        </li>
        <li>
          <strong>Fees &amp; costs (15%).</strong> Deposit minimums, trading fees, spreads,
          withdrawal costs, and any hidden charges.
        </li>
        <li>
          <strong>Ease of use (15%).</strong> Onboarding, interface clarity, and the quality of
          the demo account where one exists.
        </li>
        <li>
          <strong>Markets &amp; features (15%).</strong> Supported assets, automation quality,
          and any genuinely useful tooling.
        </li>
        <li>
          <strong>Customer support (10%).</strong> Availability, responsiveness, and whether
          users can actually reach a human.
        </li>
      </ul>

      <h2>How we test</h2>
      <p>
        Where possible, we open a demo account and walk through the same steps a real user
        would: registration, verification, funding, and a practice trade. We also cross-check
        the platform&rsquo;s public claims against its own terms, regulator registers, and user
        reports. Anything we cannot verify is stated as unverified rather than treated as fact.
      </p>

      <h2>What our ratings mean</h2>
      <ul>
        <li>
          <strong>4.5&ndash;5.0</strong> — Strong overall; transparent and worth considering.
        </li>
        <li>
          <strong>3.5&ndash;4.4</strong> — Has real strengths and notable trade-offs.
        </li>
        <li>
          <strong>Below 3.5</strong> — Significant concerns; approach with caution.
        </li>
      </ul>

      <h2>Keeping reviews current</h2>
      <p>
        Platforms change fees, ownership, and regulation frequently. We re-check reviews on an
        ongoing basis and update them when facts change. Each review shows its last-updated
        date so you can judge how recent the information is.
      </p>
    </InfoPage>
  );
}
