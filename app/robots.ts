import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/page/', '/reviews/page/', '/articles/page/', '/author/'],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
