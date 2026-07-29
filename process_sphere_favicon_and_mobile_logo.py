import os
from PIL import Image

ROOT_DIR = "d:/Workspace/Assets/Hausbox"
ASSETS_IMG_DIR = os.path.join(ROOT_DIR, "assets/images")

# The 1792x1792 sphere icon image provided by user
user_fav_path = os.path.join(ROOT_DIR, "favicon.png")

img = Image.open(user_fav_path).convert("RGBA")
print(f"Original user sphere icon image size: {img.size}")

# Find tight bounding box of sphere icon
bbox = img.getbbox()
if bbox:
    cropped = img.crop(bbox)
else:
    cropped = img

w, h = cropped.size
print(f"Cropped sphere icon size: {w}x{h}")

# Add slight 5% padding around sphere icon
max_dim = max(w, h)
padding = int(max_dim * 0.05)
canvas_size = max_dim + (padding * 2)

square = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
paste_x = (canvas_size - w) // 2
paste_y = (canvas_size - h) // 2
square.paste(cropped, (paste_x, paste_y))

# Generate crisp sizes
favicon_512 = square.resize((512, 512), Image.Resampling.LANCZOS)
favicon_180 = square.resize((180, 180), Image.Resampling.LANCZOS)
favicon_128 = square.resize((128, 128), Image.Resampling.LANCZOS)
favicon_64  = square.resize((64, 64), Image.Resampling.LANCZOS)
favicon_32  = square.resize((32, 32), Image.Resampling.LANCZOS)

# Save root favicons
fav_png_path = os.path.join(ROOT_DIR, "favicon.png")
fav_ico_path = os.path.join(ROOT_DIR, "favicon.ico")
apple_path   = os.path.join(ROOT_DIR, "apple-touch-icon.png")

favicon_512.save(fav_png_path, "PNG")
favicon_180.save(apple_path, "PNG")
favicon_32.save(fav_ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

# Save assets/images/ icons for navbar mobile & app icons
favicon_32.save(os.path.join(ASSETS_IMG_DIR, "favicon-32x32.png"), "PNG")
favicon_180.save(os.path.join(ASSETS_IMG_DIR, "apple-touch-icon.png"), "PNG")
favicon_128.save(os.path.join(ASSETS_IMG_DIR, "favicon-mobile.png"), "PNG")

print("[OK] All sphere favicons and mobile logo images successfully created!")
