import { Link } from 'react-router-dom'
import useMeta from '../hooks/useMeta.js'
import { REVIEWS, FEATURED } from '../data/reviews/index.js'
import { RATING_DIMENSIONS } from '../data/site.js'
import ReviewCard from '../components/ReviewCard.jsx'
import ScoreRing from '../components/ScoreRing.jsx'
import VerdictChip from '../components/VerdictChip.jsx'
import SectionHead from '../components/SectionHead.jsx'
import Reveal from '../components/Reveal.jsx'
import Icon from '../components/Icon.jsx'

export default function Home() {
  useMeta({ title: null, path: '' })

  return (
    <>
      {/* ---- hero ---- */}
      <section className="hero">
        <div className="container">
          <div>
            <span className="kicker">2026 Review Roundup</span>
            <h1 className="hero__title">
              AI trading platform reviews that read the fine print{' '}
              <em>so you don&rsquo;t have to.</em>
            </h1>
            <p className="hero__deck">
              {REVIEWS.length} platforms, one question each: safe, legit or a scam? We
              read what each platform publishes — the claims, the fees, the security
              pages, the fine print — and hand down a verdict you can act on.
            </p>
            <p className="hero__stat">
              {REVIEWS.length} platforms reviewed &nbsp;·&nbsp; 5 scoring criteria
            </p>
            <div className="hero__actions">
              <a className="btn btn--green" href="#reviews">
                Browse all reviews
                <Icon name="chevron" size={15} />
              </a>
              <a className="btn btn--outline" href="#method">
                How we rate
              </a>
            </div>
          </div>

          <aside className="hero__side" aria-label="Top rated">
            <div className="hero__side-head">
              <span className="hero__side-title">Top rated</span>
              <span className="hero__side-note">Our scores</span>
            </div>
            {REVIEWS.slice(0, 5).map((r, i) => (
              <div className="hero__side-row" key={r.slug}>
                <Link to={r.path}>
                  <span className="hero__side-rank">{String(i + 1).padStart(2, '0')}</span>
                  {r.name}
                </Link>
                <span className={`hero__side-score ${r.rating < 4.2 ? 'is-caution' : ''}`}>
                  {r.rating.toFixed(1)}
                </span>
              </div>
            ))}
          </aside>
        </div>
      </section>

      {/* ---- lead review ---- */}
      <section className="featured">
        <div className="container">
          <Reveal className="featured__body">
            <span className="featured__chip">★ Lead review</span>
            <h2 className="featured__title">
              <Link to={FEATURED.path} style={{ color: '#fff' }}>
                {FEATURED.headline}
              </Link>
            </h2>
            <p className="featured__deck">{FEATURED.deck}</p>
            <p className="featured__meta">
              By {FEATURED.byline} &nbsp;·&nbsp; {FEATURED.date} &nbsp;·&nbsp; {FEATURED.readTime}
            </p>
            <div className="featured__actions">
              <Link to={FEATURED.path} className="btn btn--white">
                Read the review
                <Icon name="arrow-right" size={15} />
              </Link>
              <a
                className="btn btn--ghost-white"
                href={FEATURED.visitUrl}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
              >
                Visit {FEATURED.name}
                <Icon name="external" size={15} />
              </a>
            </div>
          </Reveal>
          <Reveal className="featured__side" delay={120}>
            <span className="featured__side-label">Our score</span>
            <ScoreRing value={FEATURED.rating} size={96} stroke={7} light />
            <VerdictChip verdict={FEATURED.verdict} dark />
          </Reveal>
        </div>
      </section>

      {/* ---- all reviews ---- */}
      <section className="section" id="reviews">
        <div className="container">
          <SectionHead
            kicker="Latest reviews"
            title={`All ${REVIEWS.length} platform reviews`}
            aside="New reviews added regularly"
          />
          <div className="review-grid">
            {REVIEWS.map((review) => (
              <Reveal key={review.slug}>
                <ReviewCard review={review} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- how we rate ---- */}
      <section className="section section--deep" id="method">
        <div className="container">
          <SectionHead
            kicker="Methodology"
            title="How we rate"
            aside="Five criteria, one average"
          />
          <div className="how-rate__grid">
            {RATING_DIMENSIONS.map((dim, i) => (
              <Reveal className="how-rate__cell" key={dim.key} delay={i * 50}>
                <div className="how-rate__num">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="how-rate__name">{dim.name}</h3>
                <p className="how-rate__text">{dim.text}</p>
              </Reveal>
            ))}
          </div>

          <div className="disclosure">
            <span className="disclosure__label">Disclosure</span>
            <p>
              Reviews are editorial and reflect each platform&rsquo;s own published material
              at the time of writing. Some outbound links are affiliate links — that never
              changes a score or a verdict. Nothing on this site is financial advice, and
              trading involves risk. See our{' '}
              <Link to="/advertising-disclosure">advertising disclosure</Link> and{' '}
              <Link to="/risk-disclosure">risk disclosure</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
