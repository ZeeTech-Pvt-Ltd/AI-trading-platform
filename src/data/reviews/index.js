import rendaven from './rendaven.js'
import brightKapitune from './bright-kapitune.js'
import gemWealthholm from './gem-wealthholm.js'
import polarZinsmere from './polar-zinsmere.js'
import austerioSmartUp from './austerio-smart-up.js'
import zephgain from './zephgain.js'
import dorivo from './dorivo.js'
import lyraVestgrove from './lyra-vestgrove.js'
import gewinodeRaven from './gewinode-raven.js'
import nexoraAiPlatform from './nexora-ai-platform.js'

// Insertion order doubles as the listing order: new reviews are appended at the
// end, so they land on the next pagination page automatically.
const RAW = [
  rendaven,
  brightKapitune,
  gemWealthholm,
  polarZinsmere,
  austerioSmartUp,
  zephgain,
  dorivo,
  lyraVestgrove,
  gewinodeRaven,
  nexoraAiPlatform,
]

// Overall rating = mean of the five scorecard dimensions, rounded to 1 dp.
// isoDate derives the machine-readable date for JSON-LD from the display date.
// path lets a review use a custom URL (Rendaven: /trading/rendaven).
const computed = RAW.map((review) => {
  const dims = Object.values(review.scorecard)
  const rating = Math.round((dims.reduce((sum, d) => sum + d, 0) / dims.length) * 10) / 10
  const isoDate = new Date(`${review.date} UTC`).toISOString().slice(0, 10)
  const path = review.path || `/review/${review.slug}`
  return { ...review, rating, isoDate, path }
})

// Rating order - used for the top-rated list, featured review and related cards.
export const REVIEWS = [...computed].sort((a, b) => b.rating - a.rating)

// Listing order - used for the paginated review grid (page 1 / page 2 / …).
export const PAGINATED = computed

export const PAGE_SIZE = 8
export const TOTAL_PAGES = Math.ceil(PAGINATED.length / PAGE_SIZE)

export const getReview = (slug) => REVIEWS.find((r) => r.slug === slug)

export const FEATURED = REVIEWS[0]
