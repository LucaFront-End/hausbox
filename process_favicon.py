import os
from PIL import Image

ROOT_DIR = "d:/Workspace/Assets/Hausbox"
ASSETS_IMG_DIR = os.path.join(ROOT_DIR, "assets/images")

# Use logo-hausbox-dark.png
logo_path = os.path.join(ASSETS_IMG_DIR, "logo-hausbox-dark.png")
img = Image.open(logo_path).convert("RGBA")

# Crop tight bbox
bbox = img.getbbox()
if bbox:
    cropped = img.crop(bbox)
else:
    cropped = img

w, h = cropped.size
padding = int(max(w, h) * 0.1)
canvas_size = max(w, h) + (padding * 2)

square = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
paste_x = (canvas_size - w) // 2
paste_y = (canvas_size - h) // 2
square.paste(cropped, (paste_x, paste_y))

# Generate sizes
favicon_512 = square.resize((512, 512), Image.Resampling.LANCZOS)
favicon_180 = square.resize((180, 180), Image.Resampling.LANCZOS)
favicon_32  = square.resize((32, 32), Image.Resampling.LANCZOS)

fav_png_path = os.path.join(ROOT_DIR, "favicon.png")
fav_ico_path = os.path.join(ROOT_DIR, "favicon.ico")
apple_path   = os.path.join(ROOT_DIR, "apple-touch-icon.png")

favicon_512.save(fav_png_path, "PNG")
favicon_180.save(apple_path, "PNG")
favicon_32.save(fav_ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

favicon_32.save(os.path.join(ASSETS_IMG_DIR, "favicon-32x32.png"), "PNG")
favicon_180.save(os.path.join(ASSETS_IMG_DIR, "apple-touch-icon.png"), "PNG")

print("[OK] All favicon files successfully created.")
