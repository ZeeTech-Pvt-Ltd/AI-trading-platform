import { useEffect } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import useMeta from '../hooks/useMeta.js'
import { REVIEWS, getReview } from '../data/reviews/index.js'
import { SITE } from '../data/site.js'
import ScoreRing from '../components/ScoreRing.jsx'
import VerdictChip from '../components/VerdictChip.jsx'
import Stars from '../components/Stars.jsx'
import Scorecard from '../components/Scorecard.jsx'
import ProsCons from '../components/ProsCons.jsx'
import FaqList from '../components/FaqList.jsx'
import ReviewCard from '../components/ReviewCard.jsx'
import Reveal from '../components/Reveal.jsx'
import Icon from '../components/Icon.jsx'
import NotFound from './NotFound.jsx'

function ArticleJsonLd({ review }) {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'review-jsonld'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Review',
      itemReviewed: {
        '@type': 'Product',
        name: review.name,
        url: review.visitUrl,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      author: { '@type': 'Person', name: review.byline },
      publisher: { '@type': 'Organization', name: SITE.name },
      datePublished: review.isoDate,
    })
    document.head.appendChild(script)
    return () => {
      const el = document.getElementById('review-jsonld')
      if (el) el.remove()
    }
  }, [review])
  return null
}

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function ReviewArticle() {
  const { slug } = useParams()
  const { pathname } = useLocation()

  // Match by exact path first (paths can carry a suffix like -review that
  // differs from the slug); fall back to the slug for legacy /review/ URLs.
  const review = REVIEWS.find((r) => r.path === pathname) || getReview(slug)

  useMeta({
    title: review ? review.seoTitle || review.headline : 'Review not found',
    description: review ? review.seoDescription || review.deck : null,
    path: review ? review.path : pathname,
    appendSite: false,
  })

  if (!review) return <NotFound />
  // Canonical URL: legacy routes (e.g. /review/<slug> or an old path) redirect
  // to the review's own path.
  if (pathname !== review.path) return <Navigate to={review.path} replace />

  const facts = [
    ['Platform', review.name],
    ['Domain', review.domain],
    ['Target market', review.targetMarket],
    ['Minimum deposit', review.minimumDeposit],
    ['Deposit methods', review.depositMethods],
    ['Support', review.support],
  ]

  const asideFacts = facts.filter(([k]) => !['Platform', 'Domain', 'Target market'].includes(k))

  const related = REVIEWS.filter((r) => r.slug !== review.slug).slice(0, 2)
  const index = REVIEWS.findIndex((r) => r.slug === review.slug)
  const notPublished = /none published|not published|not applicable/i

  return (
    <>
      <ArticleJsonLd review={review} />

      <article className="article-head">
        <div className="container">
          <div className="article-head__crumb">
            <span>
              <Link to="/">Home</Link> → <Link to="/#reviews">Reviews</Link> → {review.name}
            </span>
            <span>
              Review No. {String(index + 1).padStart(2, '0')} - {review.date}
            </span>
          </div>

          <div className="article-head__platform">
            <span className="tile tile--lg" style={{ background: review.accent }} aria-hidden="true">
              {initials(review.name)}
            </span>
            <div className="article-head__platform-id">
              <span className="article-head__platform-name">{review.name}</span>
              <span className="article-head__platform-domain">{review.domain}</span>
            </div>
            <div className="article-head__chips">
              <VerdictChip verdict={review.verdict} />
              <span className="pill">Updated {review.date}</span>
            </div>
          </div>

          <h1 className="article-head__title">{review.headline}</h1>
          <p className="article-head__deck">{review.deck}</p>

          <div className="article-head__meta">
            <span className="article-head__byline">
              By {review.byline}
              <span>
                {review.date} · {review.readTime}
              </span>
            </span>
            <div className="article-head__score">
              <span className="article-head__score-label">Our score</span>
              <ScoreRing value={review.rating} size={84} stroke={7} />
              <Stars value={review.rating} style={{ fontSize: 14 }} />
            </div>
          </div>
        </div>
      </article>

      <div className="article-body">
        <div className="container article-body__layout">
          <div className="article-body__main">
            {review.intro.map((para, i) => (
              <p key={i} className={i === 0 ? 'lead' : ''}>
                {para}
              </p>
            ))}

            {/* the facts */}
            <div className="facts">
              <div className="facts__head">The facts</div>
              <div className="facts__grid">
                {facts.map(([k, v]) => (
                  <div className="facts__row" key={k}>
                    <span className="facts__key">{k}</span>
                    <span className={`facts__value ${notPublished.test(v) ? 'facts__value--na' : ''}`}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <h2>What the platform claims</h2>
            <div className="list-card">
              <ul>
                {review.whatItClaims.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <h2>What we checked</h2>
            <div className="list-card">
              <ul>
                {review.whatWeChecked.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <h2>The scorecard</h2>
            <Scorecard scorecard={review.scorecard} />

            <ProsCons pros={review.pros} cons={review.cons} />

            <div className="redflags">
              <p className="redflags__title">⚠ Red flags - what gave us pause</p>
              <ul>
                {review.redFlags.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bottomline">
              <div className="bottomline__head">
                <h2 className="bottomline__title" style={{ margin: 0 }}>
                  The bottom line
                </h2>
                <VerdictChip verdict={review.verdict} />
              </div>
              {review.bottomLine.map((para, i) => (
                <p key={i} style={{ marginBottom: i === review.bottomLine.length - 1 ? 0 : '1em' }}>
                  {para}
                </p>
              ))}
            </div>

            <h2>Frequently asked questions</h2>
            <FaqList items={review.faqs} />
          </div>

          <aside className="article-body__aside">
            <div className="aside-card">
              <p className="aside-card__title">Our score</p>
              <div className="aside-card__center">
                <ScoreRing value={review.rating} size={88} stroke={7} />
                <Stars value={review.rating} style={{ fontSize: 15 }} />
              </div>
            </div>

            <div className="aside-card">
              <p className="aside-card__title">Key facts</p>
              {asideFacts.map(([k, v]) => (
                <div className="aside-card__row" key={k}>
                  <span className="aside-card__key">{k}</span>
                  <span className={`aside-card__value ${notPublished.test(v) ? 'aside-card__value--na' : ''}`}>
                    {v}
                  </span>
                </div>
              ))}
            </div>

            <div className="aside-card">
              <p className="aside-card__title">Visit the platform</p>
              <a
                className="btn btn--green"
                style={{ width: '100%' }}
                href={review.visitUrl}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
              >
                Visit {review.name} <Icon name="external" size={15} />
              </a>
              <p className="aside-card__note">
                Affiliate link - see our advertising disclosure.
              </p>
            </div>
          </aside>
        </div>

        {/* related reviews */}
        <div className="container">
          <div className="section-head" style={{ marginTop: 56 }}>
            <div>
              <span className="kicker">Keep reading</span>
              <h2 className="section-head__title">Related reviews</h2>
            </div>
          </div>
          <div className="related-grid">
            {related.map((r) => (
              <Reveal key={r.slug}>
                <ReviewCard review={r} />
              </Reveal>
            ))}
          </div>

          <div className="article-cta">
            <h2 className="article-cta__title">Ready to read the rest of the reviews?</h2>
            <Link to="/#reviews" className="btn btn--green">
              All reviews
              <Icon name="arrow-right" size={15} />
            </Link>
            <p className="article-cta__note">
              Nothing on this page is financial advice. Trading involves risk.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
