#!/usr/bin/env python3
"""
Add the newly generated batch reviews to content/manifest.json.

Finds any trading post whose slug isn't already represented by a manifest card,
builds a Card for each (same key order the existing cards use), prepends them to
homePages and to the matching author's pages (newest first), re-paginates at 9
cards per page, and writes the manifest back single-line minified with
ensure_ascii=True and no trailing newline (matching the current file).
"""
import json, re, os

POSTS_DIR = "content/posts/trading"
MANIFEST = "content/manifest.json"
PER_PAGE = 9

def plain_excerpt(html):
    return re.sub(r"</?p>", "", html).strip()

def main():
    manifest = json.load(open(MANIFEST))

    existing = {c["slug"] for page in manifest["homePages"] for c in page}
    new_slugs = sorted(
        f[:-5] for f in os.listdir(POSTS_DIR)
        if f.endswith(".json") and f[:-5] not in existing
    )
    print(f"New slugs to add: {len(new_slugs)}")

    new_cards = []
    for slug in new_slugs:
        post = json.load(open(os.path.join(POSTS_DIR, slug + ".json")))
        rjl = json.loads(post["reviewJsonLd"])
        rating = next(n["reviewRating"]["ratingValue"] for n in rjl["@graph"] if n.get("@type") == "Review")
        card = {
            "type": post["type"],
            "slug": slug,
            "title": post["title"],
            "excerpt": plain_excerpt(post["excerpt"]),
            "author": post["author"],
            "authorSlug": post["authorSlug"],
            "date": post["date"],
            "readingTime": post["readingTime"],
            "ratingValue": rating,
        }
        new_cards.append(card)

    new_cards.sort(key=lambda c: c["date"], reverse=True)

    # homePages: prepend and re-paginate
    flat = [c for page in manifest["homePages"] for c in page]
    flat = new_cards + flat
    manifest["homePages"] = [flat[i:i + PER_PAGE] for i in range(0, len(flat), PER_PAGE)]

    # authors: prepend each author's cards and re-paginate
    by_author = {}
    for c in new_cards:
        by_author.setdefault(c["authorSlug"], []).append(c)

    for aslug, cards in by_author.items():
        author = manifest["authors"][aslug]
        afl = [c for page in author["pages"] for c in page]
        afl = cards + afl  # new cards are all newer than existing
        author["pages"] = [afl[i:i + PER_PAGE] for i in range(0, len(afl), PER_PAGE)]

    out = json.dumps(manifest, ensure_ascii=True, separators=(",", ":"))
    with open(MANIFEST, "w") as f:
        f.write(out)

    print(f"homePages: {len(manifest['homePages'])} pages, {len(flat)} cards")
    for aslug, a in manifest["authors"].items():
        print(f"  author {aslug}: {len(a['pages'])} pages, {sum(len(p) for p in a['pages'])} cards")

if __name__ == "__main__":
    main()
