import glob
import os

GTAG_SNIPPET = """  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-VZDTQ5F69F"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-VZDTQ5F69F');
  </script>"""

html_files = glob.glob("d:/Workspace/Assets/Hausbox/*.html")
updated_files = []

for filepath in html_files:
    fname = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already added
    if 'G-VZDTQ5F69F' in content:
        print(f"[SKIP] {fname} already contains G-VZDTQ5F69F")
        continue

    # Insert after <head> or <head ...>
    if '<head>' in content:
        new_content = content.replace('<head>', f'<head>\n{GTAG_SNIPPET}', 1)
    elif '<head ' in content:
        parts = content.split('>', 1) # Split after first tag opening or search via regex
        import re
        new_content = re.sub(r'(<head[^>]*>)', r'\1\n' + GTAG_SNIPPET, content, count=1, flags=re.IGNORECASE)
    else:
        print(f"[WARN] {fname} has no <head> tag")
        continue

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    updated_files.append(fname)
    print(f"[OK] Added G-VZDTQ5F69F to {fname}")

print(f"\nSuccessfully updated {len(updated_files)} HTML files.")
