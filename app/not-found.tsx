import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="primary" className="lucky-site-main">
      <div className="lucky-error-404">
        <p className="lucky-error-404__eyebrow">404</p>
        <h1 className="lucky-error-404__title">Page not found</h1>
        <p className="lucky-error-404__text">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link className="btt-btn btt-btn--outline" href="/">
          Back to home
        </Link>
      </div>
    </main>
  );
}
