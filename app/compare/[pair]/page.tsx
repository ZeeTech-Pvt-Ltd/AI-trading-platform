import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { site } from '@/lib/site';
import { getCompareSides, getSamplePairs } from '@/lib/compare';
import ComparePage from '@/components/ComparePage';

export const dynamicParams = true;

export function generateStaticParams() {
  return getSamplePairs().map((pair) => ({ pair }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pair: string }>;
}): Promise<Metadata> {
  const { pair } = await params;
  const sides = getCompareSides(pair);
  if (!sides) return { title: 'Comparison not found' };
  const [a, b] = sides;
  const title = `${a.name} vs ${b.name}: Which Should You Choose?`;
  const description = `We compare ${a.name} and ${b.name} side by side — minimum deposit, demo account, support, strengths and weaknesses — so you can decide which automated trading platform fits.`;
  return {
    title,
    description,
    alternates: { canonical: `${site.url}/compare/${pair}` },
    openGraph: {
      title,
      description,
      url: `${site.url}/compare/${pair}`,
      type: 'article',
      images: [
        {
          url: `${site.url}/images/2026/07/og-default.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ pair: string }>;
}) {
  const { pair } = await params;
  const sides = getCompareSides(pair);
  if (!sides) notFound();
  return <ComparePage a={sides[0]} b={sides[1]} />;
}
