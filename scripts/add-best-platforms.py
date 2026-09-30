#!/usr/bin/env python3
"""
Add the 39 batch reviews to the hardcoded BEST_PLATFORMS list in lib/bestPlatforms.ts,
placing them at the top (rank 1-39) and renumbering the existing 10 entries to 40-49.

Honest-content policy: score = the review's real rating, minDeposit = $250 (owner-provided),
and demo/support/payout use an em dash ("—") because that data is not verified and the owner
asked not to print "Not verified". Taglines/pros/cons/verdicts are honest category-level copy.
"""
import os
import re
import importlib.util

# gen-batch-reviews.py has hyphens, so it isn't a normal importable module.
_HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("gen_batch_reviews", os.path.join(_HERE, "gen-batch-reviews.py"))
_gbr = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_gbr)
BRANDS = _gbr.BRANDS
slugify = _gbr.slugify
rating_for = _gbr.rating_for

FILE = "lib/bestPlatforms.ts"
MARKER = "export const BEST_PLATFORMS: BestPlatform[] = ["

TAGLINES = [
    "A browser-based AI trading platform with a $250 starting deposit.",
    "One of many AI trading platforms in this category, with a $250 entry.",
    "An automated trading platform asking a standard $250 minimum deposit.",
]

PROS = [
    ["Low $250 minimum deposit.", "Signal-assisted trading through a web dashboard.", "Category-standard browser setup."],
    ["A $250 entry point keeps the first step small.", "Trading runs from a simple web dashboard.", "Standard setup, quick to open."],
]

CONS = [
    ["Operator and licensing are unclear.", "Little independent track record to evaluate.", "Automation reduces effort, not market risk."],
    ["No clear operator or regulator is disclosed.", "Too little public history to assess reliability.", "Automation does not remove market risk."],
]

def verdict_for(name, i):
    if i % 2 == 0:
        return (f"{name} is one of many browser-based AI trading platforms in this category. "
                f"The $250 minimum deposit is standard, and automation reduces effort rather than risk. "
                f"Check who operates it and where it is licensed before you fund it.")
    return (f"{name} asks a standard $250 minimum deposit and offers signal-assisted trading. "
            f"As with every platform in this category, check the operator and licensing before funding, "
            f"and treat automation as a tool rather than a guarantee.")

def entry(i, name, slug, rating):
    tagline = TAGLINES[i % len(TAGLINES)]
    pros = PROS[i % len(PROS)]
    cons = CONS[i % len(CONS)]
    verdict = verdict_for(name, i)
    lines = [
        "  {",
        f"    rank: {i + 1},",
        f"    name: '{name}',",
        f"    slug: '{slug}',",
        f"    score: {rating:.1f},",
        f"    tagline: '{tagline}',",
        "    minDeposit: '$250',",
        "    demo: '—',",
        "    support: '—',",
        "    payout: '—',",
        "    pros: [",
    ]
    for p in pros:
        lines.append(f"      '{p}',")
    lines.append("    ],")
    lines.append("    cons: [")
    for c in cons:
        lines.append(f"      '{c}',")
    lines.append("    ],")
    lines.append("    verdict:")
    lines.append(f"      '{verdict}',")
    lines.append("  },")
    return "\n".join(lines)

def main():
    content = open(FILE, encoding="utf-8").read()
    idx = content.index(MARKER) + len(MARKER)
    header = content[:idx]
    rest = content[idx:]
    # renumber the existing 10 entries (rank 1..10 -> 40..49)
    rest = re.sub(r"rank: (\d+),", lambda m: f"rank: {int(m.group(1)) + 39},", rest)

    blocks = []
    for i, (name, _analysis) in enumerate(BRANDS):
        slug = slugify(name) + "-review"
        rating = rating_for(name)
        blocks.append(entry(i, name, slug, rating))
    new_entries = "\n".join(blocks)

    new_content = header + "\n" + new_entries + rest
    open(FILE, "w", encoding="utf-8").write(new_content)
    print(f"Inserted {len(blocks)} entries; total BEST_PLATFORMS now {len(blocks) + 10}.")

if __name__ == "__main__":
    main()
