import os
from PIL import Image

path = "d:/Workspace/Assets/Hausbox/favicon.png"
if os.path.exists(path):
    img = Image.open(path).convert("RGBA")
    print(f"[OK] File exists: {path}")
    print(f"Size: {img.size}, Mode: {img.mode}")
    bbox = img.getbbox()
    print(f"Bounding Box: {bbox}")
else:
    print(f"[FAIL] File not found: {path}")
