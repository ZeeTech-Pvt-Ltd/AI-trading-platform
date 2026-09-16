import Link from 'next/link';
import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { getAuthors } from '@/lib/data';

export const metadata: Metadata = {
  title: `Authors — ${site.name}`,
  description: `Meet the team behind ${site.name} — the people who research and write our reviews and guides.`,
  alternates: { canonical: '/authors' },
  robots: { index: false, follow: true },
  openGraph: {
    title: `Authors — ${site.name}`,
    description: `Meet the team behind ${site.name} — the people who research and write our reviews and guides.`,
    url: `${site.url}/authors`,
  },
};

export default function AuthorsPage() {
  const authors = Object.values(getAuthors())
    .map((a) => ({ ...a, count: a.pages.reduce((sum, p) => sum + p.length, 0) }))
    .sort((a, b) => b.count - a.count);

  return (
    <main id="primary" className="lucky-site-main btt-single">
      <div className="lucky-container btt-authors-page">
        <header className="btt-article__header">
          <h1 className="btt-article__title">Authors</h1>
          <p className="btt-archive__desc" style={{ marginTop: 12 }}>
            The team behind {site.name}&rsquo;s independent reviews and guides.
          </p>
        </header>

        <ul className="btt-authors">
          {authors.map((a) => (
            <li key={a.slug}>
              <Link className="btt-author-card" href={`/author/${a.slug}`}>
                {a.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt=""
                    src={a.avatar}
                    className="avatar avatar-120 photo"
                    height="120"
                    width="120"
                    decoding="async"
                  />
                ) : null}
                <span className="btt-author-card__name">{a.name}</span>
                <span className="btt-author-card__count">{a.count} articles</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
