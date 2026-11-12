#!/usr/bin/env python3
"""Reject a frontend artifact that omits the shipped French dictionaries.

Run against a local dist or the finished macOS app, rather than only the source
checkout: an old frontend bundle must not pass merely because fr.json exists.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOCALES = ROOT / "dodaios/ui/web/frontend/src/i18n/locales"


def strings(value: object):
    if isinstance(value, dict):
        for child in value.values():
            yield from strings(child)
    elif isinstance(value, str):
        yield value


def check(dist: Path) -> list[str]:
    if not (dist / "index.html").is_file():
        return [f"No frontend index.html in {dist}"]
    assets = list((dist / "assets").glob("*.js"))
    # Vite may emit UTF-8 literals or JavaScript Unicode escapes.
    bundles = [p.read_text(encoding="utf-8") for p in assets]
    problems = []
    for source in sorted(LOCALES.rglob("fr.json")):
        values = list(strings(json.loads(source.read_text(encoding="utf-8"))))
        # A full sentence identifies each lazy section, not just the shared
        # "Save" label. Quoted literals work with both JS quote styles.
        marker = next((v for v in values if len(v) > 45 and "\n" not in v), None)
        if marker is None:
            problems.append(f"No representative sentence in {source.relative_to(LOCALES)}")
            continue
        variants = (marker, json.dumps(marker, ensure_ascii=True)[1:-1])
        if not any(any(v in bundle for v in variants) for bundle in bundles):
            problems.append(f"Missing French section: {source.relative_to(LOCALES)}")
    if not any("sidebar-shortcut-agents" in bundle for bundle in bundles):
        problems.append("Missing visible Agents navigation")
    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    target = parser.add_mutually_exclusive_group(required=True)
    target.add_argument("--dist", type=Path)
    target.add_argument("--app", type=Path)
    args = parser.parse_args()
    if args.app:
        candidates = [
            args.app / "Contents/Resources/dodaios/ui/web/dist",
            args.app / "Contents/Frameworks/dodaios/ui/web/dist",
        ]
        dist = next((p for p in candidates if (p / "index.html").is_file()), candidates[0])
    else:
        dist = args.dist
    problems = check(dist)
    if args.app:
        catalog = dist.parents[2] / "i18n/locales/fr.json"
        if not catalog.is_file():
            problems.append("Missing French backend phrase catalog in the app bundle")
        else:
            data = json.loads(catalog.read_text(encoding="utf-8"))
            if data.get("notify", {}).get("finished_title") != "{agent} a terminé":
                problems.append("French backend notification catalog is stale")
    for problem in problems:
        print(f"FAIL: {problem}")
    if not problems:
        print("PASS: all French locale sections and visible Agents navigation are in the artifact")
    return int(bool(problems))


if __name__ == "__main__":
    raise SystemExit(main())
