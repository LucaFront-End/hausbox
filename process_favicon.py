import os
from PIL import Image

ROOT_DIR = "d:/Workspace/Assets/Hausbox"
ASSETS_IMG_DIR = os.path.join(ROOT_DIR, "assets/images")

# Load logo-hausbox-dark.png (contains sphere mark on left)
logo_path = os.path.join(ASSETS_IMG_DIR, "logo-hausbox-dark.png")
img = Image.open(logo_path).convert("RGBA")

# Bounding box of full logo
bbox = img.getbbox() # (min_x, min_y, max_x, max_y)
h = bbox[3] - bbox[1]

# Crop sphere icon mark (square area on the left of height h)
icon_crop = img.crop((bbox[0], bbox[1], bbox[0] + h, bbox[3]))

# Tight crop inside the icon region to ensure no extra whitespace
icon_bbox = icon_crop.getbbox()
if icon_bbox:
    tight_icon = icon_crop.crop(icon_bbox)
else:
    tight_icon = icon_crop

w, h = tight_icon.size
print(f"[OK] Isolated Sphere Icon Mark: {w}x{h} px")

# Add a slight 8% padding around sphere icon
max_dim = max(w, h)
padding = int(max_dim * 0.08)
canvas_size = max_dim + (padding * 2)

square = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
paste_x = (canvas_size - w) // 2
paste_y = (canvas_size - h) // 2
square.paste(tight_icon, (paste_x, paste_y))

# Generate high quality resized versions using Lanczos resampling
favicon_512 = square.resize((512, 512), Image.Resampling.LANCZOS)
favicon_180 = square.resize((180, 180), Image.Resampling.LANCZOS)
favicon_64  = square.resize((64, 64), Image.Resampling.LANCZOS)
favicon_32  = square.resize((32, 32), Image.Resampling.LANCZOS)

fav_png_path = os.path.join(ROOT_DIR, "favicon.png")
fav_ico_path = os.path.join(ROOT_DIR, "favicon.ico")
apple_path   = os.path.join(ROOT_DIR, "apple-touch-icon.png")

favicon_512.save(fav_png_path, "PNG")
favicon_180.save(apple_path, "PNG")
favicon_32.save(fav_ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

favicon_32.save(os.path.join(ASSETS_IMG_DIR, "favicon-32x32.png"), "PNG")
favicon_180.save(os.path.join(ASSETS_IMG_DIR, "apple-touch-icon.png"), "PNG")

print("[OK] Sphere Icon Favicons successfully generated and replaced:")
print(f" - {fav_png_path} ({os.path.getsize(fav_png_path)} bytes)")
print(f" - {fav_ico_path} ({os.path.getsize(fav_ico_path)} bytes)")
print(f" - {apple_path} ({os.path.getsize(apple_path)} bytes)")
