import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPostSlugs, getPost } from '@/lib/data';
import { postMetadata } from '@/lib/seo';
import ArticlePage from '@/components/ArticlePage';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPostSlugs('trading').map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost('trading', slug);
  if (!post) return { title: 'Not Found' };
  return postMetadata(post);
}

export default async function TradingPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost('trading', slug);
  if (!post) notFound();
  return <ArticlePage post={post} />;
}
