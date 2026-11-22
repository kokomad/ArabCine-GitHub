# يولّد أيقونة التطبيق وشاشة البداية (تُشغَّل تلقائياً داخل GitHub Actions)
import os
from PIL import Image, ImageDraw

S = 1024
BG = (26, 26, 46, 255)       # #1A1A2E
GOLD = (255, 215, 0, 255)    # #FFD700
RED = (233, 69, 96, 255)     # #E94560
WHITE = (255, 255, 255, 255)


def draw_logo(size, scale=1.0):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    u = size / 108.0 * scale
    off = size * (1 - scale) / 2

    def p(x, y):
        return (off + x * u, off + y * u)

    d.rounded_rectangle([p(23, 25), p(85, 83)], radius=6 * u, fill=GOLD)
    d.line([p(35, 35), p(73, 35)], fill=WHITE, width=max(2, int(2 * u)))
    d.line([p(35, 73), p(73, 73)], fill=WHITE, width=max(2, int(2 * u)))
    d.polygon([p(45, 40), p(65, 54), p(45, 68)], fill=RED)
    return img


os.makedirs("assets", exist_ok=True)
full = Image.new("RGBA", (S, S), BG)
full.alpha_composite(draw_logo(S, 0.9))
full.convert("RGB").save("assets/icon-only.png")
draw_logo(S, 0.62).save("assets/icon-foreground.png")
Image.new("RGB", (S, S), BG[:3]).save("assets/icon-background.png")
for name in ("splash.png", "splash-dark.png"):
    sp = Image.new("RGBA", (2732, 2732), BG)
    sp.alpha_composite(draw_logo(900, 1.0), ((2732 - 900) // 2, (2732 - 900) // 2))
    sp.convert("RGB").save("assets/" + name)
print("assets generated")
