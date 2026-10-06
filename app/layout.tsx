import type { Metadata } from 'next';
import Script from 'next/script';
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
  verification: {
    google: 'znb9VHSilk0tpuBhwCkibH75Z7qik86PAAbTe0NKUUw',
  },
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
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />
        {/* Google Analytics 4 (gtag.js), placed in <head> as Google recommends. The inline part
            defines gtag() immediately, so events such as CTA clicks are queued even before
            gtag.js has finished loading. */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3Z5WCJNG8C" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-3Z5WCJNG8C');`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
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
            '@id': `${site.url}/#organization`,
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
        <Script id="clarity-init" strategy="lazyOnload">
          {`(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "yj84eha58u");`}
        </Script>
      </body>
    </html>
  );
}
