import Link from 'next/link';
import { reviewers } from '@/lib/reviewers';
import { site } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import Section from './Section';

// Fixed square dimensions reserve space and prevent layout shift.
const PHOTO_SIZE = 96;

function toAbsolute(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//.test(url)) return url;
  return `${site.url}${url.startsWith('/') ? url : `/${url}`}`;
}

/**
 * The real people behind the reviews. Driven by lib/reviewers.ts; each
 * reviewer emits Person schema and links to their profile page.
 */
export default function Reviewers() {
  const personJson =
    reviewers.length > 0
      ? JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': reviewers.map((reviewer) => ({
            '@type': 'Person',
            name: reviewer.name,
            jobTitle: reviewer.role,
            description: reviewer.credential,
            image: toAbsolute(reviewer.photo),
            url: toAbsolute(reviewer.profileUrl),
            ...(reviewer.socialUrl ? { sameAs: [reviewer.socialUrl] } : {}),
          })),
        })
      : null;

  return (
    <Section id="reviewers" className="home-section--reviewers">
      <h2 className="home-section__title">Our reviewers</h2>
      {personJson ? <JsonLd data={personJson} /> : null}
      {reviewers.length === 0 ? (
        <p className="reviewers__empty">No reviewers listed yet.</p>
      ) : (
        <ul className="reviewers__list">
          {reviewers.map((reviewer) => (
            <li key={reviewer.profileUrl} className="reviewers__card">
              <Link className="reviewers__cardLink" href={reviewer.profileUrl}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="reviewers__photo"
                  src={reviewer.photo}
                  alt=""
                  width={PHOTO_SIZE}
                  height={PHOTO_SIZE}
                  loading="lazy"
                  decoding="async"
                />
                <span className="reviewers__name">{reviewer.name}</span>
                <span className="reviewers__role">{reviewer.role}</span>
                <span className="reviewers__credential">
                  {reviewer.credential}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="reviewers__more">
        <Link href="/contributors">All contributors</Link>
      </p>
    </Section>
  );
}
