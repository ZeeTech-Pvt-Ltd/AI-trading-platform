#!/usr/bin/env python3
"""
Add stated facts (fees, payment methods, support, withdrawals, app) to the journey-layout reviews,
always attributed and never written as our own finding.

Fill in platform-facts-template.csv (one row per platform) and run

    python3 scripts/apply-platform-facts.py path/to/platform-facts.csv            # apply
    python3 scripts/apply-platform-facts.py path/to/platform-facts.csv --dry-run  # show what would change

A row is used when it has a Source (a URL, or any short note such as "Provided by the service")
and at least one fact. A platform without facts is left exactly as it is. Every inserted element
carries data-facts="1", and a replaced paragraph keeps its original in data-orig, so running the
script again replaces the earlier facts instead of stacking them. The attribution is "the platform"
when the source is a URL and "the service" otherwise (override with an Attribution column).
After running: node scripts/gen-review-schema.mjs, then python3 scripts/qa-reviews.py.
"""
import csv
import hashlib
import html
import json
import re
import sys
from urllib.parse import urlparse

POSTS = "content/posts/trading"
COL = {
    "source": "Source URL (official site page or document the facts come from)",
    "markets": "Markets offered",
    "deposit": "Minimum deposit",
    "fee": "Registration fee",
    "payments": "Payment methods",
    "support": "Support (hours and channels)",
    "withdrawal": "Withdrawal policy (as stated by the platform)",
    "app": "Mobile app (yes or no, and where)",
    "regulator": "Regulator or licence number (if any)",
    "attribution": "Attribution (optional: the platform, the service, the provider)",
}


def esc(s):
    return html.escape(s.strip(), quote=False)


def pick(slug, key, options):
    return options[int(hashlib.md5((slug + key).encode()).hexdigest(), 16) % len(options)]


def lower_first(t):
    t = t.strip()
    return t[0].lower() + t[1:] if len(t) > 1 and t[0].isupper() and t[1].islower() else t


def strip_previous(c):
    # a replaced paragraph keeps its original text in data-orig, so it can be put back
    c = re.sub(r'<p class="bd-text" data-facts="1" data-orig="([^"]*)">.*?</p>\n', lambda m: html.unescape(m.group(1)) + "\n", c, flags=re.S)
    c = re.sub(r"<tr data-facts=\"1\">.*?</tr>\n?", "", c, flags=re.S)
    c = re.sub(r"<p class=\"bd-text[^\"]*\" data-facts=\"1\">.*?</p>\n?", "", c, flags=re.S)
    return c


def apply(post, f, dry):
    slug = post["slug"]
    c = strip_previous(post["content"])
    name = [n for n in json.loads(post["reviewJsonLd"])["@graph"] if n.get("@type") == "Review"][0]["itemReviewed"]["name"]
    is_url = f["source"].lower().startswith("http")
    A = f.get("attribution") or ("the platform" if is_url else "the service")
    host = urlparse(f["source"]).netloc if is_url else ""
    log = []

    def S(key, opts):
        return pick(slug, key, opts).replace("{A}", A).replace("{a}", A[0].upper() + A[1:])

    # at a glance table: the wording of common values and the row order differ from page to page
    def cell_text(key, val):
        v = val.strip()
        low = v.lower().rstrip(".")
        if key == "support" and low in ("24/7", "24x7", "24 7"):
            return pick(slug, "cs", ["24/7", "Available 24/7", "Round the clock (24/7)", "24/7 support"])
        if key == "fee" and low in ("free", "no fee", "none"):
            return pick(slug, "cf", ["Free", "Free to register", "No registration fee"])
        if key == "app" and re.search(r"\bno\b", low) and "app" in low:
            return pick(slug, "ca", ["No mobile app", "There is no mobile app", "Not available"])
        if key == "payments":
            items = [x.strip() for x in re.split(r",| and ", v) if x.strip()]
            if len(items) > 1:
                k = int(hashlib.md5((slug + "cp").encode()).hexdigest(), 16) % len(items)
                items = items[k:] + items[:k]
                v = ", ".join(items[:-1]) + " and " + items[-1]
        return v[0].upper() + v[1:]

    rows = []
    for key, label in (("markets", "Markets"), ("fee", "Registration fee"), ("payments", "Payment methods"), ("support", "Support"), ("app", "Mobile app")):
        if f.get(key):
            rows.append(f'<tr data-facts="1">\n<td>{label}</td>\n<td>{esc(cell_text(key, f[key]))}</td>\n</tr>\n')
    if len(rows) > 1:
        k = int(hashlib.md5((slug + "ro").encode()).hexdigest(), 16) % len(rows)
        rows = rows[k:] + rows[:k]
    if f.get("deposit"):
        c = re.sub(r"(<td>Minimum deposit</td>\s*<td>)(.*?)(</td>)", lambda m: m.group(1) + esc(f["deposit"]) + m.group(3), c, count=1, flags=re.S)
        log.append("minimum deposit")
    if f.get("regulator"):
        c = re.sub(r"(<td>Regulator</td>\s*<td>)(.*?)(</td>)", lambda m: m.group(1) + esc(f["regulator"]) + m.group(3), c, count=1, flags=re.S)
        log.append("regulator")
    if rows:
        m = re.search(r"</tbody>\s*</table>\s*</div>\n", c)
        assert m, "at a glance table not found"
        c = c[: m.start()] + "".join(rows) + c[m.start():]
        end = c.index("</div>\n", c.index("</tbody>")) + len("</div>\n")
        where = f" ({esc(host)})" if host else ""
        note = '<p class="bd-text bd-note" data-facts="1">' + pick(slug, "note", [
            f"Details such as fees, payment methods, support and app availability are as stated by {A}{where}. We have not tested them ourselves.",
            f"The fees, payment methods, support and app details above come from {A}{where}, and we have not tested them ourselves.",
            f"These details were provided by {A}{where} and have not been tested by us."]) + "</p>\n"
        c = c[:end] + note + c[end:]
        log.append("at a glance rows")

    # fees section
    m = re.search(r"(<h2 class=\"bd-heading\">[^<]*Fees and Minimum Deposit</h2>\n<p class=\"bd-text\">.*?</p>\n)", c, re.S)
    if m and (f.get("fee") or f.get("payments")):
        add = ""
        if f.get("fee"):
            add += f'<p class="bd-text" data-facts="1">{S("fee", ["According to {A}, registration is free.", "Registration is free, according to {A}.", "{a} states that there is no registration fee.", "There is no charge to register, as stated by {A}.", "Opening an account costs nothing, {A} says.", "{a} says registration does not cost anything."])}</p>\n'
        if f.get("payments"):
            p_ = esc(f["payments"])
            add += f'<p class="bd-text" data-facts="1">{S("pay", ["According to {A}, you can fund the account by " + p_ + ".", "Accepted payment methods, as stated by {A}: " + p_ + ".", "{a} lists " + p_ + " as payment options.", "{a} says deposits can be made with " + p_ + ".", "Funding options listed by {A} include " + p_ + ".", "You can pay in with " + p_ + ", according to {A}."])}</p>\n'
        sec_end = c.index("</section>", m.end())
        ul_end = c.find("</ul>\n", m.end(), sec_end)
        at = ul_end + len("</ul>\n") if ul_end != -1 else m.end()
        c = c[:at] + add + c[at:]
        log.append("fees and payment methods")

    # login, registration and app section: support line and the app paragraph
    base = c.find("Login, Registration and App")
    if base >= 0 and f.get("support"):
        end = c.index("</section>", base)
        sup = esc(f["support"])
        line = S("sup", ["According to {A}, support is available " + sup + ".", "{a} says support is available " + sup + ".", "Support is available " + sup + ", according to {A}.", "{a} states that its support team is available " + sup + ".", "You can reach support " + sup + ", says {A}.", "As stated by {A}, support runs " + sup + "."])
        c = c[:end] + f'<p class="bd-text" data-facts="1">{line}</p>\n' + c[end:]
        log.append("support")
    if base >= 0 and f.get("app"):
        pat = re.compile(r"<p class=\"bd-text\">[^<]*(?:mobile app|app in app stores|a [^<]{0,40} app)[^<]*</p>\n")
        m = pat.search(c, base)
        if m:
            orig = html.escape(c[m.start():m.end()].rstrip("\n"), quote=True)
            ap = lower_first(esc(f["app"])).rstrip(".")
            txt = S("app", ["According to {A}, " + ap + ".", "{a} says " + ap + ".", ap.capitalize() + ", according to {A}.", "As stated by {A}, " + ap + ".", "Per {A}, " + ap + "."])
            c = c[: m.start()] + f'<p class="bd-text" data-facts="1" data-orig="{orig}">{txt} Be careful of fake apps that use the {esc(name)} name in app stores.</p>\n' + c[m.end():]
            log.append("app")

    # withdrawal section
    if f.get("withdrawal"):
        m = re.search(r"(<h2 class=\"bd-heading\">[^<]*Withdrawal Process</h2>\n)", c)
        if m:
            w = lower_first(esc(f["withdrawal"])).rstrip(".")
            line = S("wd", ["According to {A}, " + w + ".", "{a} states that " + w + ".", w.capitalize() + ", according to {A}.", "{a} says " + w + ".", "As stated by {A}, " + w + ".", "Per {A}, " + w + "."])
            c = c[: m.end()] + f'<p class="bd-text" data-facts="1">{line}</p>\n' + c[m.end():]
            log.append("withdrawal")

    # FAQ answers
    def faq(q_start, answer):
        nonlocal c
        pat = re.compile(r"(<h3 class=\"bd-subheading\">" + re.escape(q_start) + r"[^<]*</h3>\n<p class=\"bd-text\">)(.*?)(</p>)", re.S)
        if pat.search(c):
            c = pat.sub(lambda m: m.group(1) + answer + m.group(3), c, count=1)
            return True
        return False

    if f.get("app"):
        ap = lower_first(esc(f["app"])).rstrip(".")
        if faq(f"Does {name} have a mobile app", S("fa", ["According to {A}, " + ap + ".", "{a} says " + ap + ".", ap.capitalize() + ", according to {A}.", "As stated by {A}, " + ap + "."])):
            log.append("faq app")
    if f.get("withdrawal"):
        w = lower_first(esc(f["withdrawal"])).rstrip(".")
        if faq(f"How long does a {name} withdrawal take", S("fw", ["According to {A}, " + w + ".", "{a} states that " + w + ".", w.capitalize() + ", according to {A}.", "As stated by {A}, " + w + ".", "Per {A}, " + w + "."])):
            log.append("faq withdrawal")
    if f.get("deposit") and faq(f"What is the {name} minimum deposit", f"The minimum deposit is {esc(f['deposit'])}."):
        log.append("faq deposit")
    if f.get("fee"):
        dep = esc(f.get("deposit") or "required")
        if faq(f"Is {name} free", S("ff", ["According to {A}, registration is free. The minimum deposit is " + dep + ", and spreads or withdrawal charges can apply.", "{a} states that registration is free. A minimum deposit of " + dep + " is required, and spreads or withdrawal charges can apply."])):
            log.append("faq free")
    if not dry:
        post["content"] = c
    return log


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry = "--dry-run" in sys.argv
    if not args:
        sys.exit(__doc__)
    done = skipped = 0
    for row in csv.DictReader(open(args[0], encoding="utf-8-sig")):
        f = {k: (row.get(v) or "").strip() for k, v in COL.items()}
        slug = (row.get("Review slug") or "").strip()
        facts = [k for k in COL if k not in ("source", "attribution") and f[k]]
        if not slug or not f["source"] or not facts:
            skipped += 1
            continue
        path = f"{POSTS}/{slug}.json"
        post = json.load(open(path))
        if not post.get("journeyLayout"):
            print(f"{slug}: skipped, not a journey-layout page")
            skipped += 1
            continue
        log = apply(post, f, dry)
        if not dry:
            json.dump(post, open(path, "w", encoding="utf-8"), separators=(",", ":"), ensure_ascii=True)
        print(f"{slug}: {', '.join(log) or 'nothing to change'}{' (dry run)' if dry else ''}")
        done += 1
    print(f"{done} platforms updated, {skipped} rows skipped (no source or no facts)")


if __name__ == "__main__":
    main()
