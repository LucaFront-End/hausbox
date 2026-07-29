import glob
import os

FAVICON_TAGS = """  <link rel="icon" type="image/png" href="favicon.png" />
  <link rel="shortcut icon" href="favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png" />"""

html_files = glob.glob("d:/Workspace/Assets/Hausbox/*.html")
updated_count = 0

for filepath in html_files:
    fname = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'rel="icon"' in content or 'rel="shortcut icon"' in content:
        print(f"[SKIP] {fname} already has favicon link")
        continue

    if '<head>' in content:
        new_content = content.replace('<head>', f'<head>\n{FAVICON_TAGS}', 1)
    elif '<head ' in content:
        import re
        new_content = re.sub(r'(<head[^>]*>)', r'\1\n' + FAVICON_TAGS, content, count=1, flags=re.IGNORECASE)
    else:
        print(f"[WARN] No head tag in {fname}")
        continue

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    updated_count += 1
    print(f"[OK] Added favicon tags to {fname}")

print(f"\nUpdated {updated_count} HTML files.")
