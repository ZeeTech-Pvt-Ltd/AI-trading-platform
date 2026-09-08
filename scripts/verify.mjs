// End-to-end verification: routes render, modern review-site styles applied,
// links correct, no console errors. Saves desktop screenshots to screenshots/.
import { chromium } from 'file:///C:/Users/samee/node_modules/playwright/index.mjs'
import { mkdirSync } from 'node:fs'
import { REVIEWS } from '../src/data/reviews/index.js'

const BASE = 'http://localhost:5185'

mkdirSync('screenshots', { recursive: true })
const results = []
const consoleErrors = []

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})
page.on('pageerror', (err) => consoleErrors.push(String(err)))

async function check(name, fn) {
  try {
    await fn()
    results.push(`PASS  ${name}`)
  } catch (err) {
    results.push(`FAIL  ${name} — ${String(err).split('\n')[0].slice(0, 180)}`)
  }
}

// ---- home ----
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await check('home: title', async () => {
  const t = await page.title()
  if (!t.includes('AI Trading Platform')) throw new Error(`title was "${t}"`)
})
await check('home: review-style fonts loaded (Plus Jakarta Sans)', async () => {
  const ok = await page.evaluate(async () => {
    await document.fonts.ready
    return document.fonts.check('800 16px "Plus Jakarta Sans"')
  })
  if (!ok) throw new Error('Plus Jakarta Sans not loaded')
})
await check(`home: ${REVIEWS.length} review cards render`, async () => {
  const n = await page.locator('.review-card').count()
  if (n !== REVIEWS.length) throw new Error(`found ${n} cards`)
})
await check(`home: ${REVIEWS.length} score rings on cards`, async () => {
  const n = await page.locator('.review-card .score-ring').count()
  if (n !== REVIEWS.length) throw new Error(`found ${n} rings`)
})
await check('home: top-rated side card has 5 rows', async () => {
  const n = await page.locator('.hero__side-row').count()
  if (n !== 5) throw new Error(`found ${n} rows`)
})
await check('home: featured banner has score ring + verdict chip', async () => {
  const rings = await page.locator('.featured .score-ring').count()
  const chips = await page.locator('.featured .chip').count()
  if (rings !== 1 || chips !== 1) throw new Error(`rings ${rings}, chips ${chips}`)
})
await check('home: how-we-rate has 5 cells', async () => {
  const n = await page.locator('.how-rate__cell').count()
  if (n !== 5) throw new Error(`found ${n} cells`)
})
await check('home: cards are rounded cards with borders', async () => {
  const style = await page.$eval('.review-card', (el) => {
    const s = getComputedStyle(el)
    return { radius: s.borderRadius, border: s.borderTopWidth, shadow: s.boxShadow }
  })
  if (parseFloat(style.radius) < 10) throw new Error(`radius ${style.radius}`)
  if (style.border === '0px') throw new Error('no border')
  if (style.shadow === 'none') throw new Error('no shadow')
})
await page.screenshot({ path: 'screenshots/home-desktop.png', fullPage: true })

// ---- review pages ----
for (const r of REVIEWS) {
  await page.goto(`${BASE}/review/${r.slug}`, { waitUntil: 'networkidle' })
  await check(`review/${r.slug}: headline renders`, async () => {
    const h1 = await page.locator('.article-head__title').innerText()
    if (!h1.includes('Safe, Legit or a Scam?')) throw new Error(`h1 was "${h1.slice(0, 60)}"`)
  })
  await check(`review/${r.slug}: visit link → ${r.visitUrl}`, async () => {
    const href = await page.locator('.aside-card a.btn--green').first().getAttribute('href')
    if (href !== r.visitUrl) throw new Error(`href was ${href}`)
  })
  await check(`review/${r.slug}: facts + scorecard bars + FAQ present`, async () => {
    const facts = await page.locator('.facts__row').count()
    const bars = await page.locator('.scorecard__bar').count()
    const faqs = await page.locator('.faq__item').count()
    if (facts !== 6) throw new Error(`facts rows ${facts}`)
    if (bars !== 5) throw new Error(`scorecard bars ${bars}`)
    if (faqs !== 5) throw new Error(`faq items ${faqs}`)
  })
  await check(`review/${r.slug}: JSON-LD review schema injected`, async () => {
    const has = await page.evaluate(() => {
      const el = document.getElementById('review-jsonld')
      return !!el && JSON.parse(el.textContent)['@type'] === 'Review'
    })
    if (!has) throw new Error('missing Review JSON-LD')
  })
  await check(`review/${r.slug}: score ring + verdict chip in header`, async () => {
    const rings = await page.locator('.article-head__score .score-ring').count()
    const chips = await page.locator('.article-head__chips .chip').count()
    if (rings !== 1 || chips < 1) throw new Error(`rings ${rings}, chips ${chips}`)
  })
  if (r.slug === REVIEWS[0].slug) {
    await page.screenshot({ path: 'screenshots/article-desktop.png', fullPage: true })
  }
}

// ---- scorecard bars are filled proportionally ----
await page.goto(`${BASE}/review/${REVIEWS[0].slug}`, { waitUntil: 'networkidle' })
await check('article: scorecard bars have proportional widths', async () => {
  const widths = await page.$$eval('.scorecard__bar-fill', (els) =>
    els.map((el) => parseFloat(el.style.width)),
  )
  if (widths.length !== 5 || widths.some((w) => w < 60 || w > 100)) {
    throw new Error(`bar widths ${widths.join(', ')}`)
  }
})
await check(`article: ring shows ${REVIEWS[0].rating.toFixed(1)} for ${REVIEWS[0].name}`, async () => {
  const num = await page.locator('.article-head__score .score-ring__num').innerText()
  if (num !== REVIEWS[0].rating.toFixed(1)) throw new Error(`ring num ${num}`)
})
await check('article: canonical set to review URL', async () => {
  const href = await page.$eval('link[rel="canonical"]', (el) => el.href)
  if (!href.endsWith(`/review/${REVIEWS[0].slug}`)) throw new Error(`canonical ${href}`)
})

// ---- other routes ----
for (const path of ['/about', '/privacy-policy', '/terms-of-use', '/risk-disclosure', '/advertising-disclosure', '/nope-404']) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  await check(`route ${path}: renders`, async () => {
    const h1 = await page.locator('h1').first().innerText()
    if (!h1 || h1.length < 3) throw new Error('no h1')
  })
}

// ---- contact page hidden ----
await check('nav: no Contact link in header or footer', async () => {
  const headerText = await page.locator('.header__links').innerText()
  const footerText = await page.locator('.footer').innerText()
  if (/contact/i.test(headerText)) throw new Error('header still links to Contact')
  if (/contact/i.test(footerText)) throw new Error('footer still links to Contact')
})
await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' })
await check('route /contact: returns 404', async () => {
  const h1 = await page.locator('h1').first().innerText()
  if (!/spiked/i.test(h1)) throw new Error(`h1 was "${h1}"`)
})

console.log(results.join('\n'))
console.log(`\nconsole errors: ${consoleErrors.length}`)
if (consoleErrors.length) console.log(consoleErrors.slice(0, 5).join('\n'))
await browser.close()
const failed = results.filter((r) => r.startsWith('FAIL'))
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`)
process.exit(failed.length ? 1 : 0)
