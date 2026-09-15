const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/**
 * Short verdict label derived from the score itself, using the same bands
 * published on /how-we-review (4.5+, 3.5-4.4, below 3.5). Mechanical, not an
 * independent editorial claim — no per-platform wording is invented here.
 */
/** Platform name = the part of a review title before "Review". Falls back to the full title. */
export function brandName(title: string): string {
  const m = title.match(/^(.*?)\s+Review\b/i);
  return m ? m[1].trim() : title.trim();
}

export function ratingVerdict(ratingValue?: string): { label: string; tone: 'ok' | 'mid' | 'bad' } {
  const n = ratingValue ? Number.parseFloat(ratingValue) : NaN;
  if (Number.isNaN(n)) return { label: 'Unrated', tone: 'mid' };
  if (n >= 4.5) return { label: 'Recommended', tone: 'ok' };
  if (n >= 3.5) return { label: 'Worth Considering', tone: 'mid' };
  return { label: 'Caution', tone: 'bad' };
}
