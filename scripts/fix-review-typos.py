#!/usr/bin/env python3
"""
Site-wide typo and consistency repairs on review posts (idempotent):
  - "a"/"an" agreement ("an browser-based" -> "a browser-based", "a unbiased" -> "an unbiased")
  - a stray space before a comma/full stop ("with the system , here" -> "with the system, here")
  - "the The Big Bull" -> "The Big Bull"
  - HTML-entity em-dashes (&#8212; / &mdash;) -> a comma
  - Article/WebPage JSON-LD kept in step with title, description, word count and dateModified
Run: python3 scripts/fix-review-typos.py [--dry-run]; then node scripts/gen-review-schema.mjs and qa-reviews.py.
"""
import glob
import html
import json
import re
import sys

POSTS = "content/posts/trading"
USOUND = re.compile(r"^(u[bcdfghjklmnpqrstvwxyz][aeiou]|us[aeiou]|usd|uk\b|ufo|euro|eu\b|one|once)", re.I)


def an_needed(w):
    wl = w.lower()
    if re.match(r"^(hour|honest|honor|honour|heir)", wl):
        return True
    return bool(re.match(r"[aeiou]", wl)) and not USOUND.match(wl)


def fix_article(m):
    art, word = m.group(1), m.group(2)
    if re.match(r"^[A-Z0-9]{2,}", word):  # acronyms and tickers keep their article
        return m.group(0)
    want_an = an_needed(word)
    if art in ("a", "A") and want_an:
        return ("An" if art == "A" else "an") + " " + word
    if art in ("an", "An") and not want_an:
        return ("A" if art == "An" else "a") + " " + word
    return m.group(0)


def fix_text(t):
    t = re.sub(r"\b(an?|An?) ([A-Za-z][\w-]*)", fix_article, t)
    t = re.sub(r"(\w) ([,.;:])(?!\d)(?=\s|$)", r"\1\2", t)
    t = re.sub(r"\bthe The\b", "The", t)
    return t


def fix_html(c):
    c = re.sub(r"\s*(?:&#8212;|&mdash;)\s*", ", ", c)
    parts = re.split(r"(<[^>]+>)", c)
    return "".join(p if p.startswith("<") else fix_text(p) for p in parts)


def plain(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def sync_jsonld(p):
    try:
        j = json.loads(p["jsonLd"])
    except Exception:
        return False
    words = len(plain(p["content"]).split())
    for n in j.get("@graph", []):
        t = n.get("@type")
        if t == "Article":
            n["headline"] = p["title"]
            n["wordCount"] = words
            if p.get("dateModified"):
                n["dateModified"] = p["dateModified"]
        elif t == "WebPage":
            n["name"] = p["title"]
            n["description"] = p["description"]
            if p.get("dateModified"):
                n["dateModified"] = p["dateModified"]
        elif t == "BreadcrumbList" and n.get("itemListElement"):
            n["itemListElement"][-1]["name"] = p["title"]
    new = json.dumps(j, ensure_ascii=True)
    changed = new != p["jsonLd"]
    p["jsonLd"] = new
    return changed


def main():
    dry = "--dry-run" in sys.argv
    n_text = n_ld = 0
    for f in sorted(glob.glob(f"{POSTS}/*.json")):
        p = json.load(open(f))
        orig = json.dumps(p, sort_keys=True)
        p["content"] = fix_html(p["content"])
        for k in ("description", "title"):
            p[k] = fix_text(re.sub(r"\s*(?:&#8212;|&mdash;)\s*", ", ", p[k]))
        if p.get("excerpt"):
            p["excerpt"] = fix_html(p["excerpt"])
        # FAQ answer that repeats the withdrawal sentence already on the page
        c = p["content"]
        m = re.search(r'<h3 class="bd-subheading">How long does a [^<]*withdrawal take\?</h3>\n<p class="bd-text">([^<]*)</p>', c)
        if m:
            ans = m.group(1)
            if c.count(f'<p class="bd-text" data-facts="1">{ans}</p>') + c.count(f'<p class="bd-text">{ans}</p>') > 1 and "Check the withdrawal terms" not in ans:
                c = c.replace(m.group(0), m.group(0).replace(ans, ans.rstrip(".") + ". Check the withdrawal terms for any minimum amount, fee or identity (KYC) step."), 1)
                p["content"] = c
        changed_text = json.dumps(p, sort_keys=True) != orig
        if sync_jsonld(p):
            n_ld += 1
        if changed_text:
            n_text += 1
        if not dry:
            json.dump(p, open(f, "w", encoding="utf-8"), separators=(",", ":"), ensure_ascii=True)
    print(f"text repaired on {n_text} posts, JSON-LD synced on {n_ld} posts{' (dry run)' if dry else ''}")


if __name__ == "__main__":
    main()
