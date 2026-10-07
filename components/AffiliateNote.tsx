import Link from 'next/link';

/**
 * Advertising disclosure shown next to affiliate calls to action.
 * `compact` is the one-line version used under a button.
 */
export default function AffiliateNote({ name, compact }: { name?: string; compact?: boolean }) {
  if (compact) {
    return (
      <p className="btt-affnote btt-affnote--compact">
        Partner link. We may earn a commission.{' '}
        <Link href="/affiliate-disclosure">Disclosure</Link>
      </p>
    );
  }
  return (
    <p className="btt-affnote">
      <strong>Advertising disclosure:</strong> links on this page are partner links, and we may earn a
      commission if you register through them. They may lead to a partner broker rather than{' '}
      {name ? `${name}\u2019s` : 'the platform\u2019s'} own website.{' '}
      <Link href="/affiliate-disclosure">Read our full disclosure</Link>.
    </p>
  );
}
