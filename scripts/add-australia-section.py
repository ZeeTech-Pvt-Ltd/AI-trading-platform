#!/usr/bin/env python3
"""
Add an Australia-focused section, two FAQ items and an intro line to chosen reviews.

Only general, checkable facts about Australian regulation are used (ASIC, AFS licence, Financial
Services Register, investor alert list, Scamwatch, MoneySmart, AFCA). Nothing is claimed about the
platform itself: availability and licence status are stated as "could not confirm".

    python3 scripts/add-australia-section.py slug-review [slug-review ...]

Idempotent: elements carry data-au="1" and are removed before being added again.
After running: node scripts/gen-review-schema.mjs and python3 scripts/qa-reviews.py.
"""
import json
import re
import sys
from datetime import datetime, timezone

POSTS = "content/posts/trading"
RA = "&#8217;"
INTRO_ADD = " This review also covers what Australian readers should check first."


def brand(post):
    g = json.loads(post["reviewJsonLd"])["@graph"]
    return [n for n in g if n.get("@type") == "Review"][0]["itemReviewed"]["name"]


def desc_for(N, slug):
    opts = [
        f"{N} review for Australian traders: the $250 minimum deposit, how it works, and what to check on ASIC{RA}s register before you sign up.",
        f"Is {N} legit in Australia? We cover how it works, the $250 minimum deposit, fees and the ASIC checks to run before you register.",
    ]
    opts = [re.sub(r"&#\d+;", "'", o) for o in opts]
    ok = [o for o in opts if 125 <= len(o) <= 155]
    return ok[int(re.sub(r"\D", "", str(sum(map(ord, slug)))) or 0) % len(ok)] if ok else opts[0]


def section(N):
    return (
        '<section class="bd-section" data-au="1">\n'
        f'<h2 class="bd-heading">Is {N} Legit in Australia?</h2>\n'
        '<p class="bd-text">If you are in Australia, the first question is whether a platform is licensed at home. Businesses that offer '
        'financial products or trading services to Australian retail clients generally need an Australian Financial Services (AFS) '
        'licence issued by ASIC, the Australian Securities and Investments Commission.</p>\n'
        f'<p class="bd-text">We could not confirm whether {N} holds an AFS licence or accepts clients in Australia, so treat it as '
        'unconfirmed until you have checked it yourself.</p>\n'
        '<p class="bd-text">Checks for Australian traders:</p>\n'
        '<ul class="bd-list">\n'
        f'<li>Search the company name and any licence number on ASIC{RA}s Financial Services Register.</li>\n'
        '<li>Check ASIC&#8217;s investor alert list for the name and the website address.</li>\n'
        '<li>Search the name on Scamwatch and MoneySmart for scam reports.</li>\n'
        '<li>Ask whether the firm belongs to the Australian Financial Complaints Authority (AFCA), the free dispute service that '
        'licensed firms dealing with retail clients are required to join.</li>\n'
        '<li>Check the deposit currency. If deposits are taken in US dollars, your bank may add currency conversion charges.</li>\n'
        '<li>ASIC limits the leverage retail clients can use on CFDs, so be wary of any platform that promises far higher leverage.</li>\n'
        '</ul>\n'
        '<p class="bd-text">If you think you have been targeted by a scam, contact your bank straight away and report it to Scamwatch. '
        'This section is general information, not legal or financial advice.</p>\n'
        '</section>\n'
    )


def faq_items(N):
    return (
        '<div class="bd-faq__item">\n'
        f'<h3 class="bd-subheading">Is {N} legit in Australia?</h3>\n'
        f'<p class="bd-text">We could not confirm that {N} holds an AFS licence from ASIC or that it accepts Australian residents. '
        f'Check ASIC{RA}s Financial Services Register and investor alert list before you deposit.</p>\n</div>\n'
        '<div class="bd-faq__item">\n'
        f'<h3 class="bd-subheading">Is {N} regulated by ASIC?</h3>\n'
        f'<p class="bd-text">We could not confirm an ASIC licence or registration for {N}. Look up the company name and licence number '
        f'on ASIC{RA}s Financial Services Register, and be cautious if you cannot find it.</p>\n</div>\n'
    )


def strip(c):
    c = re.sub(r'<section class="bd-section" data-au="1">.*?</section>\n', "", c, flags=re.S)
    c = re.sub(r'<div class="bd-faq__item">\n<h3 class="bd-subheading">(?:Is [^<]* legit in Australia\?|Is [^<]* regulated by ASIC\?)</h3>\n.*?</div>\n', "", c, flags=re.S)
    c = re.sub(r'<div class="bd-faq__item" data-au="1">.*?</div>\n', "", c, flags=re.S)
    c = re.sub(r'<tr data-au="1">.*?</tr>\n', "", c, flags=re.S)
    return c.replace(INTRO_ADD, "")


def apply(slug):
    path = f"{POSTS}/{slug}.json"
    post = json.load(open(path))
    c = strip(post["content"])
    N = brand(post)
    # intro line
    m = re.search(r'(<section class="bd-section bd-intro">.*?)(</p>\n)(</section>)', c, re.S)
    assert m, slug
    c = c[: m.end(1)] + INTRO_ADD + c[m.end(1):]
    # glance row on journey pages
    if post.get("journeyLayout"):
        c = re.sub(r"(<tr>\s*<td>Operator</td>.*?</tr>\n)", lambda x: x.group(1) + '<tr data-au="1">\n<td>Available in Australia</td>\n<td>Not confirmed</td>\n</tr>\n', c, count=1, flags=re.S)
    # section before the FAQ, and FAQ items
    faq = c.index('<section class="bd-section bd-section--faq">')
    c = c[:faq] + section(N) + c[faq:]
    faq = c.index('<section class="bd-section bd-section--faq">')
    items = [x.start() for x in re.finditer(r'<div class="bd-faq__item">', c[faq:])]
    if post.get("journeyLayout") and len(items) >= 3:
        at = faq + items[2]
    else:
        at = c.index("</div>\n</section>", c.index('<div class="bd-faq">', faq))
    c = c[:at] + faq_items(N) + c[at:]
    post["content"] = c
    post["description"] = desc_for(N, slug)
    if post.get("journeyLayout") and not post["title"].endswith("in Australia?") and slug in NEW_TITLES:
        post["title"] = NEW_TITLES[slug].replace("{N}", N)
    now = datetime.now(timezone.utc).replace(second=0, microsecond=0)
    if post["date"] < now.strftime("%Y-%m-%dT00:00:00+00:00"):
        post["dateModified"] = now.strftime("%Y-%m-%dT%H:%M:00+00:00")
    json.dump(post, open(path, "w", encoding="utf-8"), separators=(",", ":"), ensure_ascii=True)
    print(f"{slug}: {len(post['description'])} chars | {post['title']}")


# not yet published: the title can carry Australia
NEW_TITLES = {
    "bitzonex-cylora-review": "{N} Review 2026: Legit in Australia?",
    "turbo-hiberix-review": "{N} Review 2026: Is It Legit in Australia?",
    "profectus-ai-review": "{N} Review 2026: Is It Legit in Australia?",
}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    for s in sys.argv[1:]:
        apply(s)
