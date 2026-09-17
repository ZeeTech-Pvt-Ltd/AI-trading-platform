import type { Post } from '@/lib/data';
import { getRelatedCards, getCard, getTopRatedCards } from '@/lib/data';
import { brandName, ratingVerdict } from '@/lib/format';
import { enrichJsonLd } from '@/lib/schema';
import { buildToc } from '@/lib/toc';
import Byline from './Byline';
import Breadcrumbs from './Breadcrumbs';
import JsonLd from './JsonLd';
import PostCard from './PostCard';
import TableOfContents from './TableOfContents';
import TopRatedWidget from './TopRatedWidget';

function ReviewSidebar({ post }: { post: Post }) {
  const card = getCard(post.type, post.slug);
  const name = brandName(post.title);
  const verdict = ratingVerdict(card?.ratingValue);
  const affiliate =
    post.ctaUrl || `https://austerio-smart-up.com/?f=${post.slug.replace(/-review$/, '')}`;

  return (
    <aside className="btt-article__sidebar">
      <div className="btt-side-card">
        {card?.ratingValue ? (
          <>
            <span className="btt-side-card__label">Our score</span>
            <span className="btt-side-card__score">{card.ratingValue}<span>/5</span></span>
            <span className={`btt-h-badge btt-h-badge--${verdict.tone}`}>
              <span className="btt-h-badge__dot" aria-hidden="true" />
              {verdict.label}
            </span>
          </>
        ) : null}
        <a
          className="btt-h-btn btt-h-btn--primary btt-side-card__cta"
          href={affiliate}
          rel="sponsored nofollow noopener noreferrer"
          target="_blank"
        >
          Visit {name} →
        </a>
        <dl className="btt-side-card__facts">
          <div>
            <dt>Reviewed by</dt>
            <dd>{post.author}</dd>
          </div>
          <div>
            <dt>Reading time</dt>
            <dd>{post.readingTime}</dd>
          </div>
        </dl>
      </div>

      <TopRatedWidget cards={getTopRatedCards(5)} excludeSlug={post.slug} />
    </aside>
  );
}

export default function ArticlePage({ post }: { post: Post }) {
  const classes = ['btt-article', 'hentry', ...post.categories.map((c) => `category-${c}`)].join(
    ' ',
  );

  const isTrading = post.type === 'trading';
  const kicker = isTrading ? 'Platform Review' : 'Bitcoin Article';
  const section = isTrading ? 'Reviews' : 'Articles';
  const sectionHref = isTrading ? '/reviews' : '/articles';
  const { items: tocItems, html } = buildToc(post.content);

  const card = isTrading ? getCard(post.type, post.slug) : undefined;
  const name = isTrading ? brandName(post.title) : '';
  const verdict = ratingVerdict(card?.ratingValue);
  const affiliate = isTrading
    ? post.ctaUrl || `https://austerio-smart-up.com/?f=${post.slug.replace(/-review$/, '')}`
    : '';

  const main = (
    <div className="btt-article__main">
      <Breadcrumbs section={section} sectionHref={sectionHref} title={post.title} />

      <header className="btt-article__header">
        <p className="btt-article__kicker">{kicker}</p>
        <h1 className="btt-article__title">{post.title}</h1>
        <Byline
          author={post.author}
          authorSlug={post.authorSlug}
          date={post.date}
          readingTime={post.readingTime}
        />
      </header>

      {isTrading && card?.ratingValue ? (
        <div className="btt-article__quickverdict">
          <div className="btt-article__quickverdict__score">
            <span className="btt-article__quickverdict__number">{card.ratingValue}</span>
            <span className="btt-article__quickverdict__max">/5</span>
          </div>
          <div className="btt-article__quickverdict__meta">
            <span className={`btt-h-badge btt-h-badge--${verdict.tone}`}>
              <span className="btt-h-badge__dot" aria-hidden="true" />
              {verdict.label}
            </span>
            <span className="btt-article__quickverdict__criteria">
              Rated on regulation, security, fees, ease of use, markets &amp; support
            </span>
          </div>
          <a
            className="btt-article__quickverdict__cta"
            href={affiliate}
            rel="sponsored nofollow noopener noreferrer"
            target="_blank"
          >
            Visit {name} →
          </a>
        </div>
      ) : null}

      {post.excerpt ? (
        <div className="btt-excerpt" dangerouslySetInnerHTML={{ __html: post.excerpt }} />
      ) : null}

      <TableOfContents items={tocItems} label={isTrading ? 'In this review' : 'In this article'} />

      <div
        className="btt-article__content lucky-entry-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );

  return (
    <main id="primary" className="lucky-site-main btt-single">
      <article className={classes}>
        <div className="btt-article__inner">
          {isTrading ? (
            <div className="btt-article__layout">
              {main}
              <ReviewSidebar post={post} />
            </div>
          ) : (
            main
          )}
        </div>
      </article>
      {post.type === 'trading' ? (
        <section className="btt-related" aria-label="More platform reviews">
          <div className="btt-related__inner">
            <h2 className="btt-related__title">More Platform Reviews</h2>
            <div className="btt-stream__grid btt-stream__grid--2">
              {getRelatedCards('trading', post.slug, 6).map((c) => (
                <PostCard key={`${c.type}/${c.slug}`} card={c} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {post.jsonLd ? (
        <JsonLd data={enrichJsonLd(post.jsonLd, post.dateModified ?? post.date)} />
      ) : null}
      {post.reviewJsonLd ? (
        <JsonLd data={enrichJsonLd(post.reviewJsonLd, post.dateModified ?? post.date)} />
      ) : null}
    </main>
  );
}
