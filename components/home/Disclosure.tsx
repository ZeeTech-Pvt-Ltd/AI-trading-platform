import Link from 'next/link';
import Section from './Section';

/**
 * Permanent disclosure strip that sits above the hero (and the H1).
 * One sentence on our independence, linking to the disclosure and
 * methodology pages. Server-rendered; not a dismissible notice.
 */
export default function Disclosure() {
  return (
    <Section id="disclosure" className="home-section--disclosure">
      <p className="home-disclosure">
        We independently review AI and crypto trading platforms — read our{' '}
        <Link href="/affiliate-disclosure">advertising disclosure</Link> and{' '}
        <Link href="/how-we-review">review methodology</Link>.
      </p>
    </Section>
  );
}
