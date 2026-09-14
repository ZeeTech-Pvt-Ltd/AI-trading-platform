import type { Metadata } from 'next';
import { site } from '@/lib/site';
import HomePage from '@/components/home/HomePage';

export const metadata: Metadata = {
  title: 'AI Trading Platform — Independent AI & Crypto Trading Platform Reviews',
  alternates: { canonical: site.url },
  openGraph: {
    title: 'AI Trading Platform — Independent AI & Crypto Trading Platform Reviews',
  },
};

export default function Page() {
  return <HomePage />;
}
