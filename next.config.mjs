import fs from 'node:fs';

// Reviews whose slug was corrected (accented letters used to be dropped): old -> new.
const legacySlugs = JSON.parse(
  fs.readFileSync(new URL('./content/legacy-slugs.json', import.meta.url), 'utf8'),
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,

  // Preserve the old Medium-style author URLs (/@author) via 301s.
  async redirects() {
    return [
      ...Object.entries(legacySlugs).map(([from, to]) => ({
        source: `/trading/${from}`,
        destination: `/trading/${to}`,
        permanent: true,
      })),
      { source: '/@:author', destination: '/author/:author', permanent: true },
      {
        source: '/@:author/page/:page',
        destination: '/author/:author/page/:page',
        permanent: true,
      },
      { source: '/terms', destination: '/terms-of-use', permanent: true },
      {
        source: '/trading/nexora-ai-review',
        destination: '/trading/nexora-ai-platform-review',
        permanent: true,
      },
      {
        source: '/trading/phospherai-review',
        destination: '/trading/phospher-ai-review',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
