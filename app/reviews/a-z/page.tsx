import Link from 'next/link';
import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { getAllCards } from '@/lib/data';
import { brandName } from '@/lib/format';

export const metadata: Metadata = {
  title: `A–Z List of AI Trading Platforms Reviewed | ${site.name}`,
  description: `Every AI trading platform reviewed on ${site.name}, listed alphabetically by name, with a direct link to its full review.`,
  alternates: { canonical: '/reviews/a-z' },
  openGraph: {
    title: `A–Z List of AI Trading Platforms Reviewed | ${site.name}`,
    description: `Every AI trading platform reviewed on ${site.name}, listed alphabetically by name.`,
    url: `${site.url}/reviews/a-z`,
  },
};

const LETTERS = '0ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function letterOf(name: string): string {
  const ch = name.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(ch) ? ch : '0';
}

export default function AZIndexPage() {
  const cards = getAllCards().filter((c) => c.type === 'trading');

  const entries = cards
    .map((c) => ({ name: brandName(c.title), slug: c.slug }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const groups = new Map<string, { name: string; slug: string }[]>();
  for (const entry of entries) {
    const letter = letterOf(entry.name);
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter)!.push(entry);
  }

  const activeLetters = LETTERS.filter((l) => groups.has(l));

  return (
    <main id="primary" className="lucky-site-main btt-single">
      <div className="btt-archive">
        <div className="btt-archive__inner">
          <span className="btt-archive__kicker">Full Index</span>
          <h1 className="btt-archive__title">A&ndash;Z List of AI Trading Platforms</h1>
          <p className="btt-archive__desc">
            Every platform we&rsquo;ve reviewed, listed alphabetically by name. {entries.length}{' '}
            reviews in total &mdash; jump to a letter or scan the full list below.
          </p>
        </div>
      </div>

      <div className="lucky-container btt-az">
        <nav className="btt-az__jump" aria-label="Jump to letter">
          {activeLetters.map((letter) => (
            <a key={letter} href={`#letter-${letter}`} className="btt-az__jump-link">
              {letter === '0' ? '#' : letter}
            </a>
          ))}
        </nav>

        {activeLetters.map((letter) => (
          <section key={letter} id={`letter-${letter}`} className="btt-az__group">
            <h2 className="btt-az__letter">{letter === '0' ? '#' : letter}</h2>
            <ul className="btt-az__list">
              {groups.get(letter)!.map((entry) => (
                <li key={entry.slug}>
                  <Link href={`/trading/${entry.slug}`}>{entry.name}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
