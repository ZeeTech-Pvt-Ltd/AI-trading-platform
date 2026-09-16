import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { getAllCards } from '@/lib/data';
import { getSamplePairs } from '@/lib/compare';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // home
  const entries: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: now, changeFrequency: 'daily', priority: 1 },
  ];

  // trust / informational pages — legal/utility pages (authors, affiliate
  // disclosure, disclaimer, privacy policy, terms) are noindexed and
  // intentionally left out of the sitemap.
  for (const [path, priority] of [
    ['/about', 0.6],
    ['/how-we-review', 0.6],
    ['/contact', 0.4],
  ] as const) {
    entries.push({
      url: `${site.url}${path}`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority,
    });
  }

  // money page (best-of)
  entries.push({
    url: `${site.url}/best-ai-trading-platforms`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  });

  // comparison pages (X vs Y)
  for (const pair of getSamplePairs()) {
    entries.push({
      url: `${site.url}/compare/${pair}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  }

  // category archives (reviews + articles) — page 1 only; page 2+ is noindexed
  // pagination and intentionally left out of the sitemap.
  for (const [path, priority] of [
    ['/reviews', 0.9],
    ['/articles', 0.7],
  ] as const) {
    entries.push({
      url: `${site.url}${path}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority,
    });
  }

  // posts (reviews + articles)
  for (const card of getAllCards()) {
    entries.push({
      url: `${site.url}/${card.type}/${card.slug}`,
      lastModified: card.dateModified
        ? new Date(card.dateModified)
        : card.date
          ? new Date(card.date)
          : now,
      changeFrequency: 'monthly',
      priority: card.type === 'trading' ? 0.8 : 0.6,
    });
  }

  return entries;
}
