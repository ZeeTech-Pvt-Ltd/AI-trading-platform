#!/usr/bin/env python3
"""Generate the "AI Trading Platform" favicon set.

Gold "AI" serif monogram (Georgia Bold, matching the Lora serif brand)
on a dark warm-stone rounded square. Outputs ICO + PNG sizes + apple touch icon.
"""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "public")

FONT = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"

# Palette (gold #d4a017 family + warm dark stone).
BG_TOP = (38, 34, 28)      # #26221c
BG_BOTTOM = (18, 16, 13)   # #12100d
GOLD_TOP = (242, 193, 78)  # #f2c14e
GOLD_BOTTOM = (201, 147, 14)  # #c9930e

SIZE = 512
RADIUS = 96  # ~18.75% rounded corners


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def vertical_gradient(size, top, bottom):
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        t = y / (size - 1)
        c = lerp(top, bottom, t)
        for x in range(size):
            px[x, y] = c
    return img


def text_mask(text, font, size, top, bottom):
    """Render `text` as a mask with a vertical gradient."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Determine font size so text width ~= 52% of canvas.
    probe = ImageFont.truetype(FONT, 100)
    w100 = draw.textbbox((0, 0), text, font=probe)[2]
    target = 0.52 * size
    fs = int(100 * target / w100)
    font = ImageFont.truetype(FONT, fs)
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (size - tw) / 2 - bbox[0]
    y = (size - th) / 2 - bbox[1]
    draw.text((x, y), text, font=font, fill=(255, 255, 255, 255))
    # Apply gradient via the alpha channel.
    grad = vertical_gradient(size, top, bottom).convert("RGBA")
    mask = img.getchannel("A")
    grad.putalpha(mask)
    return grad


def build(size):
    canvas = vertical_gradient(size, BG_TOP, BG_BOTTOM).convert("RGBA")
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, size - 1, size - 1], radius=int(size * RADIUS / SIZE), fill=255
    )
    # Round the corners of the background.
    canvas.putalpha(mask)

    letters = text_mask("AI", None, size, GOLD_TOP, GOLD_BOTTOM)
    return Image.alpha_composite(canvas, letters)


def main():
    os.makedirs(OUT, exist_ok=True)
    master = build(SIZE)

    master.save(os.path.join(OUT, "icon-512.png"))
    master.resize((192, 192), Image.LANCZOS).save(os.path.join(OUT, "icon-192.png"))
    master.resize((180, 180), Image.LANCZOS).save(os.path.join(OUT, "apple-touch-icon.png"))
    master.resize((32, 32), Image.LANCZOS).save(os.path.join(OUT, "favicon-32x32.png"))

    # Multi-size ICO (16/32/48).
    img48 = master.resize((48, 48), Image.LANCZOS)
    img48.save(
        os.path.join(OUT, "favicon.ico"),
        sizes=[(16, 16), (32, 32), (48, 48)],
    )
    print("favicon set written to", os.path.abspath(OUT))


if __name__ == "__main__":
    main()
