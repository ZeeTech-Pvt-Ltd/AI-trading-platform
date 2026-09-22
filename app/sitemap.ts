import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { getAllCards, getAuthors, getTypePages, getLastUpdatedDate } from '@/lib/data';
import { getSamplePairs } from '@/lib/compare';

/** Most recent date (dateModified, falling back to date) among a set of cards. */
function latestOf(cards: { date: string; dateModified?: string }[]): Date | undefined {
  let latest = '';
  for (const c of cards) {
    const d = c.dateModified || c.date;
    if (d && d > latest) latest = d;
  }
  return latest ? new Date(latest) : undefined;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastUpdated = getLastUpdatedDate();
  const homeLastModified = lastUpdated ? new Date(lastUpdated) : undefined;

  // home — a real signal (the most recent post site-wide), not build time.
  const entries: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: homeLastModified, changeFrequency: 'daily', priority: 1 },
  ];

  // trust / informational pages — no reliable "last changed" signal is
  // tracked for these, so lastModified is omitted rather than stamped with
  // build time (a false "just changed" signal on every deploy).
  for (const [path, priority] of [
    ['/about', 0.6],
    ['/how-we-review', 0.6],
    ['/contact', 0.4],
    ['/authors', 0.5],
    ['/affiliate-disclosure', 0.3],
    ['/disclaimer', 0.3],
    ['/privacy-policy', 0.3],
    ['/terms-of-use', 0.3],
    ['/best-ai-trading-platforms', 0.9],
  ] as const) {
    entries.push({
      url: `${site.url}${path}`,
      changeFrequency: 'weekly',
      priority,
    });
  }

  // individual author pages — lastModified from that author's own most
  // recent post, a genuine signal instead of build time.
  const authors = getAuthors();
  for (const [slug, author] of Object.entries(authors)) {
    const cards = author.pages.flat();
    entries.push({
      url: `${site.url}/author/${slug}`,
      lastModified: latestOf(cards),
      changeFrequency: 'weekly',
      priority: 0.5,
    });
  }

  // comparison pages (X vs Y) — no tracked edit history, omit lastModified.
  for (const pair of getSamplePairs()) {
    entries.push({
      url: `${site.url}/compare/${pair}`,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  }

  // category archives (reviews + articles), including numbered pages —
  // each has its own self-canonical and is indexable. lastModified is the
  // most recent post actually listed on that specific page.
  for (const [path, type, priority] of [
    ['/reviews', 'trading', 0.9],
    ['/articles', 'bitcoin', 0.7],
  ] as const) {
    const pages = getTypePages(type);
    entries.push({
      url: `${site.url}${path}`,
      lastModified: latestOf(pages[0] ?? []),
      changeFrequency: 'weekly',
      priority,
    });
    for (let n = 2; n <= pages.length; n++) {
      entries.push({
        url: `${site.url}${path}/page/${n}`,
        lastModified: latestOf(pages[n - 1] ?? []),
        changeFrequency: 'weekly',
        priority: Math.max(priority - 0.2, 0.3),
      });
    }
  }

  // posts (reviews + articles)
  for (const card of getAllCards()) {
    entries.push({
      url: `${site.url}/${card.type}/${card.slug}`,
      lastModified: latestOf([card]),
      changeFrequency: 'monthly',
      priority: card.type === 'trading' ? 0.8 : 0.6,
    });
  }

  return entries;
}
