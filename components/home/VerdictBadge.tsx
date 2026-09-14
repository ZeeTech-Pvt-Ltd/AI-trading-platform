import type { Verdict } from '@/lib/data';

const LABELS: Record<Verdict, string> = {
  safe: 'Safe',
  warn: 'Caution',
  risk: 'High risk',
  na: 'Reviewed',
};

/**
 * Tinted verdict badge. Background and text use the verdict tokens, with a
 * 1px solid border in the token's solid colour — never a saturated fill.
 * A text label is always present so the state reads without colour.
 */
export default function VerdictBadge({ verdict }: { verdict?: Verdict }) {
  const v = verdict ?? 'na';
  return <span className={`verdict-badge verdict-badge--${v}`}>{LABELS[v]}</span>;
}
