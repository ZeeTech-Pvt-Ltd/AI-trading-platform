import { NextResponse } from 'next/server';
import { getAllCards } from '@/lib/data';

export const dynamic = 'force-dynamic';

type Result = {
  type: 'trading' | 'bitcoin';
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  authorSlug: string;
  date: string;
  readingTime: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') ?? '').trim().toLowerCase();

  if (q.length < 2) {
    return NextResponse.json({ query: q, results: [] });
  }

  const terms = q.split(/\s+/).filter(Boolean);
  const cards = getAllCards();
  const scored: { score: number; item: Result }[] = [];

  for (const c of cards) {
    const title = c.title.toLowerCase();
    const excerpt = c.excerpt.toLowerCase();
    const author = c.author.toLowerCase();

    if (!terms.every((t) => `${c.title} ${c.excerpt} ${c.author}`.toLowerCase().includes(t))) {
      continue;
    }

    let score = 0;
    for (const t of terms) {
      if (title.includes(t)) score += 3;
      if (c.author.toLowerCase().includes(t)) score += 2;
      if (excerpt.includes(t)) score += 1;
    }

    scored.push({
      score,
      item: {
        type: c.type,
        slug: c.slug,
        title: c.title,
        excerpt: c.excerpt,
        author: c.author,
        authorSlug: c.authorSlug,
        date: c.date,
        readingTime: c.readingTime,
      },
    });

    // Cheap early cap after we've collected enough high-quality matches.
    if (scored.length >= 80) break;
  }

  scored.sort((a, b) => b.score - a.score);

  return NextResponse.json({
    query: q,
    results: scored.slice(0, 20).map((s) => s.item),
  });
}
