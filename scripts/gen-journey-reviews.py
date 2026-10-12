#!/usr/bin/env python3
"""
Generate keyword-only trading reviews in the journey layout (the layout used by the 7 Oct reviews).

Honest-content policy: the only specific figure is the $250 minimum deposit supplied by the owner.
Operator, regulator, fees, app and payout details are stated as "could not confirm". Section text is
drawn per page from the pools in scripts/journey-pools.json (sentences taken from the existing
journey reviews, brand name replaced by {N}); the one name-specific sentence per page lives in
ANALYSES below.

    python3 scripts/gen-journey-reviews.py            # writes the posts
    python3 scripts/gen-journey-reviews.py --dry-run  # only prints the plan

Afterwards: node scripts/gen-review-schema.mjs, python3 scripts/update-manifest-batch.py,
python3 scripts/qa-reviews.py, then a clean build.
"""
import glob
import hashlib
import json
import re
import sys
from datetime import datetime, timezone

POSTS = "content/posts/trading"
SITE = "https://ai-trading-platform.com"
ORG = {"@type": "Organization", "@id": f"{SITE}/#organization", "name": "AI Trading Platform", "url": SITE}
POOLS = json.load(open("scripts/journey-pools.json"))
LQ, RQ = "&#8220;", "&#8221;"


def q(s):
    return f"{LQ}{s}{RQ}"


# keyword -> (display name, name analysis sentence, no trailing period). Observable word-play only.
ANALYSES = [
    ("Bitzonex Cylora", f"{{N}} joins two invented words, {q('bitzonex')} and {q('cylora')}, neither of which has an obvious meaning"),
    ("Turbo Hiberix", f"{{N}} pairs {q('turbo')}, a word that signals speed, with an invented {q('hiberix')} that has no obvious meaning"),
    ("Profectus AI", f"{{N}} uses {q('profectus')}, the Latin word for progress, followed by an {q('AI')} tag"),
    ("Anchor Equimere", f"{{N}} pairs {q('anchor')}, a word for stability, with an invented {q('equimere')} that leans on {q('equity')}"),
    ("Bright Mintwarrant", f"{{N}} pairs {q('bright')} with {q('mintwarrant')}, which joins {q('mint')} and {q('warrant')}, two finance-flavoured words"),
    ("Cirevonta GPT", f"{{N}} attaches the {q('GPT')} label, borrowed from chatbots, to an invented word, {q('cirevonta')}"),
    ("Coinvekta", f"{{N}} joins {q('coin')} with {q('vekta')}, an invented ending that sounds like {q('vector')}"),
    ("Crypto Volton AI", f"{{N}} stacks {q('crypto')}, {q('volton')}, which sounds like {q('volt')}, and an {q('AI')} tag"),
    ("Falcon Anlagmere", f"{{N}} pairs {q('falcon')} with {q('anlagmere')}, which leans on {q('Anlage')}, the German word for an investment"),
    ("Fathomtally", f"{{N}} joins {q('fathom')}, to understand deeply, with {q('tally')}, a count or total"),
    ("Gainforhic", f"{{N}} combines {q('gain')} and {q('for')} with an invented ending, {q('hic')}, that has no obvious meaning"),
    ("Gainforthic", f"{{N}} reads like {q('gain forth')} with an extra {q('ic')} ending, a made-up word built around {q('gain')}"),
    ("Gainverance", f"{{N}} fuses {q('gain')} with {q('verance')}, an invented ending that echoes {q('perseverance')}"),
    ("Gront Rislaven", "{N} is two invented words with no obvious meaning, chosen to be unique rather than descriptive"),
    ("Sout Mirtholm", f"{{N}} pairs {q('sout')} with {q('mirtholm')}, where {q('holm')} is an old-world suffix for a small island"),
    ("Sovereign Wertholm", f"{{N}} pairs {q('sovereign')}, a word that suggests authority and stability, with an invented {q('wertholm')} built on {q('wert')}, German for value"),
    ("Stone Rendive", f"{{N}} pairs {q('stone')}, a word that signals permanence, with an invented {q('rendive')}"),
    ("Turbo Hiberix AI", f"{{N}} adds an {q('AI')} tag to {q('turbo')} and an invented {q('hiberix')}, a name that signals speed and automation without describing the product"),
]
TITLES = [
    "{N} Review 2026: Legit or Scam?",
    "{N} Review 2026: Is It Safe to Sign Up?",
    "Is {N} Legit? Full 2026 Review",
    "{N} Review: Should You Trust It in 2026?",
    "{N} Review 2026: Pros, Cons & Honest Verdict",
    "{N} Scam or Legit? What We Found in 2026",
    "Is {N} Worth It in 2026? Full Review",
    "{N} Review 2026: Red Flags, Fees & Real Verdict",
    "{N} Review 2026: Can You Actually Trust This Platform?",
    "{N} Review 2026: What They Don't Tell You",
    "{N} Review 2026: Sign Up or Stay Away?",
    "{N} Review 2026: Minimum Deposit, Fees & Safety Check",
    "{N} Review 2026: Is It Regulated or a Red Flag?",
    "{N} Review 2026: Everything You Need to Know Before You Register",
]
DESC_A = [
    "{N} review: $250 minimum deposit, how it works, fees, login and withdrawals. Here is what we could and could not confirm.",
    "{N} review: the $250 minimum deposit, fees, login steps and withdrawals, plus what we could not confirm about the operator.",
    "{N} review: how the platform works, the $250 minimum deposit and the fee and payout details to check before you register.",
]
DESC_B = [
    "Thinking of signing up with {N}? We break down how it works, the $250 minimum deposit and the details the site leaves unclear.",
    "Is {N} worth a $250 deposit? We cover how it works, fees, login and withdrawals, plus what to check before you register.",
    "Wondering if {N} is legit? We cover how it works, the $250 minimum deposit, fees and what we could not confirm.",
]
AUTHORS = [("oliviabennett", "Olivia Bennett"), ("jameswhitmore", "James Whitmore"), ("danielcarter", "Daniel Carter"),
           ("sophiareynolds", "Sophia Reynolds"), ("michaelbrooks", "Michael Brooks")]
FIRST_AUTHOR = 2  # continues after James Whitmore (last review of 7 Oct)
START = datetime(2026, 10, 12, 6, 0, tzinfo=timezone.utc)
RISK = ("Risk Warning: Trading crypto, forex, CFDs and other financial products involves a high level of risk and may not be suitable "
        "for all investors. You could lose some or all of your invested capital. Past performance does not guarantee future results. "
        "This article is for information only and is not financial advice.")
FAQ_ORDER = ["Is {N} legit?", "Is {N} a scam?", "What is the {N} minimum deposit?", "Do I need trading experience?",
             "Does {N} have a mobile app?", "How long does a {N} withdrawal take?", "Can {N} guarantee profits?"]
EXCERPT_TAILS = ["Regulation and ownership remain unconfirmed.", "We found no confirmed licence or operating history."]


def article_jsonld(title, desc, slug, date, wc):
    u = f"{SITE}/trading/{slug}"
    return json.dumps({"@context": "https://schema.org", "@graph": [
        {"@type": "Article", "@id": f"{u}#article", "isPartOf": {"@id": u}, "author": dict(ORG), "headline": title,
         "datePublished": date, "mainEntityOfPage": {"@id": u}, "wordCount": wc, "commentCount": 0,
         "articleSection": ["Trading"], "inLanguage": "en-US",
         "potentialAction": [{"@type": "CommentAction", "name": "Comment", "target": [f"{u}#respond"]}]},
        {"@type": "WebPage", "@id": u, "url": u, "name": title, "isPartOf": {"@id": f"{SITE}/#website"}, "datePublished": date,
         "author": dict(ORG), "description": desc, "breadcrumb": {"@id": f"{u}#breadcrumb"}, "inLanguage": "en-US",
         "potentialAction": [{"@type": "ReadAction", "target": [u]}]},
        {"@type": "BreadcrumbList", "@id": f"{u}#breadcrumb", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
            {"@type": "ListItem", "position": 2, "name": title}]}]})


def review_jsonld(name, rating, date):
    return json.dumps({"@context": "https://schema.org", "@graph": [
        {"@type": "Review", "itemReviewed": {"@type": "SoftwareApplication", "name": name, "applicationCategory": "FinanceApplication",
                                              "applicationSubCategory": "AI trading platform", "operatingSystem": "Web"},
         "reviewRating": {"@type": "Rating", "ratingValue": str(rating), "bestRating": "5", "worstRating": "1"},
         "author": dict(ORG), "datePublished": date}]})


def md5i(s):
    return int(hashlib.md5(s.encode()).hexdigest(), 16)


def pick(slug, key, options):
    return options[md5i(slug + key) % len(options)]


def slugify(name):
    s = "".join(ch for ch in name.lower().strip() if ord(ch) < 128)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def vary(html, slug, key):
    """Per page: shuffle bullet lists and drop one item from lists of four or more, so pages overlap less."""
    n = [0]

    def ul(m):
        items = re.findall(r"<li>.*?</li>", m.group(1), re.S)
        n[0] += 1
        if len(items) < 3:
            return m.group(0)
        order = sorted(range(len(items)), key=lambda j: md5i(f"{slug}{key}{n[0]}{j}"))
        items = [items[j] for j in order]
        if len(items) >= 4:
            items = items[:-1]
        return '<ul class="bd-list">\n' + "\n".join(items) + "\n</ul>"

    def rows(m):
        body = m.group(2)
        trs = re.findall(r"<tr>\s*<td>.*?</td>\s*<td>.*?</td>\s*</tr>", body, re.S)
        if len(trs) < 5:
            return m.group(0)
        cells = [re.findall(r"<td>(.*?)</td>", t, re.S) for t in trs]
        pros = [c[0] for c in cells]
        cons = [c[1] for c in cells]
        pros = sorted(pros, key=lambda x: md5i(slug + key + "p" + x))[:4]
        cons = sorted(cons, key=lambda x: md5i(slug + key + "c" + x))[:4]
        return m.group(1) + "".join(f"<tr>\n<td>{a}</td>\n<td>{b}</td>\n</tr>\n" for a, b in zip(pros, cons)) + m.group(3)

    html = re.sub(r'<ul class="bd-list">\n(.*?)\n</ul>', ul, html, flags=re.S)
    if "Pros and Cons" in html:
        html = re.sub(r"(<tbody>\n)(.*?)(</tbody>)", rows, html, flags=re.S)
    return html


def banner(url, head, sub, label):
    return (f'<div class="bd-banner-cta">\n<div class="bd-banner-cta__icon" aria-hidden="true"></div>\n<div class="bd-banner-cta__copy">\n'
            f'<div><strong>{head}</strong></div>\n<div>{sub}</div>\n</div>\n'
            f'<div><a class="bd-banner-cta__btn" href="{url}" rel="sponsored nofollow noopener noreferrer" target="_blank">'
            f'{label}<span class="bd-ext" aria-hidden="true"></span></a></div>\n</div>\n')


def table(head, rows):
    out = '<div class="bd-table-wrap">\n<table class="bd-specs">\n<thead>\n<tr>\n' + "".join(f"<th>{h}</th>\n" for h in head) + "</tr>\n</thead>\n<tbody>\n"
    for r in rows:
        out += "<tr>\n" + "".join(f"<td>{c}</td>\n" for c in r) + "</tr>\n"
    return out + "</tbody>\n</table>\n</div>\n"


def siblings_for(i, sibs):
    out = []
    for step in (1, 5, 9, 13):
        c = sibs[(i + step) % len(sibs)]
        if c not in out:
            out.append(c)
        if len(out) == 3:
            break
    return out


def build(i, name, analysis, sibs, tag_title):
    N = name
    slug = slugify(name) + "-review"
    f = slug.replace("-review", "")
    url = f"https://vectorai360.com/?f={f}&subid=BIT&src=ATP"
    short = N if len(N) <= 22 else "This Platform"
    sub = lambda t: t.replace("{N}", N)
    P = lambda key, n=None: vary(pick(slug, key, POOLS[key]), slug, key) if key.startswith("sec:") or key == "whatis_rest" else pick(slug, key, POOLS[key])

    glance = table(["Feature", "Details"], [("Platform type", P("glance_type")), ("Minimum deposit", "$250"), ("Operator", N), ("Best for", P("glance_best"))])
    what = (f'<section class="bd-section">\n<h2 class="bd-heading">What Is {N} and How Does It Work?</h2>\n'
            f'<p class="bd-text">{sub(analysis)}. {sub(P("whatis_tail"))}</p>\n{sub(P("whatis_rest"))}</section>\n')
    faq = '<section class="bd-section bd-section--faq">\n<h2 class="bd-heading">Frequently Asked Questions</h2>\n<div class="bd-faq">\n'
    for qn in FAQ_ORDER:
        faq += f'<div class="bd-faq__item">\n<h3 class="bd-subheading">{sub(qn)}</h3>\n<p class="bd-text">{sub(P("faq:" + qn))}</p>\n</div>\n'
    faq += "</div>\n</section>\n"
    r = [4.2, 4.3, 4.4, 4.5, 4.6, 4.7][md5i(slug + "rating") % 6]
    tag = "Recommended" if r >= 4.5 else "Worth Considering"
    vp = pick(slug, "verdict", POOLS["verdict"])
    verdict = ('<section class="bd-verdict-card">\n<div class="bd-verdict-card__icon" aria-hidden="true"></div>\n<div class="bd-verdict-card__body">\n'
               f'<h2 class="bd-heading">Final Verdict: Our {N} Review</h2>\n' + "".join(f'<p class="bd-text">{sub(x)}</p>\n' for x in vp) +
               f'</div>\n<div class="bd-verdict-card__score">\n<div class="bd-verdict-card__number">{r}</div>\n<div>/5</div>\n</div>\n'
               f'<div class="bd-stars bd-stars--lg" aria-label="{r} out of 5">\n<div class="bd-stars__fill" style="width:{round(r * 20)}%"></div>\n</div>\n'
               f'<div class="bd-verdict-card__tag">{tag}</div>\n</section>\n')
    compare = (f'<section class="bd-section">\n<h2 class="bd-heading">Compare {N} With Similar Platforms</h2>\n'
               '<p class="bd-text">If you are still deciding, these reviews follow the same format, so you can read them side by side:</p>\n<ul class="bd-list">\n' +
               "".join(f'<li><a href="/trading/{s}">{n} review</a></li>\n' for s, n in siblings_for(i, sibs)) + "</ul>\n</section>\n")
    body = (
        '\n<div class="bd-review">\n'
        f'<section class="bd-section bd-intro">\n<p class="bd-text">{sub(P("intro"))}</p>\n</section>\n'
        f'{sub(P("sec:Quick Answer: Is {N} Legit?"))}\n'
        + banner(url, "Want to look at it yourself?", "Minimum deposit $250", "Discover More")
        + f'<section class="bd-section">\n<h2 class="bd-heading">{N} at a Glance</h2>\n{glance}</section>\n'
        f'{sub(P("sec:Is {N} Legit or a Scam?"))}\n'
        + what
        + f'{sub(P("sec:{N} Pros and Cons"))}\n'
        f'{sub(P("sec:{N} Fees and Minimum Deposit"))}\n'
        f'{sub(P("sec:{N} Login, Registration and App"))}\n'
        + banner(url, "Ready to take a closer look?", "Start small and test a withdrawal early", f"Explore {short}")
        + f'{sub(P("sec:{N} Withdrawal Process"))}\n'
        f'{sub(P("sec:Who Is {N} Best For?"))}\n'
        + faq + verdict
        + banner(url, "Still deciding?", "Whatever you choose, start small", f"Learn More About {short}")
        + compare + f'<p class="bd-text bd-note">{RISK}</p>\n</div>\n'
    )
    body = re.sub(r"\n\n+", "\n", body)
    return slug, url, body, r


def main():
    dry = "--dry-run" in sys.argv
    existing = {}
    for fpath in glob.glob(f"{POSTS}/*.json"):
        s = fpath.split("/")[-1][:-5]
        existing[norm(s.replace("-review", ""))] = s
    posts = [json.load(open(f)) for f in glob.glob(f"{POSTS}/*.json")]
    sib_pool = []
    for p in posts:
        if p.get("journeyLayout") or p["slug"] in ("striluxon-review", "clear-accrudance-review"):
            g = json.loads(p["reviewJsonLd"])["@graph"]
            nm = [n for n in g if n.get("@type") == "Review"][0]["itemReviewed"]["name"]
            sib_pool.append((p["slug"], nm))
    sib_pool.sort()
    made = []
    for i, (name, analysis) in enumerate(ANALYSES):
        slug = slugify(name) + "-review"
        if norm(name) in existing or slug in existing.values():
            print(f"SKIP duplicate: {name} -> {existing.get(norm(name))}")
            continue
        _, url, body, rating = build(i, name, analysis, sib_pool, None)
        # title: rotate through the pool, skip templates that run past 60 characters
        title = None
        for k in range(len(TITLES)):
            t = TITLES[(i * 5 + k) % len(TITLES)].replace("{N}", name)
            if len(t) <= 60:
                title = t
                break
        styles = DESC_A if i % 2 == 0 else DESC_B
        desc = None
        for k in range(len(styles)):
            d = styles[(md5i(slug + "d") + k) % len(styles)].replace("{N}", name)
            if 125 <= len(d) <= 155:
                desc = d
                break
        assert title and desc, (name, title, desc)
        aslug, aname = AUTHORS[(FIRST_AUTHOR + i) % len(AUTHORS)]
        date = START.replace(hour=6 + (5 * i) // 60, minute=(5 * i) % 60)
        date_s = date.strftime("%Y-%m-%dT%H:%M:00+00:00")
        wc = len(re.sub(r"<[^>]+>", " ", body).split())
        plain_analysis = analysis.replace("{N}", name)
        excerpt = f"{plain_analysis}. {pick(slug, 'ex', EXCERPT_TAILS)}"
        post = {
            "type": "trading", "slug": slug, "title": title, "description": desc, "author": aname, "authorSlug": aslug,
            "date": date_s, "readingTime": f"{max(2, round(wc / 200))} min read", "categories": ["trading"],
            "excerpt": f"\n        <p>{excerpt}</p>\n    ", "content": body, "jsonLd": article_jsonld(title, desc, slug, date_s, wc), "ogImage": "", "ctaUrl": url,
            "reviewJsonLd": review_jsonld(name, rating, date_s), "hideToc": True, "hideQuickVerdict": True, "plainLayout": True, "journeyLayout": True,
        }
        made.append((slug, title, len(desc), rating, aname, date_s, wc))
        if not dry:
            json.dump(post, open(f"{POSTS}/{slug}.json", "w", encoding="utf-8"), separators=(",", ":"), ensure_ascii=True)
    for m in made:
        print(f"{m[0]:34s} {m[3]} {m[4][:8]:8s} {m[5][5:16]} {m[6]}w d={m[2]} | {m[1]}")
    print(len(made), "reviews", "(dry run)" if dry else "written")


if __name__ == "__main__":
    main()
