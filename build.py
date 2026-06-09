#!/usr/bin/env python3
"""
Build content_data.js from content.txt for all pages.

Usage: python3 build.py [page_slug]

  python3 build.py              → build all pages
  python3 build.py introduction → build only web-text/introduction/

Each content.txt is clean HTML without repetitive inline styles.
This script injects the standard styling so the site looks consistent:

  <p>  → <p style="line-height: 2em; text-align: justify; font-size: 16px;">

Elements that already have an inline style attribute are left untouched.
<span> tags are never auto-styled — they pick up font-size from their parent <p>.
"""

import re
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_TEXT = os.path.join(SCRIPT_DIR, "web-text")

PAGES = [
    "conference-overview",
    "conference-topics",
    "organisers",
    "invited-speakers",
    "participants",
    "conference-schedule",
    "download-materials",
    "sponsors",
    "accommodation",
    "previous-conferences",
    "contact",
]


def inject_styles(html: str) -> str:
    """Inject the site's standard inline styles into naked <p> tags."""
    # <p> without style attribute gets default styles
    def add_p_style(m):
        attrs = m.group(1) or ""
        if "style=" in attrs:
            return m.group(0)
        return '<p style="line-height: 2em; text-align: justify; font-size: 16px;"' + attrs + ">"

    html = re.sub(r'<p(\s[^>]*)?>', add_p_style, html)

    # <span> is never auto-styled — child elements inherit from parent <p>
    return html


def build_one(slug: str) -> bool:
    txt_path = os.path.join(WEB_TEXT, slug, "content.txt")
    js_path = os.path.join(WEB_TEXT, slug, "content_data.js")

    if not os.path.exists(txt_path):
        print(f"  SKIP {slug}: content.txt not found")
        return False

    with open(txt_path, "r", encoding="utf-8") as f:
        raw = f.read().strip()

    styled = inject_styles(raw)

    # Escape for a single-quoted JS string literal
    escaped = styled.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n")
    js = f"var CONTENT_DATA = '{escaped}';\n"

    with open(js_path, "w", encoding="utf-8") as f:
        f.write(js)

    print(f"  OK  {slug}: {len(raw)} chars -> {len(js)} bytes")
    return True


def main():
    slugs = [a for a in sys.argv[1:] if a in PAGES] or PAGES
    ok = 0
    for slug in slugs:
        if build_one(slug):
            ok += 1
    print(f"\nDone: {ok}/{len(slugs)} pages updated. Refresh your browser to see changes.")


if __name__ == "__main__":
    main()
