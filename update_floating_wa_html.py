import glob
import os
import re

WA_URL = "https://api.whatsapp.com/send/?phone=5215574374431&text=SW-+Hola+Quisiera+m%C3%A1s+informaci%C3%B3n+de+su+Software+para+administraci%C3%B3n+de+condominios+de+Hausbox&type=phone_number&app_absent=0"

WA_SVG_AND_SPAN = '''<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 20.2a1 1 0 001.254 1.254l3.032-.892A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"></path>
      </svg>
      <span class="floating-btn-text">Solicitar Demo</span>'''

html_files = glob.glob("d:/Workspace/Assets/Hausbox/*.html")
updated = 0

for filepath in html_files:
    fname = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to find floating-whatsapp anchor
    pattern = r'(<a\s+href=")[^"]*("\s+class="floating-whatsapp"[^>]*>)\s*<svg[\s\S]*?</svg>(\s*<span class="floating-btn-text">[^<]*</span>)?'
    
    if re.search(pattern, content):
        new_content = re.sub(pattern, f'\\1{WA_URL}\\2\n      {WA_SVG_AND_SPAN}', content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        updated += 1
        print(f"[OK] Updated floating-whatsapp in {fname}")
    else:
        print(f"[SKIP/NO MATCH] {fname}")

print(f"Updated floating whatsapp button in {updated} HTML files.")
