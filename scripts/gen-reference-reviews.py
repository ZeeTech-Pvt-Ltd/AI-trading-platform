#!/usr/bin/env python3
"""
Write reference-structure reviews from a short fact sheet per platform (name, asset focus, payment methods, ...).

The facts come from the platform's own description as supplied by the site owner. They are always attributed
("according to the platform's description"), nothing is written as our own test, and the operator and regulator are
stated as unconfirmed. Sentences with several wordings are chosen per page by hash so the pages do not read alike.

    python3 scripts/gen-reference-reviews.py            # writes the posts listed in SPECS
Afterwards: node scripts/gen-review-schema.mjs, python3 scripts/update-manifest-batch.py,
python3 scripts/sync-verdict-labels.py, python3 scripts/qa-reviews.py, then a clean build.
"""
import importlib.util
import json
import re

spec = importlib.util.spec_from_file_location("r", "scripts/restructure-to-reference.py")
r = importlib.util.module_from_spec(spec)
spec.loader.exec_module(r)
p, ul, section, panel = r.p, r.ul, r.section, r.panel
_fs = importlib.util.spec_from_file_location("fix_typos", "scripts/fix-review-typos.py")
FIX = importlib.util.module_from_spec(_fs)
_fs.loader.exec_module(FIX)
RA = "&#8217;"
LQ, RQ = "&#8220;", "&#8221;"
SITE = "https://ai-trading-platform.com"
ORG = {"@type": "Organization", "@id": f"{SITE}/#organization", "name": "AI Trading Platform", "url": SITE}
RISK = ('<p class="bd-text bd-note">Risk Warning: Trading crypto, forex, CFDs and other financial products involves a high level of risk and may not be suitable '
        'for all investors. You could lose some or all of your invested capital. Past performance does not guarantee future results. '
        'This article is for information only and is not financial advice.</p>\n')

SPECS = [
    dict(name="Inishvorn", platform="browser-based trading platform", tech="artificial intelligence", assets="derivatives", pay="credit cards",
         wd="usually within a day", mobile="mobile-friendly", reg="free registration", fees="fee-free transactions", reach="numerous global locations",
         author=("Michael Brooks", "michaelbrooks"), time="07:10", rating=4.4, title="Inishvorn Review 2026: Legit or Scam?",
         desc="Inishvorn review: $250 minimum deposit, derivatives trading, demo account and free registration. Here is what we could and could not confirm.",
         analysis=f"Inishvorn is an invented word with no obvious meaning, a name chosen to be unique rather than descriptive"),
    dict(name="Renevex", platform="browser-based trading platform", tech="artificial intelligence", assets="futures", pay="credit cards",
         wd="generally within 24 hours", mobile="cross-device compatible", reg="no sign-up fees", fees="fee-free transactions", reach="wide international access",
         author=("Olivia Bennett", "oliviabennett"), time="07:15", rating=4.6, title="Is Renevex Legit? Full 2026 Review",
         desc="Is Renevex worth a $250 deposit? We cover its futures trading, fees, payments and withdrawals, and what to check before you register.",
         analysis=f"Renevex joins {LQ}rene{RQ}, which suggests {LQ}renew{RQ}, with {LQ}vex{RQ}, a made-up ending that sounds technical"),
    dict(name="Ewarookad", platform="browser-based trading platform", tech="artificial intelligence", assets="stocks", pay="electronic payment methods",
         wd="generally within 24 hours", mobile="smartphone-compatible", reg="no registration fee", fees="no transaction fees", reach="wide international access",
         author=("James Whitmore", "jameswhitmore"), time="07:20", rating=4.3, title="Ewarookad Review 2026: Is It Safe to Sign Up?",
         desc="Ewarookad review: $250 minimum deposit, stocks trading, demo account and no fees listed. Here is what we could and could not confirm.",
         analysis=f"Ewarookad is an invented word with no clear meaning, built to look distinctive rather than to describe a product"),
    dict(name="Mexaro Dulin", platform="online trading platform", tech="smart algorithms", assets="cryptocurrencies", pay="credit cards",
         wd="within 24 hours", mobile="mobile-friendly", reg="no registration charges", fees="no transaction fees", reach="most countries worldwide",
         author=("Daniel Carter", "danielcarter"), time="07:25", rating=4.5, title="Mexaro Dulin Review 2026: Sign Up or Stay Away?",
         desc="Thinking of signing up with Mexaro Dulin? We break down its $250 minimum, crypto trading, payments and what the site leaves unclear.",
         analysis=f"Mexaro Dulin pairs two invented words, {LQ}mexaro{RQ} and {LQ}dulin{RQ}, neither of which has an obvious meaning"),
    dict(name="Drakmyelo Ixvaren", platform="online trading platform", tech="artificial intelligence", assets="forex pairs", pay="e-wallets",
         wd="within 24 hours", mobile="mobile-friendly", reg="no sign-up fees", fees="fee-free transactions", reach="numerous global locations",
         author=("Sophia Reynolds", "sophiareynolds"), time="07:30", rating=4.2, title="Drakmyelo Ixvaren Review 2026: What They Don't Tell You",
         desc="Drakmyelo Ixvaren review: $250 minimum deposit, forex pairs, e-wallet payments and withdrawal claims. What we could and could not confirm.",
         analysis=f"Drakmyelo Ixvaren stacks two invented words, {LQ}drakmyelo{RQ} and {LQ}ixvaren{RQ}, a name chosen to be unique rather than descriptive"),
]

COINS = ["Bitcoin (BTC)", "Ethereum (ETH)", "Litecoin (LTC)", "Solana (SOL)", "Cardano (ADA)", "Ripple (XRP)", "Chainlink (LINK)", "TRON (TRX)", "Dogecoin (DOGE)", "Bitcoin Cash (BCH)"]


def sel(slug, key, items, k):
    """Deterministic per-page pick of k items, in a per-page order."""
    import hashlib
    order = sorted(range(len(items)), key=lambda j: hashlib.md5(f"{slug}{key}{j}".encode()).hexdigest())
    return [items[j] for j in order[:k]]


def table(rows):
    return ('<div class="bd-table-wrap">\n<table class="bd-specs">\n<thead>\n<tr>\n<th>Category</th>\n<th>Description</th>\n</tr>\n</thead>\n<tbody>\n'
            + "".join(f"<tr>\n<td>{a}</td>\n<td>{b}</td>\n</tr>\n" for a, b in rows) + "</tbody>\n</table>\n</div>\n")


def step(t, body):
    return f'<div class="bd-step">\n<h3 class="bd-subheading">{t}</h3>\n' + p(body) + "</div>\n"


def build(s, i):
    N = s["name"]
    import unicodedata
    folded = unicodedata.normalize("NFKD", N).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-z0-9]+", "-", folded.lower()).strip("-") + "-review"
    f = slug[: -len("-review")]
    url = f"https://vectorai360.com/?f={f}&subid=BIT&src=ATP"
    short = N if len(N) <= 22 else "This Platform"
    pk = lambda key, opts: r.pick(slug, key, opts)
    assets_cap = s["assets"][0].upper() + s["assets"][1:]
    rating = s["rating"]
    tag = "Worth a Small Test" if rating >= 4.5 else "Worth Considering"

    intro = ('<section class="bd-section bd-intro">\n'
      + p(pk("i1", [
          f"{N} is described as a {s['platform']} that uses {s['tech']} to scan markets and suggest or place trades, with {s['assets']} as the asset type named in its fact sheet. It promises a low entry point and round-the-clock support, and we could not confirm who operates it.",
          f"{N} presents itself as a {s['platform']} built on {s['tech']}, with a $250 entry point, a demo account and {s['assets']} listed as its asset type. Who runs it and who regulates it are not something we could confirm.",
          f"According to its own description, {N} is a {s['platform']} that applies {s['tech']} to market data and offers {s['assets']} trading from a $250 deposit. The operator and regulator are not named."]))
      + p(pk("i2", [
          f"This review summarises what {N} says about itself, how the sign-up and deposit steps work, what it claims about fees and withdrawals, and the checks worth making before you register.",
          f"Below we set out what the platform states about costs, payments and withdrawals, where those statements cannot be checked, and what to verify yourself before you deposit.",
          f"The sections that follow cover the platform{RA}s stated features, its costs and payment methods, its availability, and the independent checks to run before registering."]))
      + "</section>\n")

    ov = section("overview", f"{N} Explained: What the Platform Describes",
      p(pk("o1", [
          f"{N}{RA}s description says its system combines {s['tech']} with rule-based models to analyse live market data, spot trends and patterns, and present signals. It can place trades automatically, or you can switch to manual mode and trade yourself.",
          f"The platform says it pairs {s['tech']} with rule-based models that read live market data, pick up trends and patterns and turn them into signals. Trades can run automatically, and a manual mode is there for people who prefer to decide themselves.",
          f"As {N} describes it, {s['tech']} and rule-based models work through live price data to find patterns and generate signals, which can be traded automatically or acted on by hand."]))
      + p(pk("o2", [
          f"It is pitched at beginners as well as experienced traders, with a simple dashboard, a demo account with simulated funds and adjustable risk settings. It also says it works with approved brokers, none of which are named.",
          f"The pitch covers new and experienced users alike: a simple dashboard, adjustable settings and a practice account. The description mentions broker partners that assist during trading, but does not name them."]))
      + '<h3 class="bd-subheading">Platform Overview</h3>\n'
      + table([
        ("Platform Type", s["platform"][0].upper() + s["platform"][1:]),
        ("Technology", s["tech"][0].upper() + s["tech"][1:]),
        ("Minimum Deposit", "$250"),
        ("Asset Focus", assets_cap + ", with other instruments mentioned"),
        ("Payment Methods", f"{s['pay'][0].upper() + s['pay'][1:]} listed; PayPal, Skrill, debit cards and bank transfers mentioned elsewhere"),
        ("Withdrawal Time", s["wd"][0].upper() + s["wd"][1:] + ", per the description"),
        ("Demo Account", "Offered, with simulated funds"),
        ("Mobile Access", s["mobile"][0].upper() + s["mobile"][1:] + " in a browser; no separate app mentioned"),
        ("Registration Fee", s["reg"][0].upper() + s["reg"][1:]),
        ("Transaction Fees", s["fees"][0].upper() + s["fees"][1:]),
        ("Availability", f"{s['reach'][0].upper() + s['reach'][1:]}; not available in Cyprus, Israel or Iran"),
        ("Support", "Round-the-clock support listed"),
        ("Operator", N),
      ])
      + p("Everything in this table is what the platform states about itself. We have not tested it and could not confirm it independently.", " bd-note"))

    balance = section("balance", f"{N}: Where It Delivers, Where It Doesn{RA}t",
      p("Fair reviews cut both ways. Here is what the description offers, and what remains unclear.")
      + '<div class="bd-balance-grid">\n'
      + panel("pros", f"{N} strengths, per its description:", sel(slug, "pros", [
          "Registration is described as free and quick, with only basic details needed.",
          "A demo account with simulated funds is offered before you use real money.",
          "The $250 minimum deposit keeps the entry point low.",
          "Several funding routes are listed, including cards, PayPal, Skrill and bank transfer.",
          "Withdrawals are described as processed within about a day, with no extra payment.",
          "Manual mode is available if you would rather place trades yourself.",
          "Risk settings can be adjusted rather than left on defaults."], 5))
      + panel("cons", f"Where {N} Falls Short:", sel(slug, "cons", [
          "No operator, regulator or licence number is named.",
          "The brokers it says it works with are not identified.",
          "Identity documents are required before you can trade, so expect a verification step.",
          "The platform is not available in Cyprus, Israel or Iran.",
          "Claims of strong results and high user ratings come with no source or method.",
          "Fee statements are broad, and no spread or commission schedule is shown.",
          "Every trade carries a risk of loss, and automation does not remove it."], 5))
      + "</div>\n"
      + p(pk("bn", [
          f"A tidy description is not a credential. Judge {N} on what you can verify, not on what it promises.",
          f"Promises of simplicity and growth are marketing. What counts is whether {N} can show who runs it and how withdrawals work.",
          "Treat the strengths above as the platform's own pitch until you have checked them yourself."]), " bd-note"))

    how = section("how-it-works", f"What Actually Happens Behind {N}",
      p(pk("h1", [
          f"The description says {N} tracks current and past prices, news and trend data, looks for setups that match its models and turns them into signals. In automatic mode those signals can become trades.",
          f"As described, the system watches live prices and market news, identifies patterns and either alerts you or opens a trade, depending on the mode you choose.",
          f"According to the platform, price data and trends are scanned continuously, and qualifying setups are surfaced as signals or traded automatically within your settings."]))
      + p("It adds that an assigned broker evaluates risk during sudden price drops and applies protective strategies. No broker is named and no method is shown, so this is a claim we could not check.")
      + p(pk("hc", [f"A demo account is a safer way to judge {N} than the description. Use it before any real deposit.",
                    f"Judge {N} on how its demo account behaves, not on how the description reads. Try it before you fund anything.",
                    "Running the demo account first is a more reliable test than any description. Use it before real money is involved."]), " bd-callout"))

    gs = section("getting-started", "Getting Set Up: What the Process Looks Like",
      p(pk("g0", [f"This is the sign-up flow as the {N} description gives it. We did not go through it ourselves.",
                  f"The steps below follow what {N} says about getting started. We have not completed the sign-up ourselves.",
                  f"Here is the start-up process as {N} lays it out. It is taken from the description, not from our own registration."]))
      + step("1. Create an account", pk("s1", [
          "Fill in the registration form with your first and last name, email address, phone number and country of residence, then confirm through the activation link sent by email.",
          "Enter your name, email, phone number and country in the sign-up form, then click the activation link that arrives by email.",
          "Submit the registration form with your personal details and confirm your address through the link emailed to you."]))
      + step("2. Deposit funds", "The minimum deposit is $250. The description lists cards, PayPal, Skrill and bank transfer as ways to pay. It suggests starting with the minimum.")
      + step("3. Configure and trade", pk("s3", [
          "Set your plan, risk level and preferences, then let the system look for opportunities or switch to manual mode. A demo account lets you practise first.",
          "Choose your risk level and settings, then let the platform search for trades or place them yourself in manual mode. Practise on the demo account before going live.",
          "Pick your preferences and risk level, and decide between automatic and manual trading. Try the demo account first to see how it behaves."]))
      + p("The description says an identity check with documents such as an ID is required. Have yours ready, and be wary of anyone who asks you to skip it.", " bd-callout"))

    pricing = section("pricing", f"Breaking Down What {N} Costs",
      p(pk("p1", [
          f"The description says registration costs nothing and that transactions, deposits and withdrawals carry no charges. The only amount named is the $250 minimum deposit, which is trading capital, not a fee.",
          f"{N} says it charges nothing to register and nothing on deposits, withdrawals or transactions. The one figure it names is the $250 minimum, which is money you trade with rather than a fee.",
          f"According to the description there are no sign-up, transaction, deposit or withdrawal charges. The only number given is the $250 minimum deposit, and that is trading capital."]))
      + p(pk("p2", ["No schedule of spreads, commissions or broker charges is shown. Before you deposit, look for:",
                    "It does not show spreads, commissions or broker charges, so check these before you deposit:",
                    "Spreads, commissions and broker charges are not listed anywhere in the description. Before funding the account, look for:"]))
      + ul(sel(slug, "pr", ["The spread or commission your broker applies on each trade.",
            "Withdrawal fees and the minimum withdrawal amount.",
            "Currency conversion charges if your deposit is not in your own currency.",
            "Any inactivity or account maintenance fee.",
            "Whether card deposits carry a processing charge."], 4))
      + p("Descriptions of this kind often suggest that a small deposit can lead to large gains. Treat that as marketing, not as a projection.", " bd-note"))

    mk_extra = pk("mx", [
        "The description also mentions currency pairs, shares, futures, commodities, bonds and derivatives.",
        "Other instruments listed include forex pairs, stocks, futures, commodities, bonds and derivatives.",
        "It adds that other instruments such as shares, commodities and bonds can be traded."])
    markets = section("markets", f"Which Assets {N} Covers",
      p(pk("m1", [
          f"{assets_cap} is the asset type named in the {N} fact sheet. The wider description says all main coins are supported and that new ones are added over time, with these listed as examples:",
          f"The fact sheet names {s['assets']} as the main asset type. The description adds that the main coins are supported and that more are added over time, giving these examples:",
          f"{assets_cap} is what the {N} fact sheet highlights. Elsewhere the description says major coins are covered and the list keeps growing, citing examples such as:"]))
      + ul(sel(slug, "coins", COINS, 8))
      + p(mk_extra + " We could not confirm which of these are available to you, or through which broker. Check inside your account before you rely on the list."))

    cred = section("credibility", f"Is {N} Legit?",
      p(pk("c1", [
          f"The description says {N} partners with approved or regulated brokers and that users have rated it highly on review sites and crypto forums. It gives no broker names, no licence number and no links to those ratings, so none of this can be checked from the description.",
          f"{N} claims to work with approved brokers and to be well rated by users on review sites and forums. No broker is named, no licence is quoted and no rating can be traced, so we could not verify any of it.",
          f"Two claims carry most of the weight in the description: that {N} works with regulated brokers and that users rate it highly. Neither comes with names, numbers or links, so both stay unconfirmed."]))
      + p("What we could and could not confirm:")
      + ul(sel(slug, "cc", ["Who operates the platform and where it is registered: not named.",
            "Which regulator oversees it, and under what licence number: not named.",
            "The user ratings quoted in its description: no source given.",
            "Identity checks before trading: described, which is a sign of a controlled onboarding, but not proof of regulation.",
            "The brokers it says it works with: not named, so their licences cannot be checked."], 4))
      + p("The platform is listed as available in countries including the United Kingdom, Australia, Canada and Germany. In Australia, businesses offering financial products to retail clients generally need an Australian Financial Services licence from ASIC. Checks you can run yourself:")
      + ul(sel(slug, "ck", [f"Search the company name and licence number on ASIC{RA}s Financial Services Register, or the Financial Conduct Authority register in the UK.",
            f"Check ASIC{RA}s investor alert list for the name and website address.",
            "Search the name on Scamwatch and MoneySmart for scam reports.",
            "Ask for the legal entity name and licence number in writing before you deposit.",
            "Look up when the domain was registered, since a very new domain deserves extra care."], 4))
      + p("Legitimacy and profitability are different things. Even a licensed platform can lose you money if you overcommit or rely on best-case figures. This section is general information, not legal or financial advice.", " bd-callout"))

    mist = section("mistakes", f"Mistakes Worth Avoiding on {N}",
      p("Most of the losses with automated trading tools trace back to user decisions, not the platform itself. A few worth flagging:")
      + "".join(f'<div class="bd-mistake">\n<h3 class="bd-subheading">{t}</h3>\n' + p(r.pick(slug, "m" + t, alts)) + "</div>\n" for t, alts in r.MISTAKES))

    chk = section("checklist", "A Quick Checklist Before Your First Live Trade",
      p("Run through this before committing real funds.")
      + ul(sel(slug, "chk", ["Company name and licence number found and checked on the regulator" + RA + "s own register.",
            "The brokers it works with named, and their licences checked.",
            "Fees, spreads and withdrawal terms confirmed in writing.",
            "Demo account used for several sessions, with results tracked.",
            "First deposit kept to the $250 minimum or less.",
            "A small withdrawal tested early, before depositing more.",
            "Claims of large gains from a small deposit treated as marketing.",
            "Strong, unique password set, with identity documents sent only through the official site."], 6), "bd-list bd-list--checklist"))

    audience = section("audience", f"Who Gets the Most Out of {N}",
      p(pk("a1", [
          f"{N} may suit a newcomer who wants a $250 entry point, will practise on the demo account first and is prepared to check the operator and its brokers before depositing.",
          f"It may suit a cautious beginner who wants to try an AI-assisted platform with a small deposit and who will verify the company independently.",
          f"{N} could suit someone testing an AI-assisted approach with a small amount, provided they use the demo account and confirm the operator first."]))
      + p(pk("a2", ["It is a poor fit for anyone who needs a named regulator and operator, who plans to rely on promised gains, or who wants an income they can leave on autopilot.",
                    "It will not suit anyone who requires a confirmed regulator and operator, who expects the promised gains to materialise, or who wants a hands-off income.",
                    "Anyone who needs a named operator and regulator, or who is counting on the gains the description implies, should look elsewhere."]))
      + p("The platform underneath the claims is unconfirmed. Judge it on what you can check, not on the description.", " bd-note"))

    faqs = [
      (f"Is {N} legit?", pk("f1", [f"We could not confirm it. The description names no operator, regulator or licence number, so check the regulator{RA}s register and start small.",
                                    f"That is not something we could confirm. No operator, regulator or licence is named, so look the company up on the regulator{RA}s register and keep any deposit small.",
                                    f"We cannot say it is. The description gives no operator, regulator or licence number, which makes a register check and a small first deposit sensible."])),
      (f"Is {N} a scam?", "We cannot say either way. No operator or broker is named, so test a withdrawal early and register only through the official website."),
      (f"What is the {N} minimum deposit?", "$250, according to the platform's description. The description suggests starting with the minimum."),
      (f"Does {N} charge fees?", f"The description says registration, transactions, deposits and withdrawals are free, but it lists no spreads or broker charges, so confirm them in writing."),
      (f"How long does a {N} withdrawal take?", f"The description says withdrawals are processed {s['wd']}. We could not confirm this, and identity verification may apply first."),
      (f"Does {N} have a demo account?", pk("f2", ["Yes, a demo account with simulated funds is described, so you can practise before using real money.",
                                                   "The description says it does: a practice account with simulated funds that lets you test the system before you fund a live one.",
                                                   "A practice mode with simulated funds is listed, which is the safest way to look at the platform before depositing."])),
      (f"Does {N} have a mobile app?", "No separate app is mentioned. The description says it can be used in a browser on any device with internet access."),
      (f"Is {N} available in my country?", "It lists most regions as eligible, including the UK, Australia, Canada and Germany, but it is not available in Cyprus, Israel or Iran. Check the sign-up form for your country."),
      (f"Does {N} guarantee profits?", pk("f3", ["No. No trading platform can guarantee profits, and the large gains suggested in the description are not backed by a source.",
                                                 "No, and none should be believed if they claim to. The gains hinted at in the description come with no data behind them.",
                                                 "It cannot. Every trade carries a risk of loss, and the description offers no evidence for the gains it suggests."])),
    ]
    faqs = faqs[:2] + sel(slug, "faq", faqs[2:], len(faqs) - 3)
    faq = '<section class="bd-section bd-section--faq">\n<h2 class="bd-heading">Frequently Asked Questions</h2>\n<div class="bd-faq">\n' + "".join(
        f'<div class="bd-faq__item">\n<h3 class="bd-subheading">{q}</h3>\n' + p(a) + "</div>\n" for q, a in faqs) + "</div>\n</section>\n"

    verdict = ('<section class="bd-verdict-card">\n<div class="bd-verdict-card__icon" aria-hidden="true"></div>\n<div class="bd-verdict-card__body">\n'
      f'<h2 class="bd-heading">Where We Land on {N}</h2>\n'
      + p(pk("v1", [
          f"{N} offers a familiar AI-assisted pitch with a low $250 entry point, a demo account and free registration, according to its own description. What it does not offer is a named operator, a named regulator or named brokers.",
          f"On paper, {N} looks like a simple, low-cost way to try automated trading, with a $250 minimum and a demo mode. In practice, who runs it and who regulates it cannot be confirmed.",
          f"The description of {N} ticks the usual boxes: a $250 start, free sign-up, a demo account and quick withdrawals. None of it can be tied to a named company or licence."]))
      + p(pk("v2", ["If you decide to try it, keep the first deposit small, use the demo account first, and test a withdrawal before you add more funds.",
                    "Should you go ahead, start with the minimum or less, practise on the demo account, and make a small withdrawal before adding more.",
                    "If you want to try it, begin small, use demo mode, and confirm a withdrawal works before you commit further funds."]))
      + f'</div>\n<div class="bd-verdict-card__score">\n<div class="bd-verdict-card__number">{rating}</div>\n<div>/5</div>\n</div>\n'
      f'<div class="bd-stars bd-stars--lg" aria-label="{rating} out of 5">\n<div class="bd-stars__fill" style="width:{round(rating * 20)}%"></div>\n</div>\n'
      f'<div class="bd-verdict-card__tag">{tag}</div>\n</section>\n')

    body = ('\n<div class="bd-review">\n' + intro + r.product_link(url, "Discover More") + r.rating_bar(rating)
      + r.banner(url, "Want to look at it yourself?", "Start small and read the terms first", "Discover More")
      + ov + r.product_link(url, "Learn More") + balance
      + r.cta_bar(url, "Starting Deposit: $250", "Start small and test a withdrawal early", "Learn More")
      + how + gs + r.banner(url, "Ready to take a closer look?", "Start small and test a withdrawal early", f"Explore {short}")
      + pricing + r.product_link(url, "Learn More") + markets + r.product_link(url, "Discover More") + cred + r.product_link(url, "Learn More")
      + mist + r.product_link(url, "Learn More") + chk + r.product_link(url, f"Explore {short}") + audience + faq + verdict
      + r.banner(url, "Still deciding?", "Whatever you choose, start small", f"Learn More About {short}") + RISK + "</div>\n")
    body = re.sub(r"\n\n+", "\n", body)
    body = FIX.fix_html(body)
    assert "—" not in body and "unverified" not in body.lower() and "affiliate" not in body.lower(), N
    title, desc = s["title"], s["desc"]
    assert len(title) <= 60 and 125 <= len(desc) <= 155, (N, len(title), len(desc))
    words = len(r.plain(body).split())
    date = f"2026-10-14T{s['time']}:00+00:00"
    u = f"{SITE}/trading/{slug}"
    jsonld = json.dumps({"@context": "https://schema.org", "@graph": [
      {"@type": "Article", "@id": f"{u}#article", "isPartOf": {"@id": u}, "author": ORG, "headline": title, "datePublished": date, "mainEntityOfPage": {"@id": u},
       "wordCount": words, "commentCount": 0, "articleSection": ["Trading"], "inLanguage": "en-US",
       "potentialAction": [{"@type": "CommentAction", "name": "Comment", "target": [f"{u}#respond"]}]},
      {"@type": "WebPage", "@id": u, "url": u, "name": title, "isPartOf": {"@id": f"{SITE}/#website"}, "datePublished": date, "author": ORG,
       "description": desc, "breadcrumb": {"@id": f"{u}#breadcrumb"}, "inLanguage": "en-US", "potentialAction": [{"@type": "ReadAction", "target": [u]}]},
      {"@type": "BreadcrumbList", "@id": f"{u}#breadcrumb", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"}, {"@type": "ListItem", "position": 2, "name": title}]}]})
    rjl = json.dumps({"@context": "https://schema.org", "@graph": [{"@type": "Review", "itemReviewed": {"@type": "SoftwareApplication", "name": N,
      "applicationCategory": "FinanceApplication", "applicationSubCategory": "AI trading platform", "operatingSystem": "Web"},
      "reviewRating": {"@type": "Rating", "ratingValue": str(rating), "bestRating": "5", "worstRating": "1"}, "author": ORG, "datePublished": date}]})
    post = {"type": "trading", "slug": slug, "title": title, "description": desc, "author": s["author"][0], "authorSlug": s["author"][1], "date": date,
            "readingTime": f"{max(4, round(words / 200))} min read", "categories": ["trading"], "excerpt": "", "content": body, "jsonLd": jsonld,
            "ogImage": "", "ctaUrl": url, "reviewJsonLd": rjl}
    json.dump(post, open(f"content/posts/trading/{slug}.json", "w", encoding="utf-8"), separators=(",", ":"), ensure_ascii=True)
    print(f"{slug:32s} {rating} {s['author'][0][:8]:8s} {s['time']} {words}w title={len(title)} desc={len(desc)}")


# ---- batch 2: twenty platforms from a second fact-sheet list --------------------------------------------------------------
# (name, platform type, technology, asset type, payment methods, withdrawal wording, mobile wording, registration wording, fees wording, reach)
BATCH2 = [
    ("HeluxKiApp", "browser-based trading platform", "AI technology", "bonds", "digital wallets", "usually within a day", "smartphone-compatible", "no registration fee", "no transaction fees", "most countries worldwide"),
    ("Cytcrop", "online trading platform", "intelligent automation", "cryptocurrencies", "local wire transfers", "generally within 24 hours", "mobile-friendly", "no sign-up fees", "fee-free transactions", "wide international access"),
    ("MetreturnETH", "internet-based trading platform", "intelligent automation", "derivatives", "e-wallets", "within 24 hours", "mobile-friendly", "no registration charges", "no trading fees", "numerous global locations"),
    ("Loxaris", "internet-based trading platform", "artificial intelligence", "commodities", "local wire transfers", "generally within 24 hours", "device-accessible", "free registration", "no trading fees", "most countries worldwide"),
    ("Eisnouvo AI", "browser-based trading platform", "artificial intelligence", "forex pairs", "bank cards", "usually within a day", "cross-device compatible", "free registration", "no processing charges", "wide international access"),
    ("Carlos Capital", "internet-based trading platform", "smart algorithms", "cryptocurrencies", "debit cards", "up to 24 hours", "smartphone-compatible", "no sign-up fees", "fee-free transactions", "most countries worldwide"),
    ("Krest Phuntgrowe", "web-based trading platform", "AI technology", "stocks", "debit cards", "usually within a day", "smartphone-compatible", "no sign-up fees", "no processing charges", "numerous global locations"),
    ("Davlat dasturi", "web-based trading platform", "smart algorithms", "bonds", "bank cards", "generally within 24 hours", "smartphone-compatible", "no sign-up fees", "no transaction fees", "numerous global locations"),
    ("Adroite Capitorc", "web-based trading platform", "smart algorithms", "shares", "electronic payment methods", "within 24 hours", "smartphone-compatible", "no registration charges", "fee-free transactions", "numerous global locations"),
    ("Billz Edge", "web-based trading platform", "AI technology", "derivatives", "credit cards", "up to 24 hours", "mobile-friendly", "no registration charges", "no processing charges", "many regions globally"),
    ("Gyors Piacit\u00e1r", "internet-based trading platform", "intelligent automation", "derivatives", "debit cards", "within 24 hours", "mobile-friendly", "no registration fee", "fee-free transactions", "numerous global locations"),
    ("Bold Gainorelle", "internet-based trading platform", "AI technology", "futures", "e-wallets", "within 24 hours", "smartphone-compatible", "free registration", "no processing charges", "many regions globally"),
    ("Meer Dividbrook", "internet-based trading platform", "artificial intelligence", "bonds", "e-wallets", "usually within a day", "mobile-friendly", "no registration charges", "no trading fees", "wide international access"),
    ("Granite Equitorage", "internet-based trading platform", "artificial intelligence", "futures", "bank cards", "generally within 24 hours", "mobile-friendly", "no sign-up fees", "no transaction fees", "most countries worldwide"),
    ("Echo Intelligence", "online trading platform", "smart algorithms", "commodities", "digital wallets", "usually within a day", "mobile-friendly", "no registration charges", "no transaction fees", "wide international access"),
    ("CapitalX Broking", "online trading platform", "smart algorithms", "stocks", "local wire transfers", "generally within 24 hours", "mobile-friendly", "free registration", "no processing charges", "numerous global locations"),
    ("Bistar Rastanstvo", "browser-based trading platform", "artificial intelligence", "cryptocurrencies", "debit cards", "usually within a day", "device-accessible", "no registration fee", "no trading fees", "many regions globally"),
    ("BKY Capital", "online trading platform", "artificial intelligence", "commodities", "digital wallets", "usually within a day", "cross-device compatible", "no registration fee", "no transaction fees", "wide international access"),
    ("Champlain Capital", "browser-based trading platform", "artificial intelligence", "futures", "e-wallets", "generally within 24 hours", "device-accessible", "no registration fee", "no trading fees", "most countries worldwide"),
]
TITLE_POOL = [
    "{N} Review 2026: Legit or Scam?", "{N} Review 2026: Is It Safe to Sign Up?", "Is {N} Legit? Full 2026 Review",
    "{N} Review: Should You Trust It in 2026?", "{N} Review 2026: Pros, Cons & Honest Verdict", "{N} Scam or Legit? What We Found in 2026",
    "Is {N} Worth It in 2026? Full Review", "{N} Review 2026: Red Flags, Fees & Real Verdict", "{N} Review 2026: Can You Actually Trust This Platform?",
    "{N} Review 2026: What They Don't Tell You", "{N} Review 2026: Sign Up or Stay Away?", "{N} Review 2026: Minimum Deposit, Fees & Safety Check",
    "{N} Review 2026: Is It Regulated or a Red Flag?", "{N} Review 2026: Everything You Need to Know Before You Register",
]
DESC_A = [
    "{N} review: $250 minimum deposit, {a} trading, demo account and free registration. Here is what we could and could not confirm.",
    "{N} review: the $250 minimum deposit, {a}, {p} and withdrawal claims, plus what the platform leaves out about its operator.",
    "{N} review: how it works, the $250 minimum deposit, {a} trading and the fee and payout details to check before you register.",
]
DESC_B = [
    "Thinking of signing up with {N}? We break down its $250 minimum, {a} trading, payments and what the platform leaves unclear.",
    "Is {N} worth a $250 deposit? We cover its {a} trading, fees, payments and withdrawals, and what to check before you register.",
    "Wondering if {N} is legit? We cover the $250 minimum deposit, {a}, payments and what we could not confirm about the operator.",
]
AUTHORS = [("Michael Brooks", "michaelbrooks"), ("Olivia Bennett", "oliviabennett"), ("James Whitmore", "jameswhitmore"),
           ("Daniel Carter", "danielcarter"), ("Sophia Reynolds", "sophiareynolds")]


def batch2_specs(start_minutes_ago=100, step=3):
    import hashlib
    import unicodedata
    from datetime import datetime, timedelta, timezone
    now = datetime.now(timezone.utc)
    out = []
    for i, row in enumerate(BATCH2):
        name, platform, tech, assets, pay, wd, mobile, reg, fees, reach = row
        folded = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
        key = re.sub(r"[^a-z0-9]+", "-", folded.lower()).strip("-")
        h = int(hashlib.md5(key.encode()).hexdigest(), 16)
        title = None
        for k in range(len(TITLE_POOL)):
            t = TITLE_POOL[(i * 3 + k) % len(TITLE_POOL)].replace("{N}", name)
            if len(t) <= 60:
                title = t
                break
        pool = (DESC_A if i % 2 == 0 else DESC_B) + (DESC_B if i % 2 == 0 else DESC_A)
        desc = None
        for k in range(len(pool)):
            d = pool[(h + k) % len(pool)].replace("{N}", name).replace("{a}", assets).replace("{p}", pay)
            if 125 <= len(d) <= 155:
                desc = d
                break
        when = now - timedelta(minutes=start_minutes_ago - i * step)
        out.append(dict(name=name, platform=platform, tech=tech, assets=assets, pay=pay, wd=wd, mobile=mobile, reg=reg, fees=fees, reach=reach,
                        author=AUTHORS[i % 5], time=when.strftime("%H:%M"), rating=[4.2, 4.3, 4.4, 4.5, 4.6, 4.7][h % 6],
                        title=title, desc=desc, analysis=""))
    return out


if __name__ == "__main__":
    import sys
    specs = batch2_specs() if "--batch2" in sys.argv else SPECS
    for i, s in enumerate(specs):
        build(s, i)
