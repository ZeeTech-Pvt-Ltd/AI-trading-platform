import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import { site } from '@/lib/site';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import './globals.css';

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lora',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: '%s',
  },
  description: site.description,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: site.name,
    description: site.description,
    images: [
      {
        url: `${site.url}/images/2026/07/og-default.png`,
        width: 1200,
        height: 630,
        alt: site.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.description,
    images: [`${site.url}/images/2026/07/og-default.png`],
  },
  alternates: {
    types: {
      'application/rss+xml': `${site.url}/feed.xml`,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className={`${lora.variable} ${inter.variable}`}>
      <body>
        <div id="page" className="lucky-site">
          <Header />
          <div id="content" className="lucky-site-content">
            {children}
          </div>
          <Footer />
        </div>
        <JsonLd
          data={JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: site.name,
            url: site.url,
            logo: `${site.url}${site.logo}`,
            sameAs: [site.twitter],
          })}
        />
        <JsonLd
          data={JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': `${site.url}/#website`,
            url: site.url,
            name: site.name,
            inLanguage: 'en',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${site.url}/search?q={search_term_string}`,
              },
              'query-input': 'required name=search_term_string',
            },
          })}
        />
      </body>
    </html>
  );
}
