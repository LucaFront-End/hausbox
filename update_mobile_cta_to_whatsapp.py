import glob
import os
import re

WA_URL = "https://api.whatsapp.com/send/?phone=5215574374431&text=Hola%21+Quiero+informaci%C3%B3n+de+HausBox&type=phone_number&app_absent=0"

html_files = glob.glob("d:/Workspace/Assets/Hausbox/*.html")
updated_count = 0

for filepath in html_files:
    fname = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to match <div class="nav-mobile-cta">\n <a href="..." class="btn-cta-nav group open-calc-btn"...
    old_tag = r'<div class="nav-mobile-cta">\s*<a href="[^"]*" class="btn-cta-nav group open-calc-btn"'
    new_tag = f'<div class="nav-mobile-cta">\n        <a href="{WA_URL}" class="btn-cta-nav group"'

    if re.search(old_tag, content):
        new_content = re.sub(old_tag, new_tag, content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        updated_count += 1
        print(f"[OK] Updated nav-mobile-cta to WhatsApp in {fname}")
    else:
        print(f"[SKIP/NO MATCH] {fname}")

print(f"\nSuccessfully updated {updated_count} HTML files.")
