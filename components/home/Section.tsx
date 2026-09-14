import type { ReactNode } from 'react';

type SectionProps = {
  /** Slug used as the section's anchor id (e.g. "recently-reviewed"). */
  id: string;
  /** Optional extra classes for section-specific styling later. */
  className?: string;
  children?: ReactNode;
};

/**
 * Structural wrapper shared by every homepage slot.
 * Applies the section's vertical rhythm and the 1100px content column.
 */
export default function Section({ id, className = '', children }: SectionProps) {
  return (
    <section id={id} className={`home-section${className ? ` ${className}` : ''}`}>
      <div className="home-container">{children}</div>
    </section>
  );
}
