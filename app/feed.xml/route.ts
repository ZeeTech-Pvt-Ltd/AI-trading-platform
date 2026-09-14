import { site } from '@/lib/site';
import { getAllCards } from '@/lib/data';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET() {
  const items = getAllCards()
    .slice(0, 20)
    .map((c) => {
      const link = `${site.url}/${c.type}/${c.slug}`;
      const pubDate = c.date ? new Date(c.date).toUTCString() : '';
      return [
        '    <item>',
        `      <title>${escapeXml(c.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        pubDate ? `      <pubDate>${pubDate}</pubDate>` : '',
        `      <description>${escapeXml(c.excerpt)}</description>`,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(site.name)}</title>
  <link>${site.url}</link>
  <description>${escapeXml(site.description)}</description>
  <language>en-US</language>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
