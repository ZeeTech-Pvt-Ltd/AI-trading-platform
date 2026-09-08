import { Link } from 'react-router-dom'
import ScoreRing from './ScoreRing.jsx'
import VerdictChip from './VerdictChip.jsx'

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function ReviewCard({ review }) {
  return (
    <article className="review-card" style={{ '--accent': review.accent }}>
      <div className="review-card__top">
        <span className="tile" aria-hidden="true">{initials(review.name)}</span>
        <div className="review-card__id">
          <span className="review-card__name">{review.name}</span>
          <span className="review-card__domain">{review.domain}</span>
        </div>
        <ScoreRing value={review.rating} size={48} stroke={5} className="review-card__ring" />
      </div>

      <h3 className="review-card__title">
        <Link to={`/review/${review.slug}`}>{review.headline}</Link>
      </h3>
      <p className="review-card__deck">{review.deck}</p>

      <div className="review-card__foot">
        <VerdictChip verdict={review.verdict} />
        <span className="review-card__read">{review.readTime}</span>
      </div>
    </article>
  )
}
