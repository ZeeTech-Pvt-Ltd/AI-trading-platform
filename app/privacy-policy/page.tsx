import type { Metadata } from 'next';
import { site } from '@/lib/site';
import InfoPage from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${site.name} collects, uses, and protects your information.`,
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <InfoPage title="Privacy Policy" subtitle="Last updated: September 14, 2026" wide>
      <p>
        This policy explains what information {site.name} collects when you use this website,
        how we use it, and the choices you have.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Usage data.</strong> Standard server logs and analytics (such as pages viewed,
          approximate location, browser and device type, and referral source) collected
          automatically.
        </li>
        <li>
          <strong>Contact information.</strong> If you email us or use a contact form, we receive
          the information you choose to send (for example, your name and email address).
        </li>
        <li>
          <strong>Cookies.</strong> We may use cookies and similar technologies for analytics
          and basic site functionality.
        </li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>To operate, improve, and secure the website.</li>
        <li>To understand how the site is used (analytics).</li>
        <li>To respond to enquiries you send us.</li>
      </ul>

      <h2>Third parties</h2>
      <p>
        We may use third-party services (such as analytics providers) that process data on our
        behalf. We do not sell your personal information. Links to third-party platforms are
        governed by those platforms&rsquo; own privacy policies.
      </p>

      <h2>Your choices</h2>
      <p>
        You can control or delete cookies through your browser settings. You may request access
        to, correction of, or deletion of personal information we hold about you by contacting
        us below.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Email us at{' '}
        <a href="mailto:contact@ai-trading-platform.com">contact@ai-trading-platform.com</a> or
        use our <a href="/contact">contact page</a>.
      </p>
    </InfoPage>
  );
}
