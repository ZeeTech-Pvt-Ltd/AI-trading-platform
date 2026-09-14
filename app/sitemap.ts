import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { getAllCards, getAuthors, getHomePages, getTypePages } from '@/lib/data';
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
    ['/affiliate-disclosure', 0.3],
    ['/disclaimer', 0.3],
    ['/privacy-policy', 0.3],
    ['/terms', 0.3],
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

  // category archives (reviews + articles)
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
    for (let i = 2; i <= getTypePages(type).length; i++) {
      entries.push({
        url: `${site.url}${path}/page/${i}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.3,
      });
    }
  }

  // home pagination
  for (let i = 2; i <= getHomePages().length; i++) {
    entries.push({
      url: `${site.url}/page/${i}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
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

  // authors + author pagination
  for (const [slug, a] of Object.entries(getAuthors())) {
    entries.push({
      url: `${site.url}/author/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.3,
    });
    for (let i = 1; i < a.pages.length; i++) {
      entries.push({
        url: `${site.url}/author/${slug}/page/${i + 1}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.2,
      });
    }
  }

  return entries;
}
