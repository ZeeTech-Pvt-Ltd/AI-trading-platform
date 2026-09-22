import Link from 'next/link';
import JsonLd from './JsonLd';
import { BEST_PLATFORMS, affiliateToken } from '@/lib/bestPlatforms';

const AFFILIATE_BASE = 'https://austerio-smart-up.com/?f=';

function ctaHref(slug: string): string {
  return `${AFFILIATE_BASE}${affiliateToken(slug)}`;
}

function stars(score: number): string {
  const pct = Math.round((score / 5) * 100);
  return pct + '%';
}

export default function BestOfPage({
  title,
  subtitle,
  description,
}: {
  title: string;
  subtitle: string;
  description: string;
}) {
  const faq = [
    {
      q: 'What is the minimum deposit to start trading?',
      a: 'Every platform on this list has a $250 minimum deposit. That is the real money you must commit before live trading begins, so treat it as a test budget and never fund more than you can afford to lose.',
    },
    {
      q: 'Are these AI trading platforms safe?',
      a: 'None of these platforms can guarantee profits, and automated trading carries a high risk of loss. Our scores are editorial assessments of usability and transparency, not verified performance claims. Always check the broker behind the platform and its regulatory status before depositing.',
    },
    {
      q: 'Do I need experience to use an automated trading platform?',
      a: 'No, these platforms are designed for beginners and include demo accounts. However, automation does not remove risk: the AI executes trades, but you remain responsible for what you deposit and for your risk settings.',
    },
    {
      q: 'How did you rank these platforms?',
      a: 'We score each platform on onboarding, demo-account quality, transparency of fees, support responsiveness, and the strength of its risk controls. Profit claims from the platforms themselves are not factored into the score because they are not independently verifiable.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    description,
    itemListElement: BEST_PLATFORMS.map((p) => ({
      '@type': 'ListItem',
      position: p.rank,
      name: p.name,
      url: `https://ai-trading-platform.com/trading/${p.slug}`,
    })),
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <main id="primary" className="lucky-site-main btt-single">
      <div className="btt-best">
        <header className="btt-best__header">
          <p className="btt-best__kicker">Updated {new Date().getFullYear()} · Independent reviews</p>
          <h1 className="btt-best__title">{title}</h1>
          <p className="btt-best__subtitle">{subtitle}</p>
        </header>

        <aside className="btt-best__disclosure" role="note">
          <strong>Disclosure:</strong> Some links on this page are affiliate links. If you open an
          account through them, we may earn a commission at no cost to you. This never affects our
          rankings, which are editorial. Automated trading is high-risk: most retail traders lose
          money.
        </aside>

        <div className="btt-best__body">
          <h2 className="btt-best__h2">The top 10, at a glance</h2>
          <div className="btt-table-wrap">
            <table className="btt-best__table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Platform</th>
                  <th scope="col">Score</th>
                  <th scope="col">Min deposit</th>
                  <th scope="col">Demo</th>
                  <th scope="col">Support</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {BEST_PLATFORMS.map((p) => (
                  <tr key={p.slug}>
                    <td className="btt-best__rank">{p.rank}</td>
                    <td>
                      <Link href={`/trading/${p.slug}`}>{p.name}</Link>
                    </td>
                    <td className="btt-best__score">{p.score.toFixed(1)}</td>
                    <td>{p.minDeposit}</td>
                    <td>{p.demo}</td>
                    <td>{p.support}</td>
                    <td>
                      <a
                        className="btt-best__cta"
                        href={ctaHref(p.slug)}
                        rel="sponsored nofollow noopener noreferrer"
                        target="_blank"
                      >
                        Visit site
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="btt-best__h2">Full reviews</h2>
          <div className="btt-best__list">
            {BEST_PLATFORMS.map((p) => (
              <article key={p.slug} className="btt-best__item">
                <div className="btt-best__item-head">
                  <span className="btt-best__item-rank">{p.rank}</span>
                  <div className="btt-best__item-title">
                    <h3>
                      <Link href={`/trading/${p.slug}`}>{p.name}</Link>
                    </h3>
                    <p>{p.tagline}</p>
                  </div>
                  <div className="btt-best__item-score">
                    <span className="btt-best__score-num">{p.score.toFixed(1)}</span>
                    <span className="btt-best__score-label">/ 5</span>
                    <span className="btt-best__stars" aria-hidden="true">
                      <span
                        className="btt-best__stars-fill"
                        style={{ width: stars(p.score) }}
                      />
                    </span>
                  </div>
                </div>

                <div className="btt-best__cols">
                  <div className="btt-best__col">
                    <h4 className="btt-best__col-title btt-best__col-title--pro">Pros</h4>
                    <ul className="btt-best__pros">
                      {p.pros.map((pro) => (
                        <li key={pro}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="btt-best__col">
                    <h4 className="btt-best__col-title btt-best__col-title--con">Cons</h4>
                    <ul className="btt-best__cons">
                      {p.cons.map((con) => (
                        <li key={con}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="btt-best__verdict">{p.verdict}</p>

                <div className="btt-best__item-actions">
                  <a
                    className="btt-best__cta btt-best__cta--lg"
                    href={ctaHref(p.slug)}
                    rel="sponsored nofollow noopener noreferrer"
                    target="_blank"
                  >
                    Visit {p.name}
                  </a>
                  <Link className="btt-best__review-link" href={`/trading/${p.slug}`}>
                    Read full review
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <section className="btt-best__faq">
            <h2 className="btt-best__h2">Frequently asked questions</h2>
            {faq.map((f) => (
              <div key={f.q} className="btt-best__faq-item">
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
      <JsonLd data={JSON.stringify(jsonLd)} />
      <JsonLd data={JSON.stringify(faqLd)} />
    </main>
  );
}
