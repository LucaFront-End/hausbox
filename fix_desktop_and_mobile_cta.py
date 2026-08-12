import glob
import os
import re

DEMO_CHAT_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" style="width:16px;height:16px"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'
WA_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" style="width:16px;height:16px"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 20.2a1 1 0 001.254 1.254l3.032-.892A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"></path></svg>'

WA_URL = "https://api.whatsapp.com/send/?phone=5215574374431&text=Hola%21+Quiero+informaci%C3%B3n+de+HausBox&type=phone_number&app_absent=0"

html_files = glob.glob("d:/Workspace/Assets/Hausbox/*.html")
updated = 0

for filepath in html_files:
    fname = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Match nav-pills section vs nav-mobile-cta section
    # 1. In nav-pills: Desktop button should be href="#" open-calc-btn with DEMO_CHAT_SVG
    # Find <div class="nav-pills"> ... <a href="..." class="btn-cta-nav group open-calc-btn"
    # Replace SVG inside nav-pills btn-cta-nav if it has WA_SVG
    pills_match = re.search(r'(<div class="nav-pills">[\s\S]*?<a href="#" class="btn-cta-nav group open-calc-btn"[^>]*>)\s*<svg[\s\S]*?</svg>', content)
    if pills_match:
        old_part = pills_match.group(0)
        new_part = f'{pills_match.group(1)}\n          {DEMO_CHAT_SVG}'
        content = content.replace(old_part, new_part)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    updated += 1
    print(f"[OK] Processed desktop icon in {fname}")

print("Done updating desktop icons.")
