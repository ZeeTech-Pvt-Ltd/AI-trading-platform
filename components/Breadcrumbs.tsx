import Link from 'next/link';

export default function Breadcrumbs({
  section,
  sectionHref,
  title,
}: {
  section: string;
  sectionHref: string;
  title: string;
}) {
  return (
    <nav className="btt-breadcrumbs" aria-label="Breadcrumb">
      <ol className="btt-breadcrumbs__list">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li aria-hidden="true" className="btt-breadcrumbs__sep">
          /
        </li>
        <li>
          <Link href={sectionHref}>{section}</Link>
        </li>
        <li aria-hidden="true" className="btt-breadcrumbs__sep">
          /
        </li>
        <li aria-current="page" className="btt-breadcrumbs__current">
          {title}
        </li>
      </ol>
    </nav>
  );
}
