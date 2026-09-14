import type { Metadata } from 'next';
import type { Post } from './data';
import { site } from './site';

export function postMetadata(post: Post): Metadata {
  const url = `${site.url}/${post.type}/${post.slug}`;
  const description = post.description || undefined;
  const ogImage = post.ogImage
    ? post.ogImage.startsWith('http')
      ? post.ogImage
      : `${site.url}${post.ogImage}`
    : `${site.url}/images/2026/07/og-default.png`;

  const image = { url: ogImage, width: 1200, height: 630, alt: post.title };

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url,
      siteName: site.name,
      title: post.title,
      description,
      publishedTime: post.date || undefined,
      ...(post.author ? { authors: [post.author] } : {}),
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [ogImage],
    },
    other: post.date ? { 'article:published_time': post.date } : undefined,
  };
}
