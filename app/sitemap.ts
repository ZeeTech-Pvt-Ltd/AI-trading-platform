import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { getAllCards, getAuthors, getTypePages } from '@/lib/data';
import { getSamplePairs } from '@/lib/compare';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // home
  const entries: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: now, changeFrequency: 'daily', priority: 1 },
  ];

  // trust / informational pages
  for (const [path, priority] of [
    ['/about', 0.6],
    ['/how-we-review', 0.6],
    ['/contact', 0.4],
    ['/authors', 0.5],
    ['/affiliate-disclosure', 0.3],
    ['/disclaimer', 0.3],
    ['/privacy-policy', 0.3],
    ['/terms-of-use', 0.3],
    ['/reviews/a-z', 0.6],
  ] as const) {
    entries.push({
      url: `${site.url}${path}`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority,
    });
  }

  // individual author pages
  for (const slug of Object.keys(getAuthors())) {
    entries.push({
      url: `${site.url}/author/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
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

  // category archives (reviews + articles), including numbered pages —
  // each has its own self-canonical and is indexable.
  for (const [path, type, priority] of [
    ['/reviews', 'trading', 0.9],
    ['/articles', 'bitcoin', 0.7],
  ] as const) {
    entries.push({
      url: `${site.url}${path}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority,
    });
    const pageCount = getTypePages(type).length;
    for (let n = 2; n <= pageCount; n++) {
      entries.push({
        url: `${site.url}${path}/page/${n}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: Math.max(priority - 0.2, 0.3),
      });
    }
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
