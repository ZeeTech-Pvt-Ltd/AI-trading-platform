import Link from 'next/link';
import { getAuthor } from '@/lib/data';
import { formatDate } from '@/lib/format';

export default function Byline({
  author,
  authorSlug,
  date,
  readingTime,
}: {
  author: string;
  authorSlug: string;
  date: string;
  readingTime: string;
}) {
  const avatar = getAuthor(authorSlug)?.avatar ?? '';
  const authorHref = `/author/${authorSlug}`;

  return (
    <div className="btt-byline">
      <Link className="btt-byline__avatar" href={authorHref}>
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            src={avatar}
            className="avatar avatar-48 photo"
            height="48"
            width="48"
            decoding="async"
          />
        ) : null}
      </Link>
      <div className="btt-byline__meta">
        <Link className="btt-byline__name" href={authorHref} rel="author">
          {author}
        </Link>
        <div className="btt-byline__sub">
          {date ? <time dateTime={date}>{formatDate(date)}</time> : null}
          {date && readingTime ? (
            <span className="btt-byline__sep" aria-hidden="true">
              ·
            </span>
          ) : null}
          {readingTime ? <span>{readingTime}</span> : null}
        </div>
      </div>
    </div>
  );
}
