#!/usr/bin/env python3
"""
Quality gate for trading review posts (content/posts/trading/*.json).

Every check here exists because the problem was found on the live site once already.

    python3 scripts/qa-reviews.py                # report problems
    python3 scripts/qa-reviews.py --fix          # also repair the ones that are safe to repair
    python3 scripts/qa-reviews.py slug-a slug-b  # limit to some posts (a "-review" suffix is optional)

Exit code is 1 while unresolved problems remain, so it can gate a commit.
After --fix run `node scripts/gen-review-schema.mjs` and, for new posts,
`python3 scripts/update-manifest-batch.py`.
"""
import glob
import html
import json
import os
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone

POSTS = "content/posts/trading"
MANIFEST = "content/manifest.json"
CTA_LABEL = "Open an Account (Partner Link)"
EM = "—"

COST = re.compile(r"cost|fee|pric|deposit|charge|spread", re.I)
SKIP = re.compile(r"faq|frequently|risk|verdict|where we land|checklist|mistake", re.I)
BANNER_RE = re.compile(r'<div class="bd-banner-cta">.*?</a></div>\s*</div>', re.S)
PL_TAIL = re.compile(r'<div class="bd-product-link">(?:(?!<section|</section>).)*?</div>\s*$', re.S)
BTN_PATTERNS = [
    re.compile(r'(<a [^>]*class="bd-banner-cta__btn"[^>]*>)(.*?)(<span class="bd-ext")', re.S),
    re.compile(r'(<div class="bd-product-link"><a [^>]*>)(.*?)(<span class="bd-ext")', re.S),
    re.compile(r'(<a [^>]*class="bd-cta-bar__btn"[^>]*>)(.*?)(<span class="bd-ext")', re.S),
]
# The keyword itself contains a name, so that review (written earlier, without any endorsement claim) is allowed.
CELEB_EXEMPT = {"quantum-ai-mike-cannon-brookes-review"}
CELEB = re.compile(r"kohler|greenwood|albanese|rinehart|stefanovic|chalmers|bullock|koch\b|deepfake|cannon-brookes", re.I)


# ---------------------------------------------------------------- helpers
def h2s(c):
    return [(m.start(), re.sub(r"<[^>]+>", "", m.group(1)).strip()) for m in re.finditer(r"<h2[^>]*>(.*?)</h2>", c, re.S)]


def section_start(c, pos):
    m = None
    for m in re.finditer(r"<section[^>]*>\s*$", c[:pos]):
        pass
    return m.start() if m else pos


def plain(s):
    return html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s))).strip()


def save(path, post):
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(post, fh, separators=(",", ":"), ensure_ascii=True)


# ------------------------------------------------------------------ fixes
def fix_24_7(c):
    """'24/7' once lost its '/7' and became '24'."""
    c = re.sub(r"(<td>(?:Help Desk|Customer Support|Support)</td>\s*<td>)24(</td>)", r"\g<1>24/7\g<2>", c)
    return re.sub(r"(?<![\d/.:\-])24 (?=(?:customer |live |round-the-clock )?support\b)", "24/7 ", c)


def fix_cta(c):
    """Banner before the first section and before the first cost section, standard label."""
    hs = h2s(c)
    b = BANNER_RE.search(c)
    if not hs or not b:
        return c
    banner = b.group(0) + "\n"
    ops = []
    first = hs[0][0]
    rb = c.find("bd-rating-bar")
    if "bd-banner-cta" not in c[max(rb, 0):first]:
        ops.append((section_start(c, first), section_start(c, first)))
    for i, (pos, t) in enumerate(hs):
        if COST.search(t) and not SKIP.search(t) and i > 0:
            s = section_start(c, pos)
            head = c[:s]
            tail = head[-1200:]
            if "bd-banner-cta" in tail and tail.rfind("bd-banner-cta") > tail.rfind("</section>"):
                break
            m = PL_TAIL.search(head)
            ops.append((m.start(), s) if m else (s, s))
            break
    for a, z in sorted(ops, reverse=True):
        c = c[:a] + banner + c[z:]
    for pat in BTN_PATTERNS:
        c = pat.sub(lambda m: m.group(1) + CTA_LABEL + m.group(3), c)
    return c


def fix_emdash(s):
    return s.replace(" " + EM + " ", ", ").replace(EM, ", ")


# ----------------------------------------------------------------- checks
def check(post, manifest_card, fix):
    s = post["slug"]
    c = post["content"]
    probs, fixed = [], []

    def problem(msg):
        probs.append(msg)

    changed = False
    # 1. title / description length
    if len(post["title"]) > 60:
        problem(f"title is {len(post['title'])} chars (max 60)")
    if not 120 <= len(post["description"]) <= 160:
        problem(f"description is {len(post['description'])} chars (want 125-155)")
    # 2. em-dash anywhere, including JSON-LD strings where it is escaped
    for key in ("title", "description", "excerpt", "content", "jsonLd", "reviewJsonLd"):
        v = post.get(key, "")
        if EM in v or "\\u2014" in v:
            if fix and key in ("excerpt", "content", "jsonLd", "reviewJsonLd"):
                post[key] = fix_emdash(v.replace("\\u2014", EM))
                changed = True
                fixed.append(f"em-dash removed from {key}")
            else:
                problem(f"em-dash in {key}")
    c = post["content"]  # may have just been repaired above
    # 3. truncated 24/7
    if re.search(r"<td>(?:Help Desk|Customer Support|Support)</td>\s*<td>24</td>", c) or re.search(
        r"(?<![\d/.:\-])24 (?:customer |live )?support\b", plain(c)
    ):
        if fix:
            post["content"] = c = fix_24_7(c)
            changed = True
            fixed.append("24/7 restored")
        else:
            problem('"24/7" truncated to "24"')
    # 4. slug must be plain ASCII
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", s):
        problem("slug is not plain ascii kebab-case")
    # 5. CTAs: banner before first section and cost section, standard label, one link
    hs = h2s(c)
    if hs and BANNER_RE.search(c):
        ev = sorted([(p, "H:" + t) for p, t in hs] + [(m.start(), "B") for m in re.finditer(r'<div class="bd-banner-cta">', c)])
        seq = [t for _, t in ev]
        fi = next(i for i, t in enumerate(seq) if t.startswith("H:"))
        bad = seq[fi - 1] != "B"
        ci = next((i for i, t in enumerate(seq) if t.startswith("H:") and COST.search(t) and not SKIP.search(t) and i > fi), None)
        bad = bad or (ci is not None and seq[ci - 1] != "B")
        labels = [plain(m.group(2)) for pat in BTN_PATTERNS for m in pat.finditer(c)]
        bad_label = [x for x in labels if x != CTA_LABEL]
        if bad or bad_label:
            if fix:
                post["content"] = c = fix_cta(c)
                changed = True
                fixed.append("CTA banners/labels normalised")
            else:
                problem("CTA banner missing before the first or the cost section" if bad else "non-standard CTA button label")
    elif hs:
        problem("no banner CTA on the page")
    urls = set(re.findall(r'class="bd-banner-cta__btn"[^>]*href="([^"]+)"', c)) | set(
        re.findall(r'<div class="bd-product-link"><a href="([^"]+)"', c)
    ) | set(re.findall(r'<a [^>]*href="([^"]+)"[^>]*class="bd-banner-cta__btn"', c))
    if len(urls) > 1:
        problem(f"{len(urls)} different CTA links on one page")
    # 6. FAQ in schema must match the visible FAQ; rating must agree everywhere
    try:
        rld = json.loads(post["reviewJsonLd"])
        graph = rld["@graph"] if "@graph" in rld else [rld]
        rev = next(n for n in graph if n.get("@type") == "Review")
        rating = rev["reviewRating"]["ratingValue"]
        if rev["author"].get("@type") != "Organization":
            problem("Review author is not the Organization")
        faq = next((n for n in graph if n.get("@type") == "FAQPage"), None)
        vis = [plain(x) for x in re.findall(r'<div class="bd-faq__item">\s*<h3[^>]*>(.*?)</h3>', c, re.S)]
        if faq:
            norm = lambda t: t.translate({0x2018: "'", 0x2019: "'", 0x201C: '"', 0x201D: '"'})  # noqa: E731
            names = [norm(plain(q["name"])) for q in faq["mainEntity"]]
            if names != [norm(v) for v in vis]:
                problem("FAQ schema differs from the visible FAQ (run gen-review-schema.mjs)")
        card = manifest_card.get(s)
        if card and card.get("ratingValue") != rating:
            problem(f"manifest rating {card.get('ratingValue')} != schema rating {rating}")
        m = re.search(r'bd-verdict-card__number">([\d.]+)<', c)
        if m and m.group(1) != rating:
            problem(f"verdict card {m.group(1)} != schema rating {rating}")
        if card and card.get("title") != post["title"]:
            problem("manifest title differs from the post title")
    except Exception as e:  # noqa: BLE001
        problem(f"reviewJsonLd unreadable: {e}")
    # 7. not dated in the future
    try:
        if datetime.fromisoformat(post["date"]) > datetime.now(timezone.utc):
            problem("published date is in the future")
    except Exception:  # noqa: BLE001
        problem("unreadable date")
    # 8. banned content
    if s not in CELEB_EXEMPT and CELEB.search(plain(c)):
        problem("celebrity / deepfake wording")
    if changed:
        post["_changed"] = True
    return probs, fixed


def main():
    fix = "--fix" in sys.argv
    wanted = {a if a.endswith("-review") else a + "-review" for a in sys.argv[1:] if not a.startswith("--")}
    manifest = json.load(open(MANIFEST))
    card = {c["slug"]: c for pg in manifest["homePages"] for c in pg}
    problems = defaultdict(list)
    fixes = Counter()
    titles, descs, ratings = Counter(), Counter(), Counter()
    posts = []
    for path in sorted(glob.glob(f"{POSTS}/*.json")):
        post = json.load(open(path))
        if wanted and post["slug"] not in wanted:
            continue
        posts.append((path, post))
    for path, post in posts:
        titles[post["title"]] += 1
        descs[post["description"]] += 1
        probs, fixed = check(post, card, fix)
        for f in fixed:
            fixes[f] += 1
        if post.pop("_changed", False):
            save(path, post)
            # re-check after repairs
            probs, _ = check(json.load(open(path)), card, False)
        for p in probs:
            problems[p].append(post["slug"])
    for t, n in titles.items():
        if n > 1:
            problems["duplicate title"].append(t)
    for d, n in descs.items():
        if n > 1:
            problems["duplicate description"].append(d[:60])
    if not wanted:
        slugs = {p["slug"] for _, p in posts}
        if set(card) - {c["slug"] for pg in manifest["homePages"] for c in pg if c["type"] != "trading"} != slugs:
            missing = slugs - set(card)
            extra = {s for s, c in card.items() if c["type"] == "trading"} - slugs
            if missing:
                problems["post missing from manifest (run update-manifest-batch.py)"] += sorted(missing)
            if extra:
                problems["manifest card without a post"] += sorted(extra)
    print(f"{len(posts)} review posts checked" + (" (with --fix)" if fix else ""))
    for k, v in fixes.items():
        print(f"  fixed: {k} on {v} posts")
    if not problems:
        print("OK, no problems found")
        return 0
    for msg, items in sorted(problems.items(), key=lambda x: -len(x[1])):
        print(f"  PROBLEM: {msg}: {len(items)} -> {', '.join(items[:5])}{' ...' if len(items) > 5 else ''}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
