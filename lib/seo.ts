import type { Metadata } from 'next';
import type { Post } from './data';
import { site } from './site';

// Google truncates SERP titles around ~60 characters. Appending the brand
// suffix to an already-long review title pushes the platform name itself
// out of view, so drop the suffix rather than let it eat the truncation.
const TITLE_MAX = 60;

export function postMetadata(post: Post): Metadata {
  const url = `${site.url}/${post.type}/${post.slug}`;
  const description = post.description || undefined;
  const titleWithBrand = `${post.title} | ${site.name}`;
  const title = titleWithBrand.length <= TITLE_MAX ? titleWithBrand : post.title;

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
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      locale: site.locale,
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
