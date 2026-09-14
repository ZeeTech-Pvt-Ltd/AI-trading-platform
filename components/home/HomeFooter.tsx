import Link from 'next/link';
import { site } from '@/lib/site';
import { riskWarnings } from '@/lib/risk-warning';
import { operatorEntity } from '@/lib/operator';
import Section from './Section';

/** Footer navigation targets. Two targets (/editorial-policy, /corrections-policy) are still to be built. */
const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Methodology', href: '/how-we-review' },
  { label: 'Advertising Disclosure', href: '/affiliate-disclosure' },
  { label: 'Editorial Policy', href: '/editorial-policy' },
  { label: 'Corrections Policy', href: '/corrections-policy' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy', href: '/privacy-policy' },
  { label: 'Terms', href: '/terms' },
];

type HomeFooterProps = {
  /** Market key for this route ("uk", "au", "eu", "us", …); falls back to "default". */
  market?: string;
};

/**
 * Homepage footer slot: nav links, standing risk warning, operator entity and
 * copyright. The risk warning is looked up per market and falls back to the
 * "default" entry; both the risk wording and the operator entity are left
 * empty until real legal text/details are supplied.
 */
export default function HomeFooter({ market = 'default' }: HomeFooterProps) {
  const warning =
    riskWarnings.find((w) => w.market === market) ??
    riskWarnings.find((w) => w.market === 'default');
  const year = new Date().getFullYear();

  return (
    <Section id="footer" className="home-section--footer">
      <nav className="home-footer__nav" aria-label="Footer">
        <ul className="home-footer__links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      {warning?.text ? (
        <aside className="home-footer__risk">
          <p className="home-footer__riskText">{warning.text}</p>
        </aside>
      ) : null}

      {operatorEntity.companyName ? (
        <p className="home-footer__operator">
          {operatorEntity.companyName}
          {operatorEntity.registrationNumber
            ? ` · Company No. ${operatorEntity.registrationNumber}`
            : ''}
          {operatorEntity.registeredAddress
            ? ` · ${operatorEntity.registeredAddress}`
            : ''}
        </p>
      ) : null}

      <p className="home-footer__copyright">
        &copy; {year} {site.name}.
      </p>
    </Section>
  );
}
