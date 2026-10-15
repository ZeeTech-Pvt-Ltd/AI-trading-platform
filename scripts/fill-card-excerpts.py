#!/usr/bin/env python3
"""
Give every review card (home page, reviews page, author pages, related boxes) a short, honest hook when its
excerpt is empty. The text is built from facts on the review itself (deposit, asset type, what could not be
confirmed). No test claims, no returns, no urgency. Cards that already have an excerpt are left alone.

    python3 scripts/fill-card-excerpts.py            # fill empty cards
    python3 scripts/fill-card-excerpts.py --dry-run  # show what would be written
"""
import glob
import hashlib
import html
import json
import re
import sys

POSTS = "content/posts/trading"
MANIFEST = "content/manifest.json"

# Written by hand for the reviews built from the platform's own site
HAND = {
    "haveningry-review": "Says it is licensed in Australia, yet shows a London address and no licence number. See what does not add up.",
    "lodeminting-review": "No hidden fees, but a 2.9% card fee in the FAQ. What its site says, what it leaves out, and the checks to run.",
    "nexus-trade-ai-review": "A research and backtesting tool rather than a deposit scheme. How it works, what the plans cost and what we could not confirm.",
    "lithvestor-review": "An AUD 400 start, a 30% profit example and no named operator. What to check before you register.",
}


def plain(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def md5i(s):
    return int(hashlib.md5(s.encode()).hexdigest(), 16)


def facts(post):
    c = post["content"]
    t = plain(c)
    dep = None
    m = re.search(r"<td>(?:Minimum Deposit|Initial Funding|Minimum deposit|Starting Deposit)</td>\s*<td>(.*?)</td>", c, re.S)
    cand = plain(m.group(1)) if m else t
    d = re.search(r"(?:\$|AUD\s?|£|€)\s?\d[\d,]*", cand)
    if d:
        dep = d.group(0).replace(" ", "")
    asset = None
    a = re.search(r"<td>Asset Focus</td>\s*<td>(.*?)</td>", c, re.S)
    if a:
        asset = plain(a.group(1)).split(",")[0].strip().lower()
        asset = {"cryptocurrencies": "crypto", "forex pairs": "forex pairs"}.get(asset, asset)
    demo = bool(re.search(r"demo account|practice account", t, re.I))
    return dep, asset, demo


def hook(post):
    slug = post["slug"]
    if slug in HAND:
        return HAND[slug]
    name = [n for n in json.loads(post["reviewJsonLd"])["@graph"] if n.get("@type") == "Review"][0]["itemReviewed"]["name"]
    dep, asset, demo = facts(post)
    dep_txt = dep or "a small deposit"
    opts = [
        f"We look at what {name} claims, what it charges and who stands behind it before you register.",
        f"Is {name} worth {dep_txt}? The fees, withdrawals and licence questions to settle before you deposit.",
        f"Thinking about {name}? What it offers, what it costs and what it leaves unexplained.",
        f"A quick look at {name}: how it works, the {dep_txt} entry point and the checks worth making first.",
        f"What {name} promises, what we could confirm and what to ask before you register.",
    ]
    if asset:
        opts += [
            f"{name} offers {asset} from {dep_txt}{' with a demo account' if demo else ''}. What we could and could not confirm.",
            f"{name}: {asset} trading from {dep_txt}, plus payment and withdrawal claims we could not confirm.",
        ]
    return opts[md5i(slug) % len(opts)]


def main():
    dry = "--dry-run" in sys.argv
    posts = {}
    for f in glob.glob(f"{POSTS}/*.json"):
        p = json.load(open(f))
        posts[p["slug"]] = p
    man = json.load(open(MANIFEST))
    used = {c["excerpt"] for pg in man["homePages"] for c in pg if c.get("excerpt")}
    filled, text = 0, {}

    def fix(cards):
        nonlocal filled
        for c in cards:
            if c["type"] != "trading" or c.get("excerpt", "").strip():
                continue
            p = posts.get(c["slug"])
            if not p:
                continue
            if c["slug"] not in text:
                h = hook(p)
                k = 0
                while h in used and k < 7:  # keep every hook unique
                    k += 1
                    h = hook({**p, "slug": p["slug"] + str(k)}) if p["slug"] not in HAND else h
                used.add(h)
                text[c["slug"]] = h
            c["excerpt"] = text[c["slug"]]
            filled += 1

    for pg in man["homePages"]:
        fix(pg)
    for a in man["authors"].values():
        for pg in a["pages"]:
            fix(pg)
    if dry:
        for s, t in list(text.items())[:12]:
            print(f"{s:30s} | {t}")
    else:
        open(MANIFEST, "w").write(json.dumps(man, ensure_ascii=True, separators=(",", ":")))
    print(f"{len(text)} reviews, {filled} card entries {'would be ' if dry else ''}filled; longest {max(map(len, text.values()), default=0)} chars")


if __name__ == "__main__":
    main()
