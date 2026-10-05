/**
 * Post-process baked JSON-LD from the content files to add signals the scrape
 * pipeline doesn't emit yet. Applied at render time (SSG) so nothing is
 * fabricated: `dateModified` falls back to the real publish date until an
 * actual modified date is supplied in the content.
 */
export function enrichJsonLd(jsonLd: string, dateModified?: string, articleImage?: string): string {
  try {
    const parsed = JSON.parse(jsonLd);
    walk(parsed, dateModified, articleImage);
    return JSON.stringify(parsed);
  } catch {
    return jsonLd;
  }
}

function walk(value: unknown, dateModified?: string, articleImage?: string): void {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, dateModified, articleImage);
    return;
  }
  if (!value || typeof value !== 'object') return;

  const node = value as Record<string, unknown>;

  // Content is English across multiple markets; drop the US-only locale tag.
  if (typeof node.inLanguage === 'string') {
    node.inLanguage = 'en';
  }

  // Where a publish date exists but no modified date does, record one.
  if (
    typeof node.datePublished === 'string' &&
    node.dateModified === undefined &&
    dateModified
  ) {
    node.dateModified = dateModified;
  }

  // Article image (optional in Google's Article markup): the page's own
  // generated social image, which really exists at this URL.
  if (node['@type'] === 'Article' && node.image === undefined && articleImage) {
    node.image = { '@type': 'ImageObject', url: articleImage, width: 1200, height: 630 };
  }

  for (const key of Object.keys(node)) walk(node[key], dateModified, articleImage);
}
