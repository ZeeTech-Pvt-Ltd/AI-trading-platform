import rendaven from './rendaven.js'
import brightKapitune from './bright-kapitune.js'
import gemWealthholm from './gem-wealthholm.js'
import polarZinsmere from './polar-zinsmere.js'
import austerioSmartUp from './austerio-smart-up.js'
import zephgain from './zephgain.js'
import dorivo from './dorivo.js'
import lyraVestgrove from './lyra-vestgrove.js'

const RAW = [
  rendaven,
  brightKapitune,
  gemWealthholm,
  polarZinsmere,
  austerioSmartUp,
  zephgain,
  dorivo,
  lyraVestgrove,
]

// Overall rating = mean of the five scorecard dimensions, rounded to 1 dp.
// isoDate derives the machine-readable date for JSON-LD from the display date.
export const REVIEWS = RAW.map((review) => {
  const dims = Object.values(review.scorecard)
  const rating = Math.round((dims.reduce((sum, d) => sum + d, 0) / dims.length) * 10) / 10
  const isoDate = new Date(`${review.date} UTC`).toISOString().slice(0, 10)
  return { ...review, rating, isoDate }
}).sort((a, b) => b.rating - a.rating)

export const getReview = (slug) => REVIEWS.find((r) => r.slug === slug)

export const FEATURED = REVIEWS[0]
