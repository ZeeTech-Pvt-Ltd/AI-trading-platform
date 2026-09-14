export default function InfoPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main id="primary" className="lucky-site-main btt-single">
      <article className="btt-article">
        <div className="btt-article__inner">
          <header className="btt-article__header">
            <h1 className="btt-article__title">{title}</h1>
            {subtitle ? (
              <p className="btt-archive__desc" style={{ marginTop: 12 }}>
                {subtitle}
              </p>
            ) : null}
          </header>
          <div className="btt-article__content lucky-entry-content">{children}</div>
        </div>
      </article>
    </main>
  );
}
