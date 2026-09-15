import type { Metadata } from 'next';
import { site } from '@/lib/site';
import InfoPage from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'Terms of Service — AI Trading Platform',
  description: `The terms governing your use of ${site.name}, including acceptable use, intellectual property, and limitation of liability.`,
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terms of Service — AI Trading Platform',
    description: `The terms governing your use of ${site.name}, including acceptable use, intellectual property, and limitation of liability.`,
    url: `${site.url}/terms`,
  },
};

export default function TermsPage() {
  return (
    <InfoPage title="Terms of Service" subtitle="Last updated: September 14, 2026" wide>
      <p>
        By accessing {site.name}, you agree to these Terms of Service. If you do not agree,
        please do not use the site.
      </p>

      <h2>Use of the site</h2>
      <p>
        You may use this site for personal, non-commercial purposes. You agree not to misuse the
        site, attempt to disrupt it, or scrape or republish its content at scale without
        permission.
      </p>

      <h2>Intellectual property</h2>
      <p>
        Unless otherwise stated, all content on this site, including text, ratings, structure, and
        design, is owned by or licensed to {site.name} and is protected by copyright. You may
        quote brief excerpts with attribution and a link back to the source.
      </p>

      <h2>No investment advice</h2>
      <p>
        Content on this site is informational only and does not constitute financial,
        investment, legal, or tax advice. See our <a href="/disclaimer">disclaimer</a>.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        The site is provided &ldquo;as is.&rdquo; To the maximum extent permitted by law,
        {site.name} is not liable for any direct, indirect, incidental, or consequential loss
        arising from your use of the site or reliance on its content.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time. Continued use of the site after changes
        constitutes acceptance of the updated terms.
      </p>
    </InfoPage>
  );
}
