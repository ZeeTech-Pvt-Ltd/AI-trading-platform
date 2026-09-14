import { getAllCards } from './data';
import type { Card } from './data';

/**
 * Server-side search over review/article cards, shared by the search API and
 * the /search results page. Matches all terms against title, excerpt and
 * author, then ranks by where the match falls.
 */
export function searchCards(query: string, limit = 20): Card[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const scored: { score: number; card: Card }[] = [];

  for (const card of getAllCards()) {
    const hay = `${card.title} ${card.excerpt} ${card.author}`.toLowerCase();
    if (!terms.every((t) => hay.includes(t))) continue;

    const title = card.title.toLowerCase();
    const author = card.author.toLowerCase();
    const excerpt = card.excerpt.toLowerCase();

    let score = 0;
    for (const t of terms) {
      if (title.includes(t)) score += 3;
      if (author.includes(t)) score += 2;
      if (excerpt.includes(t)) score += 1;
    }

    scored.push({ score, card });
    if (scored.length >= 80) break;
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.card);
}
