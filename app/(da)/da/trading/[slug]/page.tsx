import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllDanishPostSlugs, getDanishPost } from '@/lib/data';
import { postMetadata } from '@/lib/seo';
import ArticlePage from '@/components/ArticlePage';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllDanishPostSlugs('trading').map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getDanishPost('trading', slug) as (import('@/lib/data').Post & { englishSlug?: string }) | null;
  if (!post) return { title: 'Ikke fundet' };
  return postMetadata(post, { locale: 'da', englishSlug: post.englishSlug });
}

export default async function DanishTradingPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getDanishPost('trading', slug);
  if (!post) notFound();
  return <ArticlePage post={post} locale="da" />;
}
