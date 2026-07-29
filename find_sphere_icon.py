import os
from PIL import Image

logo_path = "d:/Workspace/Assets/Hausbox/assets/images/logo-hausbox-dark.png"
img = Image.open(logo_path).convert("RGBA")

w, h = img.size
print(f"Original logo size: {w}x{h}")

# The logo has the sphere icon on the left. Let's crop the icon part on the left side.
# Let's inspect where the non-transparent pixels on the left are located.
bbox = img.getbbox()
print(f"Full logo bbox: {bbox}")

# Usually the icon is height h by height h on the left (a square region)
# Let's crop from 0 to h (or h * 1.2) in width
icon_crop = img.crop((bbox[0], bbox[1], bbox[0] + (bbox[3] - bbox[1]), bbox[3]))
icon_w, icon_h = icon_crop.size
print(f"Sphere icon crop size: {icon_w}x{icon_h}")

icon_crop.save("d:/Workspace/Assets/Hausbox/sphere_icon_crop.png", "PNG")
print("[OK] Saved sphere_icon_crop.png for inspection.")
