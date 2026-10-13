#!/usr/bin/env python3
"""
Keep the verdict label honest and identical everywhere.

  - A review whose own text says the operator or regulator could not be confirmed must not carry the
    "Recommended" tag; it becomes "Worth a Small Test" (the rating itself is untouched).
  - Every manifest card gets `verdict` = the tag on the review's verdict card, so the quick verdict badge,
    the sidebar, the listing cards, Editor's Picks and the share image all say the same thing.

Run after changing any review: python3 scripts/sync-verdict-labels.py
"""
import glob
import html
import json
import re

HEDGE = re.compile(
    r"could not (?:independently )?(?:confirm|verify)|couldn.t (?:verify|confirm)|not something we could confirm|"
    r"unconfirmed|no confirmed (?:operator|licen[cs]e|regulator)|cannot (?:call|say)|not independently verified|"
    r"(?:operator|regulator)[^.]{0,40}(?:not|could not)[^.]{0,20}confirm", re.I)


def plain(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


tags, changed = {}, 0
for f in glob.glob("content/posts/trading/*.json"):
    p = json.load(open(f))
    c = p["content"]
    m = re.search(r'(bd-verdict-card__tag">)(.*?)(<)', c)
    if not m:
        continue
    tag = m.group(2)
    if tag == "Recommended" and HEDGE.search(plain(c)):
        p["content"] = c[: m.start(2)] + "Worth a Small Test" + c[m.end(2):]
        tag = "Worth a Small Test"
        json.dump(p, open(f, "w", encoding="utf-8"), separators=(",", ":"), ensure_ascii=True)
        changed += 1
    tags[p["slug"]] = tag
man = json.load(open("content/manifest.json"))
n = 0


def fix(cards):
    global n
    for c in cards:
        t = tags.get(c["slug"])
        if t and c.get("verdict") != t:
            c["verdict"] = t
            n += 1


for pg in man["homePages"]:
    fix(pg)
for a in man["authors"].values():
    for pg in a["pages"]:
        fix(pg)
open("content/manifest.json", "w").write(json.dumps(man, ensure_ascii=True, separators=(",", ":")))
print(f"verdict tags changed on {changed} reviews, manifest cards updated: {n}")
