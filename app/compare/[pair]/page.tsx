import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { site } from '@/lib/site';
import {
  canonicalPair,
  getCompareSides,
  getSamplePairs,
  isIndexablePair,
  legacyPair,
} from '@/lib/compare';
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
  const titleOptions = [
    `${a.name} vs ${b.name}: Which Should You Choose?`,
    `${a.name} vs ${b.name}: Which Is Better?`,
    `${a.name} vs ${b.name} Compared`,
    `${a.name} vs ${b.name}`,
  ];
  const title = titleOptions.find((t) => t.length <= 60) ?? titleOptions[titleOptions.length - 1];
  const descOptions = [
    `We compare ${a.name} and ${b.name} side by side: minimum deposit, demo account, support, strengths and weaknesses.`,
    `${a.name} vs ${b.name} side by side: minimum deposit, demo account, support, strengths and weaknesses compared.`,
    `${a.name} vs ${b.name}: minimum deposit, demo account, support, strengths and weaknesses.`,
    `${a.name} vs ${b.name}: deposit, support, strengths and weaknesses compared.`,
  ];
  const description =
    descOptions.find((d) => d.length >= 125 && d.length <= 155) ??
    descOptions.find((d) => d.length <= 155) ??
    descOptions[descOptions.length - 1];
  return {
    title,
    description,
    alternates: { canonical: `${site.url}/compare/${canonicalPair(pair) ?? pair}` },
    robots: isIndexablePair(pair) ? undefined : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: `${site.url}/compare/${canonicalPair(pair) ?? pair}`,
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
  const renamed = legacyPair(pair);
  if (renamed) permanentRedirect(`/compare/${renamed}`);
  const sides = getCompareSides(pair);
  if (!sides) notFound();
  return <ComparePage a={sides[0]} b={sides[1]} />;
}
