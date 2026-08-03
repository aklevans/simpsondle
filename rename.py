import os
import re
from pathlib import Path

# Folder containing the files
FOLDER = Path(r"D:\simpson")

# Regex to find S01E01, S01e01, etc.
pattern = re.compile(r"(S\d{2})[Ee](\d{2})", re.IGNORECASE)

for file in FOLDER.iterdir():
    if not file.is_file():
        continue

    match = pattern.search(file.stem)
    if not match:
        print(f"Skipping: {file.name}")
        continue

    season = match.group(1).upper()
    episode = match.group(2)

    new_name = f"{season}E{episode}{file.suffix.lower()}"
    new_path = file.with_name(new_name)

    if new_path.exists():
        print(f"Skipping (already exists): {new_name}")
        continue

    print(f"{file.name} -> {new_name}")
    file.rename(new_path)

print("Done!")