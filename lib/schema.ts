/**
 * Post-process baked JSON-LD from the content files to add signals the scrape
 * pipeline doesn't emit yet. Applied at render time (SSG) so nothing is
 * fabricated: `dateModified` falls back to the real publish date until an
 * actual modified date is supplied in the content.
 */
export function enrichJsonLd(jsonLd: string, dateModified?: string): string {
  try {
    const parsed = JSON.parse(jsonLd);
    walk(parsed, dateModified);
    return JSON.stringify(parsed);
  } catch {
    return jsonLd;
  }
}

function walk(value: unknown, dateModified?: string): void {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, dateModified);
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

  for (const key of Object.keys(node)) walk(node[key], dateModified);
}
