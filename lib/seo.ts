import type { Metadata } from 'next';
import type { Post } from './data';
import { site } from './site';

// Google truncates SERP titles around ~60 characters. Appending the brand
// suffix to an already-long review title pushes the platform name itself
// out of view, so drop the suffix rather than let it eat the truncation.
const TITLE_MAX = 60;

/** Default share image for pages that have no image of their own. */
export const ogDefault = [
  {
    url: `${site.url}/images/2026/07/og-default.png`,
    width: 1200,
    height: 630,
    alt: site.name,
  },
];

/** Locale for a post page: English (default) or Danish. Danish pages live under /da. */
export type PostLocale = 'en' | 'da';

export function postMetadata(
  post: Post,
  opts: { locale?: PostLocale; englishSlug?: string; danishSlug?: string } = {},
): Metadata {
  const locale: PostLocale = opts.locale ?? 'en';
  const prefix = locale === 'da' ? '/da' : '';
  const url = `${site.url}${prefix}/${post.type}/${post.slug}`;
  // hreflang pairs: only emitted when both language versions exist.
  const languages: Record<string, string> = {};
  if (opts.englishSlug && locale === 'da') {
    languages['en-GB'] = `${site.url}/${post.type}/${opts.englishSlug}`;
    languages['da-DK'] = url;
    languages['x-default'] = `${site.url}/${post.type}/${opts.englishSlug}`;
  } else if (opts.danishSlug && locale === 'en') {
    languages['en-GB'] = url;
    languages['da-DK'] = `${site.url}/da/${post.type}/${opts.danishSlug}`;
    languages['x-default'] = url;
  }
  const description = post.description || undefined;
  const base = post.seoTitle || post.title;
  const titleWithBrand = `${base} | ${site.name}`;
  const title = titleWithBrand.length <= TITLE_MAX ? titleWithBrand : base;

  // A real, curated image wins when one is set on the post. Otherwise leave
  // `images` unset so the route's opengraph-image.tsx (a generated image
  // built from the post's own title/rating) applies automatically instead
  // of every post sharing the one generic site-wide default.
  const customImage = post.ogImage
    ? {
        url: post.ogImage.startsWith('http') ? post.ogImage : `${site.url}${post.ogImage}`,
        width: 1200,
        height: 630,
        alt: post.title,
      }
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      ...(Object.keys(languages).length ? { languages } : {}),
    },
    openGraph: {
      type: 'article',
      locale: locale === 'da' ? 'da_DK' : site.locale,
      url,
      siteName: site.name,
      title: post.title,
      description,
      publishedTime: post.date || undefined,
      modifiedTime: post.dateModified || post.date || undefined,
      ...(post.author ? { authors: [post.author] } : {}),
      ...(customImage ? { images: [customImage] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      ...(customImage ? { images: [customImage.url] } : {}),
    },
    other: post.date
      ? {
          'article:published_time': post.date,
          'article:modified_time': post.dateModified || post.date,
        }
      : undefined,
  };
}
