import type { Metadata } from 'next';
import { site } from '@/lib/site';
import InfoPage from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'Contact Us — AI Trading Platform',
  description: `Get in touch with the ${site.name} team by email for corrections, feedback, press enquiries, or questions about our trading platform reviews.`,
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Us — AI Trading Platform',
    description: `Get in touch with the ${site.name} team by email for corrections, feedback, press enquiries, or questions about our trading platform reviews.`,
    url: `${site.url}/contact`,
  },
};

export default function ContactPage() {
  return (
    <InfoPage title="Contact Us" subtitle="We read every message.">
      <p>
        The fastest way to reach us is by email at{' '}
        <a href="mailto:contact@ai-trading-platform.com">contact@ai-trading-platform.com</a>.
        We typically respond within two business days.
      </p>

      <h2>What to contact us about</h2>
      <ul>
        <li>
          <strong>Corrections or updates.</strong> Spotted an error, or has a platform changed
          its fees or regulation? Tell us and we&rsquo;ll verify and update the review.
        </li>
        <li>
          <strong>Review requests.</strong> Want us to review a specific platform? Let us know —
          we cannot promise coverage or a particular outcome, but we consider every request.
        </li>
        <li>
          <strong>Privacy.</strong> For data-access or deletion requests, see our{' '}
          <a href="/privacy-policy">privacy policy</a>.
        </li>
      </ul>

      <h2>A note to platforms</h2>
      <p>
        If you represent a platform we have reviewed and believe something is inaccurate, email
        us with supporting evidence (for example, regulator registrations or official fee
        schedules). We review such requests on their merits, and we do not change ratings in
        exchange for payment.
      </p>
    </InfoPage>
  );
}
