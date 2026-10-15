"""One-off repair: rename uploaded audio whose extension doesn't match its bytes
(e.g. Safari MP4 recordings saved as .webm) and update submissions.json.

Usage (from backend/):  python fix_audio_extensions.py          # dry run
                        python fix_audio_extensions.py --apply  # make changes
"""
import json
import shutil
import sys
import time

from main import SUBMISSIONS_FILE, UPLOAD_DIR, sniff_audio

apply = "--apply" in sys.argv
renames = {}  # old filename -> (new filename, content_type)

for path in sorted(UPLOAD_DIR.iterdir()):
    if path.suffix.lower() not in {".webm", ".ogg", ".mp3", ".wav", ".m4a", ".mp4", ".bin"}:
        continue
    sniffed = sniff_audio(path.read_bytes()[:16])
    if not sniffed or path.suffix == sniffed[1]:
        continue
    renames[path.name] = (path.stem + sniffed[1], sniffed[0])

for old, (new, ctype) in renames.items():
    print(f"{old} -> {new} ({ctype})")
if not renames:
    print("Nothing to fix.")
    sys.exit(0)

text = SUBMISSIONS_FILE.read_text() if SUBMISSIONS_FILE.exists() else "[]"
data = json.loads(text)


def fix(node):
    if isinstance(node, dict):
        saved = node.get("saved_as")
        if saved in renames:
            node["content_type"] = renames[saved][1]
        for k, v in node.items():
            if isinstance(v, str):
                for old, (new, _) in renames.items():
                    v = v.replace(old, new)
                node[k] = v
            else:
                fix(v)
    elif isinstance(node, list):
        for item in node:
            fix(item)


fix(data)

if not apply:
    print("\nDry run — re-run with --apply to rename files and update submissions.json.")
    sys.exit(0)

backup = SUBMISSIONS_FILE.with_suffix(f".json.bak-{int(time.time())}")
if SUBMISSIONS_FILE.exists():
    shutil.copy2(SUBMISSIONS_FILE, backup)
    print(f"Backed up submissions to {backup}")
for old, (new, _) in renames.items():
    (UPLOAD_DIR / old).rename(UPLOAD_DIR / new)
SUBMISSIONS_FILE.write_text(json.dumps(data, indent=2))
print(f"Renamed {len(renames)} file(s) and updated {SUBMISSIONS_FILE}.")
