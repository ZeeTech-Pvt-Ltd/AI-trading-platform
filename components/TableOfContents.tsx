import type { TocItem } from '@/lib/toc';

export default function TableOfContents({
  items,
  label = 'In this review',
}: {
  items: TocItem[];
  label?: string;
}) {
  if (items.length < 3) return null;

  return (
    <nav className="btt-toc" aria-label="Table of contents">
      <p className="btt-toc__label">{label}</p>
      <ol className="btt-toc__list">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`}>{item.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
