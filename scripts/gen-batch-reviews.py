#!/usr/bin/env python3
"""
Generate a batch of keyword-only trading reviews in the site's existing structure.

Honest-content policy (per editorial constraints):
  - $250 minimum deposit is the one specific figure (provided by the owner).
  - No invented sub-ratings, no fake "we tested support" anecdotes, no fabricated
    regulator/broker claims. Where a fact can't be verified it is stated as such.
  - Rating stays in the "Worth Considering" band (4.2-4.4), within the 4.2-4.7 range.
  - CTA uses the site default (vectorai360.com ?f={slug}&subid=BIT&src=ATP), no override.
"""
import json, re, os, glob
from datetime import datetime, timedelta, timezone

SITE = "https://ai-trading-platform.com"
ORG = {"@type": "Organization", "@id": f"{SITE}/#organization", "name": "AI Trading Platform", "url": SITE}
BASE_DATE = datetime(2026, 9, 30, 23, 50, tzinfo=timezone.utc)

AUTHORS = [
    ("danielcarter", "Daniel Carter"),
    ("jameswhitmore", "James Whitmore"),
    ("oliviabennett", "Olivia Bennett"),
    ("michaelbrooks", "Michael Brooks"),
    ("sophiareynolds", "Sophia Reynolds"),
]

# name -> one-sentence name analysis (observable, not invented data)
BRANDS = [
    ("Al Instant Trade", "Al Instant Trade stacks a familiar AI-era prefix with “instant” and “trade”, a name built to sound immediate and automated."),
    ("Quantum AI Mike Cannon-Brookes", "This one borrows the name of a well-known Australian tech founder next to “quantum” and “AI” — a celebrity-name hook that almost always signals a pitch unrelated to the person named."),
    ("Quantum AI", "Quantum AI pairs “quantum” with “AI”, two buzzwords that imply sophistication without describing anything concrete."),
    ("Trader GPT AI", "Trader GPT AI borrows the “GPT” label to ride the AI wave, joined to “trader” and “AI”."),
    ("BeInveron", "BeInveron fuses “be” with an invented “inveron” that gestures at “invest” — a made-up word built to sound established."),
    ("Juste Capitholm", "Juste Capitholm pairs the French “juste” (just, fair) with an invented “capitholm” leaning on “capital”."),
    ("Vol Handelsburg", "Vol Handelsburg combines a “vol” shorthand for volatility with “handels”, the German word for trade, plus a “burg” suffix for old-world weight."),
    ("Logic Fundvex", "Logic Fundvex stacks “logic”, “fund”, and a “vex” suffix, a name built to sound analytical and precise."),
    ("Traderai", "Traderai runs “trader” and “AI” together — an obvious category label rather than a real brand."),
    ("Fort Trésorique", "Fort Trésorique pairs “fort” with a French “trésorique” built on “trésor” (treasure), to sound like a stronghold for wealth."),
    ("Wold Monridge", "Wold Monridge combines a “wold” (open country) with an invented “monridge”, a name that sounds geographic and settled."),
    ("Haven Fundmere", "Haven Fundmere pairs “haven” with “fund”, two safety words, plus a “mere” suffix."),
    ("Regalis Inviora", "Regalis Inviora uses “regalis” (royal, from Latin) with an invented “inviora” — a name built to sound exclusive."),
    ("Sunforge Tradeviax", "Sunforge Tradeviax combines “sunforge” with “trade”, suggesting something forged and bright, plus a “viax” flourish."),
    ("Qiro DAIX App", "Qiro DAIX App uses an invented “qiro” with an all-caps “DAIX” — a name built to look technical and AI-era."),
    ("Finarvex", "Finarvex fuses “fin” (finance) with an invented “arvex” suffix."),
    ("Stakeli", "Stakeli leans on “stake”, as in crypto staking, with a friendly “-li” ending."),
    ("Thorn Fondwell", "Thorn Fondwell pairs “thorn” with “fondwell”, mixing an edge with a word built on “fund” and “well”."),
    ("Mercerholm", "Mercerholm combines “mercer” (a merchant) with a “holm” suffix for old-world weight."),
    ("Kramuzgolu", "Kramuzgolu is a wholly invented word with no obvious meaning — a name chosen to be unique rather than descriptive."),
    ("Cristal Fondion", "Cristal Fondion pairs “cristal” with an invented “fondion” leaning on “fund”."),
    ("IntesaTradeAI", "IntesaTradeAI uses “intesa” (Italian for agreement) with “trade” and “AI”."),
    ("Prime Worthaniance", "Prime Worthaniance stacks “prime”, “worth”, and an invented “aniance” suffix, a name built around value."),
    ("Feravixio", "Feravixio is an invented word with no clear meaning, styled to sound fintech."),
    ("Solide Négocerine", "Solide Négocerine pairs French “solide” (solid) with an invented “négocerine” built on “négocier” (to trade)."),
    ("Sommélor Wealth", "Sommélor Wealth joins an invented “sommélor” with “wealth” — a name built to sound European and affluent."),
    ("Earnings Bank", "Earnings Bank borrows the word “bank” to sound like a financial institution, alongside “earnings”."),
    ("Vang Drivmor", "Vang Drivmor combines an invented “vang” with “drivmor”, a name with no clear meaning."),
    ("Biton Capital", "Biton Capital echoes “bitcoin” in “biton” and adds “capital” to sound institutional."),
    ("Investklar", "Investklar fuses “invest” with German “klar” (clear), suggesting transparent investing."),
    ("Vívida Cuentavesa", "Vívida Cuentavesa pairs Spanish “vívida” (vivid) with “cuenta” (account) to sound lively and established."),
    ("Onde Rendange", "Onde Rendange uses French “onde” (wave) with an invented “rendange” built on “rendement” (yield)."),
    ("StraitsVault AI", "StraitsVault AI combines “straits” and “vault” with “AI”, a name built on safety and tech."),
    ("AlphaTrade AI", "AlphaTrade AI pairs “alpha” (the goal of beating the market) with “trade” and “AI”."),
    ("Aur Markstead", "Aur Markstead uses “aur” (Latin for gold) with an invented “markstead” for old-world solidity."),
    ("IATrade", "IATrade runs “IA” (the AI abbreviation in several languages) into “trade”, a compact category label."),
    ("Tradelaide", "Tradelaide blends “trade” with “adelaide”, a name that sounds like a place and a business at once."),
    ("Zhokvarit", "Zhokvarit is a wholly invented word with no obvious meaning, chosen to be unique."),
    ("Opolium", "Opolium is an invented word styled to sound established, with no clear meaning."),
]

ANGLES = ["What You Should Know", "Is It Legit?", "Our Honest Take", "What We Could Verify"]

def slugify(name):
    s = name.lower().strip()
    # Drop accented/non-ASCII chars entirely (site convention: "Fênix Rendório" -> "fnix-rendrio"),
    # then collapse remaining non-alphanumerics to hyphens.
    s = "".join(ch for ch in s if ord(ch) < 128)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")

def brand_name_plain(name):
    # for the schema itemReviewed name, just the brand (no title suffix)
    return name.strip()

def h(s):
    x = 0
    for ch in s:
        x = (x * 31 + ord(ch)) & 0x7fffffff
    return x

def title_for(name):
    for angle in ANGLES:
        t = f"{name} Review 2026: {angle}"
        if len(t) <= 60:
            return t
    return f"{name} Review 2026"  # fallback, should be rare

def meta_for(name, idx):
    q = "Is {b} safe? Read our review before you sign up — what we could verify, the $250 minimum deposit, and the risks to check."
    f = "{b} review — what we could verify, the $250 minimum deposit, and the warning signs to check before you sign up."
    t = q if idx % 2 == 0 else f
    return t.format(b=name)

def rating_for(name):
    return round(4.2 + (h(name) % 3) * 0.1, 1)  # 4.2 / 4.3 / 4.4 (Worth Considering)

def excerpt_for(name):
    return f"{name} pitches automated AI trading with a $250 minimum deposit — but we couldn’t verify its regulation."

def content_html(name, analysis):
    return (
        f"<p>{analysis} A name, though, is a marketing choice, not a credential — and the details matter far more than the branding.</p>\n"
        f"<p>Underneath that branding, this is one of many browser-based AI trading platforms. The pitch is familiar: a $250 starting deposit, automated or semi-automated execution, and confident language about returns. What matters is whether the operation behind the pitch can be verified.</p>\n"
        f"<h2>What {name} Actually Is</h2>\n"
        f"<p>Like most platforms in this category, {name} offers signal-assisted trading through a web dashboard. You set your preferences and let the system flag or place trades for you. The mechanics are ordinary; the real question is who is behind them.</p>\n"
        f"<h2>What We Could Verify</h2>\n"
        f"<p>We could not independently confirm who operates {name}, where it is regulated, or how long it has been running. A $250 minimum deposit is a standard entry point across this category — not evidence of legitimacy on its own.</p>\n"
        f"<h2>Before You Register: A Short Checklist</h2>\n"
        f"<ul>\n<li>Check the registration or licence number against the actual regulator.</li>\n<li>Confirm who owns and runs the platform.</li>\n<li>Start with the $250 minimum, and nothing more.</li>\n<li>Use any demo mode before going live.</li>\n</ul>\n"
        f"<h2>Costs Worth Knowing</h2>\n"
        f"<p>The minimum deposit is $250. Platform trading fees are not independently verified — confirm the exact fee and spread structure in the current terms before funding. Treat any “no fees” claim with the same caution as any other marketing.</p>\n"
        f"<h2>Risks to Keep in Mind</h2>\n"
        f"<p>Unverified regulation is the main one. An unregulated or loosely regulated platform can leave you with little recourse if funds go missing. Automation reduces effort, not risk, and no signal platform removes market risk.</p>\n"
        f"<h2>Where We Land on {name}</h2>\n"
        f"<p>{name} is an unverified platform with a polished name. We rate it within our standard band, but the rating is a category-level assessment — it is not a substitute for verifying regulation and ownership yourself. Deposit the $250 minimum only, use demo mode first, and never trade money you can’t afford to lose.</p>\n"
        f"<h2>Frequently Asked Questions</h2>\n"
        f"<h3>What’s the minimum deposit for {name}?</h3>\n<p>$250. Start there before adding more.</p>\n"
        f"<h3>Is {name} regulated?</h3>\n<p>We couldn’t independently verify a regulator. Check the registration number yourself.</p>\n"
        f"<h3>Does {name} charge platform fees?</h3>\n<p>Not independently verified. Confirm the fee and spread structure in the current terms.</p>\n"
        f"<h3>Does automation remove the risk of losing money?</h3>\n<p>No. It reduces effort, not risk. Monitor your positions regularly.</p>\n"
    )

def word_count(html):
    return len(re.sub(r"<[^>]+>", " ", html).split())

def article_jsonld(name, title, desc, author_name, author_slug, slug, date, wc):
    return json.dumps({
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Article",
                "@id": f"{SITE}/trading/{slug}#article",
                "isPartOf": {"@id": f"{SITE}/trading/{slug}"},
                "author": dict(ORG),
                "headline": title,
                "datePublished": date,
                "mainEntityOfPage": {"@id": f"{SITE}/trading/{slug}"},
                "wordCount": wc,
                "commentCount": 0,
                "articleSection": ["Trading"],
                "inLanguage": "en-US",
                "potentialAction": [
                    {"@type": "CommentAction", "name": "Comment",
                     "target": [f"{SITE}/trading/{slug}#respond"]}
                ],
            },
            {
                "@type": "WebPage",
                "@id": f"{SITE}/trading/{slug}",
                "url": f"{SITE}/trading/{slug}",
                "name": title,
                "isPartOf": {"@id": f"{SITE}/#website"},
                "datePublished": date,
                "author": dict(ORG),
                "description": desc,
                "breadcrumb": {"@id": f"{SITE}/trading/{slug}#breadcrumb"},
                "inLanguage": "en-US",
                "potentialAction": [
                    {"@type": "ReadAction", "target": [f"{SITE}/trading/{slug}"]}
                ],
            },
            {
                "@type": "BreadcrumbList",
                "@id": f"{SITE}/trading/{slug}#breadcrumb",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
                    {"@type": "ListItem", "position": 2, "name": title},
                ],
            },
        ],
    }, ensure_ascii=True)

def review_jsonld(name, rating, author_name, date):
    return json.dumps({
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Review",
                "itemReviewed": {
                    "@type": "SoftwareApplication",
                    "name": name,
                    "applicationCategory": "FinanceApplication",
                    "applicationSubCategory": "AI trading platform",
                    "operatingSystem": "Web",
                },
                "reviewRating": {"@type": "Rating", "ratingValue": str(rating), "bestRating": "5", "worstRating": "1"},
                "author": dict(ORG),
                "datePublished": date,
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {"@type": "Question", "name": f"What’s the minimum deposit for {name}?",
                     "acceptedAnswer": {"@type": "Answer", "text": "$250. Start there before adding more."}},
                    {"@type": "Question", "name": f"Is {name} regulated?",
                     "acceptedAnswer": {"@type": "Answer", "text": "We couldn’t independently verify a regulator. Check the registration number yourself."}},
                    {"@type": "Question", "name": f"Does {name} charge platform fees?",
                     "acceptedAnswer": {"@type": "Answer", "text": "Not independently verified. Confirm the fee and spread structure in the current terms."}},
                    {"@type": "Question", "name": "Does automation remove the risk of losing money?",
                     "acceptedAnswer": {"@type": "Answer", "text": "No. It reduces effort, not risk. Monitor your positions regularly."}},
                ],
            },
        ],
    }, ensure_ascii=True)

def main():
    posts_dir = "content/posts/trading"
    existing_slugs = set(f.replace(".json", "") for f in os.listdir(posts_dir) if f.endswith(".json"))

    created = []
    for i, (name, analysis) in enumerate(BRANDS):
        slug = slugify(name) + "-review"
        if slug in existing_slugs:
            print(f"SKIP (exists): {slug}")
            continue

        author_slug, author_name = AUTHORS[i % len(AUTHORS)]
        date = (BASE_DATE - timedelta(minutes=i * 7)).strftime("%Y-%m-%dT%H:%M:%S+00:00")
        title = title_for(name)
        desc = meta_for(name, i)
        rating = rating_for(name)
        excerpt_plain = excerpt_for(name)
        content = content_html(name, analysis)
        wc = word_count(content)
        reading_time = f"{max(2, round(wc / 200))} min read"

        post = {
            "type": "trading",
            "slug": slug,
            "title": title,
            "description": desc,
            "author": author_name,
            "authorSlug": author_slug,
            "date": date,
            "readingTime": reading_time,
            "categories": ["trading"],
            "excerpt": f"\n        <p>{excerpt_plain}</p>\n    ",
            "content": content,
            "jsonLd": article_jsonld(name, title, desc, author_name, author_slug, slug, date, wc),
            "ogImage": "",
            "reviewJsonLd": review_jsonld(name, rating, author_name, date),
        }

        with open(os.path.join(posts_dir, slug + ".json"), "w") as f:
            f.write(json.dumps(post, separators=(",", ":"), ensure_ascii=True))

        created.append({
            "name": name, "slug": slug, "author_slug": author_slug, "author_name": author_name,
            "date": date, "rating": rating, "title": title, "excerpt": excerpt_plain,
            "reading_time": reading_time,
        })
        print(f"CREATED: {slug:35} rating={rating} author={author_slug}")

    print(f"\nTotal created: {len(created)}")
    return created

if __name__ == "__main__":
    created = main()
    # stash the created list for the manifest step
    with open("/tmp/created_reviews.json", "w") as f:
        json.dump(created, f, ensure_ascii=True)
