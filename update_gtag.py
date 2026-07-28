import glob
import os

OLD_ID = "G-VZDTQ5F69F"
NEW_ID = "G-1BHNC05RM6"

html_files = glob.glob("d:/Workspace/Assets/Hausbox/*.html")
updated_count = 0

for filepath in html_files:
    fname = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if OLD_ID in content:
        new_content = content.replace(OLD_ID, NEW_ID)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        updated_count += 1
        print(f"[OK] Replaced {OLD_ID} -> {NEW_ID} in {fname}")
    elif NEW_ID in content:
        print(f"[SKIP] {fname} already has {NEW_ID}")
    else:
        print(f"[WARN] {fname} did not contain {OLD_ID}")

print(f"\nUpdated {updated_count} files.")
