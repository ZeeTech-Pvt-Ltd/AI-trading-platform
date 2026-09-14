import { getAllCards, type Card } from '@/lib/data';
import { formatDate } from '@/lib/format';
import Section from './Section';

type HeroProps = {
  /** H1 headline — placeholder until copy is supplied. */
  title?: string;
  /** One positioning line beneath the headline. */
  positioning?: string;
  /** Explicit "last updated" ISO date; defaults to the most recent review date. */
  updatedAt?: string;
};

/**
 * Most recent review's date across all content, resolved at build time.
 * Prefers a per-review `dateModified` when present; the current content model
 * only carries `date` (publish date), so that is the effective source today.
 */
function latestReviewDate(): string {
  const cards = getAllCards();
  let latest = '';
  for (const card of cards) {
    const modified = (card as Card & { dateModified?: string }).dateModified;
    const d = modified ?? card.date;
    if (d && (!latest || d > latest)) latest = d;
  }
  return latest;
}

/**
 * Above-the-fold hero: serif H1, one positioning line, and a freshness line.
 * No hero image, no background band, no CTA — the search box is the action.
 */
export default function Hero({
  title = '[Headline]',
  positioning = '[Positioning line]',
  updatedAt,
}: HeroProps) {
  const iso = updatedAt ?? latestReviewDate();
  return (
    <Section id="hero" className="home-section--hero">
      <h1 className="home-hero__title">{title}</h1>
      <p className="home-hero__positioning">{positioning}</p>
      {iso ? (
        <p className="home-hero__updated">
          Last updated <time dateTime={iso}>{formatDate(iso)}</time>
        </p>
      ) : null}
    </Section>
  );
}
