#!/usr/bin/env python3
"""Generate a branded 1200x630 default Open Graph image (gold + stone palette)."""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
INK = (28, 25, 23)          # --ink
BRAND = (212, 160, 23)      # --brand gold
BRAND_SOFT = (252, 244, 220)  # --brand-soft
MUTED = (214, 211, 209)     # --line-strong (for subtle text on dark)

GEORGIA = "/System/Library/Fonts/Supplemental/Georgia.ttf"
GEORGIA_B = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"
ARIAL_B = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

img = Image.new("RGB", (W, H), INK)
d = ImageDraw.Draw(img)

# subtle vertical gold accent bar
d.rectangle([0, 0, 14, H], fill=BRAND)

# brand check badge
badge_r = 46
badge_cx, badge_cy = 118, 150
d.ellipse(
    [badge_cx - badge_r, badge_cy - badge_r, badge_cx + badge_r, badge_cy + badge_r],
    fill=BRAND,
)
check = ImageFont.truetype(GEORGIA_B, 64)
d.text((badge_cx - 22, badge_cy - 44), "✓", font=check, fill=INK)

# wordmark
name_font = ImageFont.truetype(GEORGIA_B, 96)
d.text((200, 105), "AI Trading Platform", font=name_font, fill=(250, 250, 249))

# gold rule
d.rectangle([200, 285, 460, 291], fill=BRAND)

# tagline
tag_font = ImageFont.truetype(GEORGIA, 42)
d.text(
    (200, 320),
    "Independent, fact-checked reviews of",
    font=tag_font,
    fill=MUTED,
)
d.text(
    (200, 385),
    "AI & crypto trading platforms",
    font=tag_font,
    fill=MUTED,
)

# bottom badge
pill_font = ImageFont.truetype(ARIAL_B, 30)
d.text((200, 495), "REVIEWS  ·  COMPARISONS  ·  GUIDES", font=pill_font, fill=BRAND)

out = "public/images/2026/07/og-default.png"
img.save(out, "PNG", optimize=True)
print("wrote", out)
