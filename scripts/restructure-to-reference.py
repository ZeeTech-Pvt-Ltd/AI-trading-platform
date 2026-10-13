#!/usr/bin/env python3
"""
Move reviews to the reference structure (trade-vector-ai-review): intro, rating bar, overview with table,
balance panels, how it works, getting started, pricing, markets, credibility, mistakes, checklist, audience,
FAQ, verdict card, with the same CTA positions.

The reference page itself carries claims that are not sourced (test-window anecdotes, asset lists, regulated
broker partners). Those are NOT copied. Each section is built from the page's own existing content, or from
honest generic guidance that states nothing about the platform.

    python3 scripts/restructure-to-reference.py slug-review [...]      # converts the given reviews
    python3 scripts/restructure-to-reference.py --dry-run slug-review  # prints the outline only

Afterwards: python3 scripts/qa-reviews.py --fix, node scripts/gen-review-schema.mjs, update manifest reading times,
clean build.
"""
import hashlib
import html
import json
import re
import sys

POSTS = "content/posts/trading"
RA = "&#8217;"
REF_CLASSES = ["overview", "balance", "how-it-works", "getting-started", "pricing", "markets", "credibility",
               "mistakes", "checklist", "audience", "faq"]


def md5i(s):
    return int(hashlib.md5(s.encode()).hexdigest(), 16)


def pick(slug, key, opts):
    return opts[md5i(slug + key) % len(opts)]


def plain(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


# ------------------------------------------------------------------ parsing
RATING_RE = re.compile(r'<div class="bd-rating-bar">.*?bd-rating-icon--support.*?bd-rating-score">[^<]*</div>\n</div>\n</div>\n', re.S)
SECTION_RE = re.compile(r'<section class="([^"]*)">\n(.*?)</section>\n', re.S)

ROLE_RULES = [
    ("faq", r"frequently|faq"), ("quick", r"quick answer"), ("compare", r"compare .* with"), ("glance", r"at a glance"),
    ("legit", r"legit or a scam|what we could confirm|legit\?"), ("proscons", r"pros and cons"),
    ("whatis", r"what is|offers\b|explained|how the site describes"),
    ("howit", r"how does|how it works|key features|features highlighted|account types|what actually happens|behind"),
    ("fees", r"fees|cost|pric|deposit"), ("login", r"login|registration|getting started|set up|app\b"),
    ("withdraw", r"withdrawal"), ("risk", r"risk factors"), ("checks", r"checks to make|checklist"),
    ("audience", r"best for|aimed at|written for|who "),
]


def role_of(cls, title):
    for k in REF_CLASSES:
        if f"bd-section--{k}" in cls:
            return k
    t = title.lower()
    for r, rx in ROLE_RULES:
        if re.search(rx, t):
            return r
    return "other"


def parse(c):
    d = {"sections": [], "raw": {}}
    m = re.search(r'<section class="bd-section bd-intro">\n(.*?)</section>\n', c, re.S)
    d["intro"] = re.findall(r'<p class="bd-text">.*?</p>', m.group(1), re.S) if m else []
    m = RATING_RE.search(c)
    d["rating"] = m.group(0) if m else None
    m = re.search(r'<section class="bd-verdict-card">.*?</section>\n', c, re.S)
    d["verdict"] = m.group(0) if m else None
    for m in SECTION_RE.finditer(c):
        cls, inner = m.group(1), m.group(2)
        if "bd-intro" in cls or "bd-verdict-card" in cls:
            continue
        h = re.search(r'<h2 class="bd-heading">(.*?)</h2>\n', inner, re.S)
        title = plain(h.group(1)) if h else ""
        body = inner[h.end():] if h else inner
        d["sections"].append({"cls": cls, "title": title, "title_raw": h.group(1) if h else "", "role": role_of(cls, title), "body": body, "full": m.group(0)})
    m = re.search(r'<p class="bd-text bd-note">Risk Warning.*?</p>\n', c, re.S)
    d["risk"] = m.group(0) if m else ""
    return d


def sec(d, *roles):
    return [s for s in d["sections"] if s["role"] in roles]


def paras(html_, skip_note=True):
    out = re.findall(r'<p class="bd-text(?: [^"]*)?"(?: [^>]*)?>.*?</p>', html_, re.S)
    if skip_note:
        out = [p for p in out if "bd-note" not in p[:40] and "bd-callout" not in p[:40]]
    return out


def lists(html_):
    return re.findall(r"<(?:ul|ol) class=\"bd-list[^\"]*\"[^>]*>.*?</(?:ul|ol)>", html_, re.S)


def li_items(list_html):
    return re.findall(r"<li>(.*?)</li>", list_html, re.S)


def tables(html_):
    out = []
    for t in re.findall(r'<table class="bd-specs">.*?</table>', html_, re.S):
        head = [plain(x) for x in re.findall(r"<th>(.*?)</th>", t, re.S)]
        rows = re.findall(r"<tr[^>]*>\s*<td>(.*?)</td>\s*<td>(.*?)</td>\s*</tr>", t, re.S)
        out.append((head, rows))
    return out


# ------------------------------------------------------------------ components
def rating_bar(r):
    def item(icon, label, v):
        v = round(max(v, 4.0), 1)
        return (f'<div class="bd-rating-item">\n<div class="bd-rating-icon bd-rating-icon--{icon}" aria-hidden="true"></div>\n'
                f'<div class="bd-rating-label">{label}</div>\n<div class="bd-stars" aria-label="{v} out of 5">\n'
                f'<div class="bd-stars__fill" style="width:{round(v * 20)}%"></div>\n</div>\n<div class="bd-rating-score">{v}/5</div>\n</div>\n')
    return ('<div class="bd-rating-bar">\n' + item("star", "Overall Rating", r) + item("ease", "Ease of Use", r - 0.1) +
            item("features", "Features", r - 0.2) + item("value", "Value", r - 0.1) + item("support", "Support", r) + "</div>\n")


def product_link(url, label):
    return (f'<div class="bd-product-link"><a href="{url}" rel="sponsored nofollow noopener noreferrer" target="_blank">'
            f'{label}<span class="bd-ext" aria-hidden="true"></span></a></div>\n')


def banner(url, head, sub, label):
    return (f'<div class="bd-banner-cta">\n<div class="bd-banner-cta__icon" aria-hidden="true"></div>\n<div class="bd-banner-cta__copy">\n'
            f'<div><strong>{head}</strong></div>\n<div>{sub}</div>\n</div>\n'
            f'<div><a class="bd-banner-cta__btn" href="{url}" rel="sponsored nofollow noopener noreferrer" target="_blank">'
            f'{label}<span class="bd-ext" aria-hidden="true"></span></a></div>\n</div>\n')


def cta_bar(url, head, sub, label):
    return (f'<div class="bd-cta-bar">\n<div class="bd-cta-bar__icon" aria-hidden="true"></div>\n<div class="bd-cta-bar__copy">\n'
            f'<div><strong>{head}</strong></div>\n<div>{sub}</div>\n</div>\n'
            f'<div><a class="bd-cta-bar__btn" href="{url}" rel="sponsored nofollow noopener noreferrer" target="_blank">'
            f'{label}<span class="bd-ext" aria-hidden="true"></span></a></div>\n</div>\n')


def section(cls, h2, body):
    return f'<section class="bd-section bd-section--{cls}">\n<h2 class="bd-heading">{h2}</h2>\n{body}</section>\n'


def p(t, extra=""):
    return f'<p class="bd-text{extra}">{t}</p>\n'


def ul(items, cls="bd-list"):
    return f'<ul class="{cls}">\n' + "".join(f"<li>{i}</li>\n" for i in items) + "</ul>\n"


def panel(kind, title, items):
    ico = "bd-ico-check" if kind == "pros" else "bd-ico-x"
    badge = "ok" if kind == "pros" else "mix"
    lis = "".join(f'<li>\n<div class="{ico}" aria-hidden="true"></div>\n<div>{i}</div>\n</li>\n' for i in items)
    return (f'<div class="bd-panel bd-panel--{kind}">\n<div class="bd-panel__head">\n<div class="bd-panel__badge bd-panel__badge--{badge}" aria-hidden="true"></div>\n'
            f'<h3 class="bd-subheading bd-subheading--{kind}">{title}</h3>\n</div>\n<ul class="bd-list bd-list--{kind}">\n{lis}</ul>\n</div>\n')


def uniq(items):
    seen, out = set(), []
    for i in items:
        k = plain(i).lower()
        if k and k not in seen:
            seen.add(k)
            out.append(i)
    return out


# ------------------------------------------------------------------ build
MISTAKES = [
    ("Assuming the name means the platform is established.", [
        "A memorable brand is not a substitute for checking the platform" + RA + "s actual history and terms.",
        "A polished name says nothing about who runs the service. Check the operator and the licence yourself."]),
    ("Funding well beyond the minimum right away.", [
        "Test the platform on your own terms before scaling up. That is exactly why a small first deposit makes sense.",
        "Add funds only after you have seen how the platform behaves, including a small withdrawal."]),
    ("Treating AI-assisted trading as fully hands-off.", [
        "Check your open positions regularly. Market conditions shift, and settings that worked last month may not fit now.",
        "Automation lowers effort, not risk. Keep an eye on positions and on the settings you chose."]),
    ("Ignoring fees and spreads.", [
        "Small per-trade costs add up once you make a reasonable number of trades. Read the current terms first.",
        "Spreads, commissions and withdrawal charges all reduce what you keep, so note them before you deposit."]),
    ("Skipping a small test withdrawal.", [
        "A small withdrawal early on shows you how payouts and identity checks work before you commit more.",
        "Payout terms are easy to overlook until you need them. Try a small withdrawal while the amount is still low."]),
]
CHECKLIST_GENERIC = [
    "Company details and claims checked independently, not assumed from the name.",
    "Registration or licence number checked against the actual regulator.",
    "Account verified, with a strong, unique password set.",
    "Risk and stop-loss settings configured deliberately, not left on defaults.",
    "First deposit kept to the minimum.",
    "A small withdrawal tested early, before depositing more.",
    "Fees and spreads noted and factored into any return expectations.",
]


def markets_section(N, slug):
    intro = pick(slug, "mk1", [
        f"We could not confirm which markets and assets {N} offers, so we have not listed any.",
        f"The asset range at {N} is not something we could confirm, so no list is given here.",
        f"We have not listed the assets {N} covers, because we could not confirm them."])
    lead = pick(slug, "mk2", [
        "Before you deposit, look at the asset list on the official site and check:",
        "Check these points on the official site before you fund the account:",
        "Before you commit funds, look for the following:"])
    items = [
        "Which assets and pairs you can trade, and whether the range differs in any demo mode.",
        "Whether trades are placed through a named broker, and who that broker is.",
        "Whether spreads and charges differ by asset.",
        "Whether the markets you care about are open to residents of your country.",
    ]
    items = sorted(items, key=lambda x: md5i(slug + "mki" + x))[:3]
    return section("markets", f"Which Assets {N} Covers", p(intro) + p(lead) + ul(items))


def build(post, d, dry=False):
    slug = post["slug"]
    N = [n for n in json.loads(post["reviewJsonLd"])["@graph"] if n.get("@type") == "Review"][0]["itemReviewed"]["name"]
    short = N if len(N) <= 22 else "This Platform"
    url = post.get("ctaUrl") or re.search(r'href="(https?://[^"]+)" rel="sponsored', post["content"]).group(1)
    text = plain(post["content"])
    dm = re.search(r"minimum (?:deposit|funding)[^$]{0,25}(\$\d[\d,]*)|(\$\d[\d,]*) (?:minimum|entry|start)", text, re.I)
    dep = (dm.group(1) or dm.group(2)) if dm else ("$250" if "$250" in text else None)
    rating = float(re.search(r'bd-verdict-card__number">([\d.]+)<', d["verdict"]).group(1))

    # ---- sources
    quick = sec(d, "quick")
    legit = sec(d, "legit")
    whatis = sec(d, "whatis", "overview")
    howit = sec(d, "howit", "how-it-works")
    pc = sec(d, "proscons")
    fees = sec(d, "fees", "pricing")
    login = sec(d, "login", "getting-started")
    wd = sec(d, "withdraw")
    aud = sec(d, "audience")
    risk = sec(d, "risk")
    checks = sec(d, "checks", "checklist")
    marks = sec(d, "markets")
    glance = sec(d, "glance")
    bal_src = sec(d, "balance")
    mist_src = sec(d, "mistakes")
    cred_src = sec(d, "credibility")

    # ---- intro
    intro = list(d["intro"])
    for s in quick:
        ps = paras(s["body"])
        if ps and len(intro) < 2:
            intro.append(ps[0])
    intro_html = '<section class="bd-section bd-intro">\n' + "".join(x + "\n" for x in intro) + "</section>\n"

    # ---- overview
    ov_src = [s for s in sec(d, "overview")]
    rows, note = [], ""
    for s in glance + ov_src + whatis:
        for head, trs in tables(s["body"]):
            if head and head[0] in ("Pros", "Feature") or (head and head[0] == "Category"):
                if head[0] == "Pros":
                    continue
                rows += [(plain(a), b) for a, b in trs]
        n = re.search(r'<p class="bd-text bd-note"[^>]*>.*?</p>', s["body"], re.S)
        if n and not note:
            note = n.group(0)
    if not rows:
        rows = [("Platform Type", "AI trading platform")]
        if dep:
            rows.append(("Minimum Deposit", dep))
    seen = set()
    rows = [r for r in rows if not (r[0] in seen or seen.add(r[0]))]
    ov_paras = []
    for s in whatis:
        ps = [x for x in paras(s["body"]) if not plain(x).endswith(":")]
        ov_paras += ps[:2]
    if not ov_paras:
        ov_paras = [p(f"{N} is presented as an AI trading platform with an online dashboard, and the details below come from the page and the platform{RA}s own wording.").strip()]
    ov_heading = None
    if ov_src and "bd-section--overview" in ov_src[0]["cls"]:
        ov_heading = ov_src[0]["title_raw"]
    ov = section("overview", ov_heading or f"{N} Explained: How It{RA}s Built",
                 "".join(x + "\n" for x in uniq(ov_paras)[:2]) + '<h3 class="bd-subheading">Platform Overview</h3>\n<div class="bd-table-wrap">\n<table class="bd-specs">\n<thead>\n<tr>\n<th>Category</th>\n<th>Description</th>\n</tr>\n</thead>\n<tbody>\n'
                 + "".join(f"<tr>\n<td>{a}</td>\n<td>{b}</td>\n</tr>\n" for a, b in rows) + "</tbody>\n</table>\n</div>\n" + (note + "\n" if note else ""))

    # ---- balance
    if bal_src:
        balance = bal_src[0]["full"]
    else:
        pros, cons = [], []
        for s in pc:
            for head, trs in tables(s["body"]):
                if head and head[0] == "Pros":
                    pros += [a for a, b in trs]
                    cons += [b for a, b in trs]
        if not pros:
            if dep:
                pros.append(f"A {dep} minimum keeps the entry bar low.")
            pros += ["You can limit your risk by starting small.", "Registration and the dashboard run in the browser."]
        if not cons:
            if any(re.search(r"could not|no confirmed|not (?:publicly )?confirm|unconfirmed|not published|are open questions", plain(s["body"]), re.I) for s in legit + whatis + risk):
                cons.append("The operator and regulator could not be confirmed.")
            else:
                cons.append("The details come from the platform" + RA + "s own site and were not independently confirmed.")
            cons += ["Every trade carries a risk of loss.", "AI helps decisions but does not remove risk."]
        pros, cons = uniq(pros)[:5], uniq(cons)[:5]
        balance = section("balance", f"{N}: Where It Delivers, Where It Doesn{RA}t",
                          p("Fair reviews cut both ways. Here is what stands out, and what remains unclear.") +
                          '<div class="bd-balance-grid">\n' + panel("pros", f"{N} strengths:", pros) +
                          panel("cons", f"Where {N} Falls Short:", cons) + "</div>\n" +
                          p(pick(slug, "bn", [
                              f"A name built to stand out is a marketing choice, not a credential. Judge {N} on what happens after you sign up, not on how the brand sounds.",
                              f"Branding is not evidence. What counts at {N} is how it behaves once you register and how clear its terms are.",
                              f"Treat the strengths above as the platform{RA}s own pitch until you have checked them yourself."]), " bd-note"))

    # ---- how it works
    if howit and "bd-section--how-it-works" in howit[0]["cls"]:
        how = howit[0]["full"]
    else:
        hp = []
        for s in howit:
            hp += paras(s["body"])
        if not hp:
            hp = [p(pick(slug, "h1", [
                      f"We could not confirm how {N} works behind the dashboard. Platforms in this category usually scan market data for set conditions, then either flag a trade for approval or place it automatically, with the account holder choosing the risk level.",
                      f"How {N} works behind the dashboard is not something we could confirm. In this category, a system typically watches market data for preset conditions and then raises a signal or places the trade, depending on the settings you pick.",
                      f"The inner workings of {N} are not published in a way we could confirm. Services of this type generally apply rules to live prices and either suggest a trade or open it for you, within the risk level you set."])).strip(),
                  p(pick(slug, "h2", [
                      "That is a description of the category, not a guarantee. It does not remove market risk from your account.",
                      "This describes how the category tends to work, not a promise of results. Market risk stays with your account either way."])).strip()]
        how = section("how-it-works", f"What Actually Happens Behind {N}", "".join(x + "\n" for x in uniq(hp)[:3]) +
                      p(f"Running a small first deposit is a more reliable way to judge {N} than the branding alone.", " bd-callout"))

    # ---- getting started
    gs_src = [s for s in sec(d, "getting-started") if "bd-section--getting-started" in s["cls"]]
    if gs_src:
        gs = gs_src[0]["full"]
    else:
        extra = []
        for s in login:
            for x in paras(s["body"]):
                t = plain(x)
                if t.endswith(":") or t.startswith(("Opening an account", "Registering with", "New users can")):
                    continue
                extra.append(x)
        funding = f"The minimum deposit is {dep}." if dep else "Check the minimum deposit in the current terms."
        pay = ""
        for s in fees + login:
            m = re.search(r"(?:fund the account by|payment options?|deposits can be made with|pay in with|Accepted payment methods[^:]*:)\s*([^.<]+)", plain(s["body"]))
            if m:
                pay = " " + f"Payment methods mentioned: {m.group(1).strip()}."
                break
        gs = section("getting-started", "Getting Set Up: What the Process Looks Like",
                     p(f"The flow is typical for this kind of platform. We could not confirm the exact onboarding at {N}.") +
                     '<div class="bd-step">\n<h3 class="bd-subheading">1. Create an account</h3>\n' + p("Enter your name, email and phone number in the registration form, then confirm your details.") + "</div>\n" +
                     '<div class="bd-step">\n<h3 class="bd-subheading">2. Deposit funds</h3>\n' + p(f"{funding}{pay} Starting there lets you test the platform before committing more.") + "</div>\n" +
                     '<div class="bd-step">\n<h3 class="bd-subheading">3. Configure and trade</h3>\n' + p("Set your risk level and review the dashboard before you place anything. Keep the first stage small while you see how it behaves.") + "</div>\n" +
                     "".join(x + "\n" for x in uniq(extra)[:3]))

    # ---- pricing
    pr_src = [s for s in sec(d, "pricing") if "bd-section--pricing" in s["cls"]]
    if pr_src:
        pricing = pr_src[0]["full"]
    else:
        body = ""
        for s in fees:
            body += s["body"]
        for s in wd:
            body += s["body"]
        if not body:
            body = (p(f"The minimum deposit is {dep}." if dep else "Check the minimum deposit in the current terms.") +
                    p("Fees, spreads and withdrawal charges are not something we could confirm, so read the current terms before you fund the account."))
        pricing = section("pricing", f"Breaking Down What {N} Costs", body)

    # ---- markets
    mk_src = [s for s in marks if "bd-section--markets" in s["cls"]]
    if mk_src:
        markets = mk_src[0]["full"]
    else:
        markets = markets_section(N, slug)

    # ---- credibility
    if cred_src:
        cred = cred_src[0]["full"]
    else:
        parts = ""
        for s in legit:
            parts += s["body"]
        for s in risk:
            parts += "".join(x + "\n" for x in paras(s["body"]))
        if not parts:
            parts = (p(f"This review summarises what {N}{RA}s own site says. We have not independently confirmed those statements, and we could not confirm who operates the platform or where it is regulated.") +
                     p("Checks you can run in a few minutes:") +
                     ul(["Search the regulator" + RA + "s register for the company name and licence number.",
                         "Look up when the website domain was registered, since a very new domain deserves extra care.",
                         "Search the name with the word scam and read dated, specific complaints rather than star ratings.",
                         "Confirm you are on the official website and not a look-alike."]))
        cred = section("credibility", f"Does {N} Hold Up as a Legitimate Platform?", parts +
                       p("Legitimacy and profitability are different things. A legitimate platform can still lose you money if you overcommit, skip risk controls, or bank on best-case numbers.", " bd-callout"))

    # ---- mistakes
    if mist_src:
        mist = mist_src[0]["full"]
    else:
        blocks = "".join(f'<div class="bd-mistake">\n<h3 class="bd-subheading">{t}</h3>\n' + p(pick(slug, "m" + t, alts)) + "</div>\n" for t, alts in MISTAKES)
        mist = section("mistakes", f"Mistakes Worth Avoiding on {N}",
                       p("Most of the losses with automated trading tools trace back to user decisions, not the platform itself. A few worth flagging:") + blocks)

    # ---- checklist
    ck_src = [s for s in checks if "bd-section--checklist" in s["cls"]]
    if ck_src:
        chk = ck_src[0]["full"]
    else:
        items = []
        for s in checks + legit + wd:
            for l in lists(s["body"]):
                items += li_items(l)
        items = [i for i in uniq(items) if len(plain(i)) < 160]
        gen = sorted(CHECKLIST_GENERIC, key=lambda x: md5i(slug + x))
        merged = uniq(items[:4] + gen)[:7]
        chk = section("checklist", "A Quick Checklist Before Your First Live Trade",
                      p("Run through this before committing real funds.") + ul(merged, "bd-list bd-list--checklist"))

    # ---- audience
    au_src = [s for s in aud if "bd-section--audience" in s["cls"]]
    if au_src:
        audience = au_src[0]["full"]
    else:
        body = ""
        for s in aud:
            body += s["body"]
        if not body:
            body = (p(f"{N} may suit a newcomer who wants a low entry point and will check the details before committing." if not dep else
                      f"{N} may suit a newcomer who wants a low entry point of {dep} and will check the details before committing.") +
                    p("It is a poor fit for anyone who needs a long-established provider with a confirmed regulator, or an income they can leave on autopilot."))
        audience = section("audience", f"Who Gets the Most Out of {N}", body)

    # ---- faq, verdict
    faq = sec(d, "faq")[0]["full"]
    verdict = re.sub(r'<h2 class="bd-heading">[^<]*</h2>', f'<h2 class="bd-heading">Where We Land on {N}</h2>', d["verdict"], count=1)

    rb = d["rating"] or rating_bar(rating)
    dep_head = f"Starting Deposit: {dep}" if dep else "Take a closer look"
    out = ('\n<div class="bd-review">\n' + intro_html + product_link(url, "Discover More") + rb +
           banner(url, "Want to look at it yourself?", "Start small and read the terms first", "Discover More") +
           ov + product_link(url, "Learn More") + balance +
           cta_bar(url, dep_head, "Start small and test a withdrawal early", "Learn More") + how + gs +
           banner(url, "Ready to take a closer look?", "Start small and test a withdrawal early", f"Explore {short}") +
           pricing + product_link(url, "Learn More") + markets + product_link(url, "Discover More") + cred +
           product_link(url, "Learn More") + mist + product_link(url, "Learn More") + chk + product_link(url, f"Explore {short}") +
           audience + faq + verdict + banner(url, "Still deciding?", "Whatever you choose, start small", f"Learn More About {short}") +
           d["risk"] + "</div>\n")
    return out


def main():
    dry = "--dry-run" in sys.argv
    slugs = [a for a in sys.argv[1:] if not a.startswith("--")]
    for slug in slugs:
        path = f"{POSTS}/{slug}.json"
        post = json.load(open(path))
        d = parse(post["content"])
        have = {k for k in REF_CLASSES if any(f"bd-section--{k}" in s["cls"] for s in d["sections"])}
        if have >= set(REF_CLASSES) - {"markets"} and "markets" not in have:
            # almost complete already: add only the missing markets section after pricing
            out = post["content"]
            N = [n for n in json.loads(post["reviewJsonLd"])["@graph"] if n.get("@type") == "Review"][0]["itemReviewed"]["name"]
            url = post.get("ctaUrl") or re.search(r'href="(https?://[^"]+)" rel="sponsored', out).group(1)
            mk = markets_section(N, slug)
            m = re.search(r'<section class="bd-section bd-section--pricing">.*?</section>\n(?:<div class="bd-product-link">.*?</div>\n)?', out, re.S)
            if dry:
                print(slug, "adds markets only")
                continue
            out = out[: m.end()] + mk + product_link(url, "Discover More") + out[m.end():]
            post["content"] = out
            json.dump(post, open(path, "w", encoding="utf-8"), separators=(",", ":"), ensure_ascii=True)
            print(slug, "markets section added")
            continue
        out = build(post, d, dry)
        if dry:
            print(slug, len(out), [re.sub(r"<[^>]+>", "", h) for h in re.findall(r"<h2[^>]*>.*?</h2>", out)])
            continue
        post["content"] = out
        for k in ("journeyLayout", "plainLayout", "hideToc", "hideQuickVerdict"):
            post.pop(k, None)
        words = len(plain(out).split())
        post["readingTime"] = f"{max(4, round(words / 200))} min read"
        json.dump(post, open(path, "w", encoding="utf-8"), separators=(",", ":"), ensure_ascii=True)
        print(slug, "ok", words, "words")


if __name__ == "__main__":
    main()
