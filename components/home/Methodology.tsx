import Link from 'next/link';
import { methodologyCriteria } from '@/lib/methodology';
import Section from './Section';

/**
 * Short summary of how we evaluate platforms. The criteria are read from the
 * shared data file (lib/methodology.ts) so this summary and the full
 * methodology page can never drift apart.
 */
export default function Methodology() {
  return (
    <Section id="methodology" className="home-section--methodology">
      <h2 className="home-section__title">How we review</h2>
      {methodologyCriteria.length === 0 ? (
        <p className="methodology__empty">No evaluation criteria defined yet.</p>
      ) : (
        <dl className="methodology__list">
          {methodologyCriteria.map((criterion) => (
            <div key={criterion.label} className="methodology__item">
              <dt className="methodology__label">{criterion.label}</dt>
              <dd className="methodology__description">{criterion.description}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="methodology__more">
        <Link href="/how-we-review">Read our full methodology</Link>
      </p>
    </Section>
  );
}
