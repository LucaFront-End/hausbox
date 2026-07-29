import glob
import os
import re

html_files = glob.glob("d:/Workspace/Assets/Hausbox/*.html")
updated_count = 0

mobile_logo_img = '<img src="assets/images/favicon-mobile.png" alt="HausBox" class="logo-mobile" />'

for filepath in html_files:
    fname = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'class="logo-mobile"' in content:
        print(f"[SKIP] {fname} already has logo-mobile")
        continue

    # Find <a class="nav-logo" ...> ... </a>
    pattern = r'(<a\s+class="nav-logo"[^>]*>.*?)(</a>)'
    
    def replacer(match):
        inner_a = match.group(1)
        close_a = match.group(2)
        return inner_a + '\n        ' + mobile_logo_img + '\n      ' + close_a

    new_content = re.sub(pattern, replacer, content, flags=re.DOTALL)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        updated_count += 1
        print(f"[OK] Added logo-mobile to {fname}")
    else:
        print(f"[WARN] Nav logo not matched in {fname}")

print(f"\nUpdated {updated_count} HTML files with mobile sphere logo.")
