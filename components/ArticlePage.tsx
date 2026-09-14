import type { Post } from '@/lib/data';
import { getRelatedCards } from '@/lib/data';
import { enrichJsonLd } from '@/lib/schema';
import Byline from './Byline';
import JsonLd from './JsonLd';
import PostCard from './PostCard';

export default function ArticlePage({ post }: { post: Post }) {
  const classes = ['btt-article', 'hentry', ...post.categories.map((c) => `category-${c}`)].join(
    ' ',
  );

  return (
    <main id="primary" className="lucky-site-main btt-single">
      <article className={classes}>
        <div className="btt-article__inner">
          <header className="btt-article__header">
            <h1 className="btt-article__title">{post.title}</h1>
            <Byline
              author={post.author}
              authorSlug={post.authorSlug}
              date={post.date}
              readingTime={post.readingTime}
            />
          </header>

          {post.excerpt ? (
            <div className="btt-excerpt" dangerouslySetInnerHTML={{ __html: post.excerpt }} />
          ) : null}

          <div
            className="btt-article__content lucky-entry-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
      {post.type === 'trading' ? (
        <section className="btt-related" aria-label="More platform reviews">
          <div className="btt-related__inner">
            <h2 className="btt-related__title">More Platform Reviews</h2>
            <div className="btt-stream__grid btt-stream__grid--1">
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
