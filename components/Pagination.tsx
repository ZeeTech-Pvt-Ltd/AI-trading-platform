import Link from 'next/link';

function pageUrl(base: string, page: number): string {
  return page <= 1 ? base : `${base}/page/${page}`;
}

function pageList(current: number, total: number): (number | 'dots')[] {
  const wanted = new Set<number>(
    [1, total, current - 1, current, current + 1].filter((n) => n >= 1 && n <= total),
  );
  const sorted = [...wanted].sort((a, b) => a - b);
  const out: (number | 'dots')[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (prev && n - prev > 1) out.push('dots');
    out.push(n);
    prev = n;
  }
  return out;
}

export default function Pagination({
  current,
  total,
  base,
}: {
  current: number;
  total: number;
  base: string;
}) {
  if (total <= 1) return null;

  return (
    <nav className="lucky-pagination-nav btt-pagination" aria-label="Posts">
      <div className="nav-links">
        {current > 1 ? (
          <Link className="prev page-numbers" href={pageUrl(base, current - 1)}>
            Previous
          </Link>
        ) : null}

        {pageList(current, total).map((item, i) =>
          item === 'dots' ? (
            <span key={`d-${i}`} className="page-numbers dots">
              …
            </span>
          ) : item === current ? (
            <span key={item} aria-current="page" className="page-numbers current">
              {item}
            </span>
          ) : (
            <Link key={item} className="page-numbers" href={pageUrl(base, item)}>
              {item}
            </Link>
          ),
        )}

        {current < total ? (
          <Link className="next page-numbers" href={pageUrl(base, current + 1)}>
            Next
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
