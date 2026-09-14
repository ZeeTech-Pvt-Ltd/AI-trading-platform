/**
 * Build a table of contents from the h2 headings in a post's HTML,
 * and inject stable anchor ids into those headings so the links resolve.
 *
 * Pure string transform — safe for SSG (no DOM needed).
 */

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface TocResult {
  items: TocItem[];
  html: string;
}

const slugify = (text: string): string => {
  const base =
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section';
  return base;
};

export function buildToc(html: string): TocResult {
  const items: TocItem[] = [];
  const used = new Set<string>();

  const withIds = html.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi, (match, attrs, inner) => {
    const text = inner
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
    if (!text) return match;

    const existing = /(?:^|\s)id\s*=\s*["']([^"']+)["']/i.exec(attrs || '');
    let id: string;
    let tag = match;

    if (existing) {
      id = existing[1];
    } else {
      id = slugify(text);
      let n = 2;
      while (used.has(id)) id = `${slugify(text)}-${n++}`;
      tag = `<h2${attrs ?? ''} id="${id}">${inner}</h2>`;
    }

    used.add(id);
    items.push({ id, text, level: 2 });
    return tag;
  });

  return { items, html: withIds };
}
