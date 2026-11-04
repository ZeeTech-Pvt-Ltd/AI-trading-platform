#!/usr/bin/env python3
"""
Write the Finora AI review (reference structure) from the facts on finoraai-trade.com only.

Every factual sentence is either quoted from the platform's own page or marked as something the page does not say.
Nothing comes from outside research. Claims the page makes without a source are attributed to the page.

    python3 scripts/gen-finora-review.py
Afterwards: node scripts/gen-review-schema.mjs, python3 scripts/update-manifest-batch.py,
python3 scripts/sync-verdict-labels.py, python3 scripts/qa-reviews.py, then a clean build.
"""
import importlib.util
import json
import re
from datetime import datetime, timezone

spec = importlib.util.spec_from_file_location("r", "scripts/restructure-to-reference.py")
r = importlib.util.module_from_spec(spec)
spec.loader.exec_module(r)
p, ul, section, panel = r.p, r.ul, r.section, r.panel
_fs = importlib.util.spec_from_file_location("fix_typos", "scripts/fix-review-typos.py")
FIX = importlib.util.module_from_spec(_fs)
_fs.loader.exec_module(FIX)

RA = "&#8217;"
SITE = "https://ai-trading-platform.com"
ORG = {"@type": "Organization", "@id": f"{SITE}/#organization", "name": "AI Trading Platform", "url": SITE}
RISK = ('<p class="bd-text bd-note">Risk Warning: Trading crypto, forex, CFDs and other financial products involves a high level of risk and may not be suitable '
        'for all investors. You could lose some or all of your invested capital. Past performance does not guarantee future results. '
        'This article is for information only and is not financial advice.</p>\n')

N = "Finora AI"
SLUG = "finoraai-review"
URL = "https://austerio-smart-up.com/?f=finoraai"
SOURCE = "finoraai-trade.com"
RATING = 4.2
AUTHOR = ("Daniel Carter", "danielcarter")
DATE = "2026-10-26T06:20:00+00:00"
TITLE = "Finora AI Review 2026: Is It Safe to Sign Up?"
DESC = ("Thinking of signing up with Finora AI? We check its £180 minimum, the 8.5% staking claim, "
        "the regulation it cites and the projection it shows.")


def table(rows):
    return ('<div class="bd-table-wrap">\n<table class="bd-specs">\n<thead>\n<tr>\n<th>Category</th>\n<th>Description</th>\n</tr>\n</thead>\n<tbody>\n'
            + "".join(f"<tr>\n<td>{a}</td>\n<td>{b}</td>\n</tr>\n" for a, b in rows) + "</tbody>\n</table>\n</div>\n")


def step(t, body):
    return f'<div class="bd-step">\n<h3 class="bd-subheading">{t}</h3>\n' + p(body) + "</div>\n"


def build():
    intro = ('<section class="bd-section bd-intro">\n'
             + p(f"{N} presents itself as AI-supported investing with a personal financial analyst assigned to each member. "
                 f"Its page offers crypto assets, staking, index vaults and tax reports, and it describes the platform as regulated.")
             + p(f"This review uses only what {SOURCE} says about {N}. Where the page makes a claim we could not check, we say so. "
                 "The sections below cover what the page states, what it leaves out and what to verify before you deposit.")
             + "</section>\n")

    ov = section("overview", f"{N} Explained: What the Platform Describes",
      p(f"According to its page, {N} brings a member's balance, strategy and performance into one dashboard, and a personal analyst "
        "helps them read it. The page also says an AI engine tracks live order books across crypto exchanges, global equity feeds and "
        "major currency pairs, and that the analyst oversees every move.")
      + p("Everything in this table comes from the page. Where the page is silent, the table says so.", " bd-note")
      + '<h3 class="bd-subheading">Platform Overview</h3>\n'
      + table([
        ("Platform Type", "AI-supported investing with a personal financial analyst"),
        ("Minimum Deposit", "£180, per the FAQ"),
        ("Asset Focus", "Bitcoin, Ethereum, Solana, USDC, Cardano and Polygon, plus index vaults and staking. The page says &ldquo;See all 40+ assets&rdquo;"),
        ("Earn Product", "Finora AI Earn, described as &ldquo;up to 8.5% APY on staked assets&rdquo;, with early access by sign-up"),
        ("Payment Methods", "Debit and credit cards, direct bank transfers, and &ldquo;certain digital wallets and crypto options&rdquo;"),
        ("Withdrawal Time", "Withdrawals can be made &ldquo;anytime using your dashboard&rdquo;. The page says the funds go back to the payment account, subject to bank processing time. No timeframe is given"),
        ("Demo Account", "Not mentioned on the page"),
        ("Mobile Access", "A mobile app is listed. The page gives no app store details"),
        ("Registration Fee", "The page says &ldquo;Free to start&rdquo;"),
        ("Transaction Fees", "The page says &ldquo;No hidden fees&rdquo; and &ldquo;All charges are shown in plain sight before you sign up&rdquo;. No fee amounts are given"),
        ("Regulation", "&ldquo;Regulated &amp; insured&rdquo; and &ldquo;UK financial regulations&rdquo; are stated. No regulator name, licence number or company number is given"),
        ("Eligibility", "Adults aged 18 and over. Identity and age verification is required"),
        ("Availability", "The page claims it is &ldquo;relied upon in over 150 countries&rdquo;, with no list. Availability &ldquo;may vary depending on your jurisdiction&rdquo;"),
        ("Support", "Monday to Friday, 09:00 to 18:00. The FAQ says replies come &ldquo;within one working day&rdquo;. No phone, chat or email details are shown"),
        ("Operator", f"{N} (footer: &ldquo;&copy; 2026 {N}&rdquo;). No legal entity name is given"),
      ]))

    balance = section("balance", f"{N}: Where the Page Stands Up, Where It Doesn{RA}t",
      p("Here is what the page offers, and what it does not back up.")
      + '<div class="bd-balance-grid">\n'
      + panel("pros", f"What {N} states about itself:", [
          "A minimum deposit of £180 is stated on the page.",
          "The page states &ldquo;No hidden fees&rdquo; and &ldquo;Free to start&rdquo;, though it gives no amounts to check.",
          "Withdrawals are described as available at any time from the dashboard.",
          "Features listed include recurring buys, staking, index vaults, tax reports, cold storage and a mobile app.",
          "Identity checks, a minimum age of 18 and 256-bit SSL encryption are mentioned as controls."])
      + panel("cons", f"Where {N} Falls Short:", [
          "No regulator name, licence number or company number is given, despite the &ldquo;Regulated&rdquo; label.",
          "No fee amounts, spreads or withdrawal timeframe are shown, and the page does not name a withdrawal fee.",
          "The page shows an illustration of &pound;28,960 a month in projected income from a &pound;180 start and &pound;14,300 reinvested. It says this is &ldquo;not a promise&rdquo;, but it gives no assumptions behind the figure.",
          "The 12,600 clients, the 4.9 rating and the 783 reviews have no source or method given.",
          "A testimonial says money &ldquo;arrives back when promised&rdquo;, which reads like a guarantee. The risk disclosure on the same page says the figures are not a guarantee of earnings."])
      + "</div>\n"
      + p(f"A confident page is not the same as a checkable company. Judge {N} on what you can verify yourself, not on the figures it shows.", " bd-note"))

    how = section("how-it-works", f"What Happens Behind {N}, According to Its Page",
      p(f"The page describes an AI engine that &ldquo;tracks live order books&rdquo; and surfaces opportunities, while a named analyst makes the final call. "
        "It says &ldquo;AI spots the signals. Your analyst decides.&rdquo; No method, track record or data source is shown for those signals.")
      + p("The page also lists a dashboard with live balance, profit and loss, cost basis, allocation and a risk breakdown, plus exportable history and price alerts.")
      + p("The page describes the analyst as someone with &ldquo;years of hands-on market experience&rdquo;. No names, qualifications or registrations are given for the analysts.", " bd-callout"))

    gs = section("getting-started", "Getting Set Up: The Steps the Page Describes",
      p(f"This is the sign-up route as the {N} page lays it out. We did not open an account to check it.")
      + step("1. Sign up", "The page asks for a first name, last name, email and phone number, and says &ldquo;Set up in minutes&rdquo;.")
      + step("2. Fund your account", "The page says deposits can be made by debit or credit card, direct bank transfer, or certain digital wallets. The minimum deposit is £180.")
      + step("3. Start with your analyst", "The page says each member is assigned an analyst who gets to know their goals. It does not say what the analyst costs or how they are paid.")
      + p("Identity and age verification is required before you invest. Have your documents ready, and check the terms before you fund the account.", " bd-callout"))

    pricing = section("pricing", f"What {N} Costs: What the Page Says and Leaves Out",
      p(f"The page says {N} is &ldquo;Free to start&rdquo; and has &ldquo;No hidden fees&rdquo;. It does not give a single fee amount, spread, commission or "
        "withdrawal charge. The £180 minimum is the only price-related figure stated outside the earnings illustration.")
      + p("Before you deposit, check these in writing:")
      + ul(["The spread or commission on each trade or staking product.",
            "Any withdrawal fee, minimum withdrawal amount and how long bank processing takes.",
            "The fee for the Finora AI Earn product, and how the 8.5% APY is calculated and paid.",
            "Who pays the analyst, and whether that cost is built into your returns.",
            "Currency conversion charges, if your card or bank is not in pounds."])
      + p("The page shows a projection that grows far beyond the deposit. Treat it as a sales illustration, not as an expected result.", " bd-note"))

    markets = section("markets", f"Which Assets {N} Lists",
      p(f"The page lists Bitcoin, Ethereum, Solana, USDC, Cardano and Polygon, and says &ldquo;See all 40+ assets&rdquo;. It also names index vaults and staking as products.")
      + ul(["Bitcoin, Ethereum, Solana, USDC, Cardano and Polygon, as listed on the page.",
            "Index vaults, described as a single rebalanced product covering &ldquo;the top digital assets&rdquo;.",
            "Staking on eligible assets, with yields shown before you commit.",
            "Recurring buys into any asset on a daily, weekly or monthly schedule.",
            "Earn: &ldquo;up to 8.5% APY on staked assets&rdquo;, with a scrolling example of a vault paying 6.2% APY."])
      + p("The page also says the engine covers major currency pairs and global equity feeds. It does not say which of these you can trade, or where. Check the full list inside your account.", " bd-note"))

    cred = section("credibility", f"Is {N} Legit?",
      p(f"The page says {N} is &ldquo;Regulated&rdquo; and &ldquo;Regulated &amp; insured&rdquo;, that its funds are &ldquo;segregated&rdquo;, and that it &ldquo;operates under registered money-services and virtual-asset frameworks&rdquo;. "
        "It also says it follows &ldquo;UK financial regulations&rdquo;. None of these statements names a regulator, a licence or a company, so none can be checked from the page.")
      + p("The page also shows logos for Fireblocks, Chainlink, Circle, Ledger, Anchorage, Fidelity Digital, BitGo and Coinbase Prime, with the line &ldquo;Client assets are held by qualified custodians&rdquo;. "
          "The page does not say how any of these firms are connected to Finora AI.")
      + p("What we could and could not confirm from the page:")
      + ul(["Who operates the platform and where it is registered: not named.",
            "Which regulator oversees it, and under which licence number: not named.",
            "Whether the custodians and firms in the logo row hold any agreement with Finora AI: not stated.",
            "The 12,600 clients, the 4.9 rating and the 783 reviews: no source or method given.",
            "The &ldquo;segregated funds&rdquo; and &ldquo;insured&rdquo; claims: no insurer or coverage limit named."])
      + p("Checks you can run yourself:")
      + ul(["Search the company name and any licence number on the official financial services register of the country you live in.",
            "Ask in writing for the legal entity name, its company number and the name of the insurer, before you deposit.",
            "Search the name for independent scam reports and user complaints, and read them with care.",
            "Look up when the domain was registered, since a recent domain deserves extra care.",
            "Read the full terms and risk disclosure, then test a small withdrawal before depositing more."])
      + p("Legitimacy and profitability are different things. A regulated platform can still lose you money, and an illustration is not an income. This section is general information, not legal or financial advice.", " bd-callout"))

    mist = section("mistakes", f"Mistakes Worth Avoiding with {N}",
      p("Most losses on platforms like this come from the decisions people make after signing up. A few worth flagging:")
      + "".join(f'<div class="bd-mistake">\n<h3 class="bd-subheading">{t}</h3>\n' + p(b) + "</div>\n" for t, b in [
          ("Trusting the &ldquo;Regulated&rdquo; label.", "The page names no regulator or licence. Ask for the company details before you rely on the label."),
          ("Treating the earnings illustration as an income.", "The projection on the page is labelled as an illustration. Plan as if you may get nothing back."),
          ("Relying on the 8.5% APY figure.", "The page does not say how the figure is calculated, what risks sit behind it, or whether it is guaranteed."),
          ("Depositing the full amount at once.", "Start at the £180 minimum, test a withdrawal, and only then decide whether to add more."),
          ("Skipping the terms because the page is reassuring.", "The risk disclosure says you may get back less than you invest. Read it before you fund the account."),
      ]))

    chk = section("checklist", "A Quick Checklist Before You Deposit",
      p("Run through this before you send any money.")
      + ul(["The legal entity, company number and regulator named in writing and checked on the official register.",
            "The insurer and coverage limit for &ldquo;insured&rdquo; funds confirmed.",
            "Withdrawal timeframe, withdrawal fee and minimum withdrawal confirmed in writing.",
            "The 8.5% APY on Earn, its calculation and its risks understood.",
            "The analyst fee, if any, confirmed.",
            "A small test withdrawal completed before you add more funds.",
            "Any projection treated as an illustration, not an expected return."], "bd-list bd-list--checklist"))

    audience = section("audience", f"Who {N} May Suit, and Who Should Look Elsewhere",
      p(f"{N} may suit someone who wants a guided, analyst-led approach to crypto, has checked the company details themselves, and is comfortable with the risk of losing the capital invested.")
      + p("It is a poor fit for anyone who needs a named regulator and licence before depositing, who is relying on the projection shown on the page, "
          "or who expects a return guaranteed by a testimonial.")
      + p("The page's own risk disclosure says the value of investments can go down and you may get back less than you invested. Take that at face value.", " bd-note"))

    faqs = [
      (f"Is {N} legit?", "We could not confirm it from the page. No regulator name, licence number or company number is given, so check the company details before you deposit."),
      (f"Is {N} a scam?", "We cannot say either way. The page makes several claims without a source, so test a small withdrawal early and register only through the official site."),
      (f"What is the {N} minimum deposit?", "£180, according to the FAQ on the platform's page."),
      (f"Does {N} charge fees?", "The page says there are no hidden fees and that charges are shown before sign-up, but it gives no fee amounts. Ask for the schedule in writing."),
      (f"How long does a {N} withdrawal take?", "The page says withdrawals can be made anytime from the dashboard, and that bank processing time applies. No timeframe is given."),
      (f"Does {N} have a demo account?", "The page does not mention one."),
      (f"Does {N} have a mobile app?", "The page lists a mobile app, but gives no app store details."),
      (f"Is {N} available in my country?", "The page claims it is relied upon in over 150 countries, without naming them. It says availability may vary by jurisdiction, so check the sign-up form for your country."),
      (f"Does {N} guarantee profits?", "No. The page's risk disclosure says past performance is not reliable and that the illustrations are not a guarantee of earnings. A testimonial on the page says money arrives back when promised, but no guarantee is stated elsewhere."),
    ]
    faq = ('<section class="bd-section bd-section--faq">\n<h2 class="bd-heading">Frequently Asked Questions</h2>\n<div class="bd-faq">\n' + "".join(
        f'<div class="bd-faq__item">\n<h3 class="bd-subheading">{q}</h3>\n' + p(a) + "</div>\n" for q, a in faqs) + "</div>\n</section>\n")

    verdict = ('<section class="bd-verdict-card">\n<div class="bd-verdict-card__icon" aria-hidden="true"></div>\n<div class="bd-verdict-card__body">\n'
      f'<h2 class="bd-heading">Where We Land on {N}</h2>\n'
      + p(f"The page makes a clear offer: a £180 start, free sign-up, staking up to 8.5% APY and a personal analyst. What it does not make clear is who runs the company, who regulates it, what it charges or how fast you can withdraw.")
      + p("If you still want to look further, keep the first deposit at the minimum, check the company details in writing and make a small withdrawal before you add more.")
      + f'</div>\n<div class="bd-verdict-card__score">\n<div class="bd-verdict-card__number">{RATING}</div>\n<div>/5</div>\n</div>\n'
      f'<div class="bd-stars bd-stars--lg" aria-label="{RATING} out of 5">\n<div class="bd-stars__fill" style="width:{round(RATING * 20)}%"></div>\n</div>\n'
      '<div class="bd-verdict-card__tag">Worth Considering</div>\n</section>\n')

    body = ('\n<div class="bd-review">\n' + intro + r.product_link(URL, "Discover More") + r.rating_bar(RATING)
      + r.banner(URL, "Want to look at it yourself?", "Read the terms and check the company details first", "Discover More")
      + ov + r.product_link(URL, "Learn More") + balance
      + r.cta_bar(URL, "Minimum Deposit: £180", "Check the company details before you fund", "Learn More")
      + how + gs + r.banner(URL, "Ready to take a closer look?", "Test a withdrawal before you add more funds", f"Explore {N}")
      + pricing + r.product_link(URL, "Learn More") + markets + r.product_link(URL, "Discover More") + cred + r.product_link(URL, "Learn More")
      + mist + r.product_link(URL, "Learn More") + chk + r.product_link(URL, f"Explore {N}") + audience + faq + verdict
      + r.banner(URL, "Still deciding?", "Whatever you choose, start small", f"Learn More About {N}") + RISK + "</div>\n")
    body = re.sub(r"\n\n+", "\n", body)
    body = FIX.fix_html(body)
    assert "—" not in body and "unverified" not in body.lower() and "affiliate" not in body.lower() and "partner" not in body.lower(), N
    assert len(TITLE) <= 60 and 125 <= len(DESC) <= 155, (len(TITLE), len(DESC))
    words = len(r.plain(body).split())
    u = f"{SITE}/trading/{SLUG}"
    jsonld = json.dumps({"@context": "https://schema.org", "@graph": [
      {"@type": "Article", "@id": f"{u}#article", "isPartOf": {"@id": u}, "author": ORG, "headline": TITLE, "datePublished": DATE, "mainEntityOfPage": {"@id": u},
       "wordCount": words, "commentCount": 0, "articleSection": ["Trading"], "inLanguage": "en-US",
       "potentialAction": [{"@type": "CommentAction", "name": "Comment", "target": [f"{u}#respond"]}]},
      {"@type": "WebPage", "@id": u, "url": u, "name": TITLE, "isPartOf": {"@id": f"{SITE}/#website"}, "datePublished": DATE, "author": ORG,
       "description": DESC, "breadcrumb": {"@id": f"{u}#breadcrumb"}, "inLanguage": "en-US", "potentialAction": [{"@type": "ReadAction", "target": [u]}]},
      {"@type": "BreadcrumbList", "@id": f"{u}#breadcrumb", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"}, {"@type": "ListItem", "position": 2, "name": TITLE}]}]})
    rjl = json.dumps({"@context": "https://schema.org", "@graph": [{"@type": "Review", "itemReviewed": {"@type": "SoftwareApplication", "name": N,
      "applicationCategory": "FinanceApplication", "applicationSubCategory": "AI investing platform", "operatingSystem": "Web"},
      "reviewRating": {"@type": "Rating", "ratingValue": str(RATING), "bestRating": "5", "worstRating": "1"}, "author": ORG, "datePublished": DATE}]})
    post = {"type": "trading", "slug": SLUG, "title": TITLE, "description": DESC, "author": AUTHOR[0], "authorSlug": AUTHOR[1], "date": DATE,
            "readingTime": f"{max(4, round(words / 200))} min read", "categories": ["trading"], "excerpt": f"<p>{DESC}</p>", "content": body,
            "jsonLd": jsonld, "ogImage": "", "ctaUrl": URL, "reviewJsonLd": rjl}
    with open(f"content/posts/trading/{SLUG}.json", "w", encoding="utf-8") as fh:
        json.dump(post, fh, separators=(",", ":"), ensure_ascii=True)
    print(f"{SLUG} {RATING} title={len(TITLE)} desc={len(DESC)} words={words}")


if __name__ == "__main__":
    build()
