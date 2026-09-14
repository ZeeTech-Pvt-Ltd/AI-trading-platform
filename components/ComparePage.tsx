import Link from 'next/link';
import type { CompareSide } from '@/lib/compare';
import { affiliateToken } from '@/lib/bestPlatforms';

const AFFILIATE_BASE = 'https://austerio-smart-up.com/?f=';

function ctaHref(slug: string): string {
  return `${AFFILIATE_BASE}${affiliateToken(slug)}`;
}

function Row({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>{a}</td>
      <td>{b}</td>
    </tr>
  );
}

export default function ComparePage({ a, b }: { a: CompareSide; b: CompareSide }) {
  return (
    <main id="primary" className="lucky-site-main btt-single">
      <div className="btt-compare">
        <header className="btt-compare__header">
          <h1 className="btt-compare__title">
            {a.name} vs {b.name}
          </h1>
          <p className="btt-compare__subtitle">
            Side-by-side review of two automated trading platforms. Compare minimum deposits, demo
            accounts, support and the key strengths and weaknesses before you register either one.
          </p>
        </header>

        <div className="btt-compare__grid">
          {[a, b].map((side) => (
            <article key={side.slug} className="btt-compare__card">
              <h2 className="btt-compare__name">
                <Link href={`/trading/${side.slug}`}>{side.name}</Link>
              </h2>
              <div className="btt-compare__score">
                {side.score > 0 ? (
                  <>
                    <span className="btt-compare__score-num">{side.score.toFixed(1)}</span>
                    <span className="btt-compare__score-label">/ 5</span>
                  </>
                ) : (
                  <span className="btt-compare__score-label">Not rated</span>
                )}
              </div>
              <dl className="btt-compare__specs">
                <div>
                  <dt>Min deposit</dt>
                  <dd>{side.minDeposit}</dd>
                </div>
                <div>
                  <dt>Demo account</dt>
                  <dd>{side.demo}</dd>
                </div>
                <div>
                  <dt>Support</dt>
                  <dd>{side.support}</dd>
                </div>
                <div>
                  <dt>Payout time</dt>
                  <dd>{side.payout}</dd>
                </div>
              </dl>
              <a
                className="btt-compare__cta"
                href={ctaHref(side.slug)}
                rel="sponsored nofollow noopener noreferrer"
                target="_blank"
              >
                Visit {side.name}
              </a>
            </article>
          ))}
        </div>

        <section className="btt-compare__table">
          <h2 className="btt-compare__h2">How they compare</h2>
          <div className="btt-table-wrap">
            <table className="btt-compare__table">
              <thead>
                <tr>
                  <th scope="col"></th>
                  <th scope="col">{a.name}</th>
                  <th scope="col">{b.name}</th>
                </tr>
              </thead>
              <tbody>
                <Row label="Editor score" a={a.score > 0 ? a.score.toFixed(1) : '—'} b={b.score > 0 ? b.score.toFixed(1) : '—'} />
                <Row label="Minimum deposit" a={a.minDeposit} b={b.minDeposit} />
                <Row label="Demo account" a={a.demo} b={b.demo} />
                <Row label="Customer support" a={a.support} b={b.support} />
                <Row label="Payout time" a={a.payout} b={b.payout} />
              </tbody>
            </table>
          </div>
        </section>

        <section className="btt-compare__proscons">
          {[a, b].map((side) => (
            <div key={side.slug} className="btt-compare__proscons-col">
              <h3 className="btt-compare__proscons-title">
                <Link href={`/trading/${side.slug}`}>{side.name}</Link>
              </h3>
              {side.pros.length ? (
                <>
                  <h4 className="btt-best__col-title btt-best__col-title--pro">Strengths</h4>
                  <ul className="btt-best__pros">
                    {side.pros.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {side.cons.length ? (
                <>
                  <h4 className="btt-best__col-title btt-best__col-title--con">Weaknesses</h4>
                  <ul className="btt-best__cons">
                    {side.cons.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          ))}
        </section>

        <section className="btt-compare__verdict">
          <h2 className="btt-compare__h2">Bottom line</h2>
          <p>
            {a.name} and {b.name} follow the same automated-trading model: a web-based platform with
            a beginner-friendly minimum deposit, a demo account, and AI-assisted trade analysis.
            Neither can guarantee profits, and both carry a high risk of loss. The practical
            difference usually comes down to the small print — fees, payout speed and broker
            oversight — so read both full reviews and start with a demo account before risking real
            money.
          </p>
        </section>
      </div>
    </main>
  );
}
