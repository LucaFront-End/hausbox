import glob
import os
import re

SCRIPT_TAG = '<script src="js/promo-popup.js"></script>'

html_files = glob.glob("d:/Workspace/Assets/Hausbox/*.html")
updated = 0

for filepath in html_files:
    fname = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if SCRIPT_TAG in content:
        print(f"[SKIP/ALREADY EXISTS] {fname}")
        continue

    # Insert before </body>
    if '</body>' in content:
        content = content.replace('</body>', f'  {SCRIPT_TAG}\n</body>')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        updated += 1
        print(f"[OK] Added promo-popup.js to {fname}")
    else:
        print(f"[WARN: NO </body>] {fname}")

print(f"Added promo-popup.js script tag to {updated} HTML files.")
