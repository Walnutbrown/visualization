#!/usr/bin/env python3
"""Snapshot vis.hwpark.net techniques and principles into local reference files.

Maintenance only: lessons are built from the snapshot, never from the live site.
"""

import argparse
import html
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

SITE = "https://vis.hwpark.net"
OUT = Path(__file__).resolve().parent.parent / "references" / "vis"

OMIT_SECTIONS = {"프롬프트 예시", "더 읽어보기"}
MAIN_SECTIONS = {"언제 사용하나", "이럴 땐 피하세요"}  # the rest of a technique goes to <slug>.detail.md
LINK_SECTIONS = {"함께 쓰면 좋은 기법", "관련 기법", "관련 카탈로그"}


def text(fragment):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", fragment))).strip()


def fetch(url):
    with urllib.request.urlopen(url, timeout=30) as response:
        return response.read().decode("utf-8")


def ko_items(body):
    """Korean text of every <li> (else every <p>): <li class="lang-ko"> or <li><span class="lang-ko">."""
    def pick(tag):
        out = []
        for attrs, inner in re.findall(rf"<{tag}\b([^>]*)>(.*?)</{tag}>", body, re.S):
            m = None if "lang-ko" in attrs else re.search(r'<span class="lang-ko">(.*?)</span>', inner, re.S)
            if "lang-ko" in attrs or m:
                out.append(inner if "lang-ko" in attrs else m.group(1))
        return out
    return pick("li") or pick("p")


def parse(slug, page):
    def ko(fragment):
        m = re.search(r'<span class="lang-ko">(.*?)</span>', fragment, re.S)
        return text(m.group(1)) if m else text(fragment)

    top = page[page.find("<h1"):page.find("<h2")]

    def chips(cls):
        return [text(x) for x in re.findall(r'class="[^"]*' + cls + r'[^"]*"><span class="lang-ko">(.*?)</span>', top, re.S)]

    kind = re.search(r'<span class="lang-ko">(차트|인터랙션)</span>', top)
    summary = re.search(r'<meta name="description" content="(.*?)"', page)
    entry = {
        "slug": slug, "title": ko(re.search(r"<h1[^>]*>(.*?)</h1>", page, re.S).group(1)),
        "kind": kind.group(1) if kind else "", "tags": chips("bg-secondary"), "data": chips("bg-blue-50"),
        "shapes": chips("bg-purple-50"), "summary": html.unescape(summary.group(1)) if summary else "",
        "sections": {}, "code": [], "avoid_bold": [],
    }
    for part in re.split(r"<h2[^>]*>", page)[1:]:
        head, _, body = part.partition("</h2>")
        name, body = ko(head), body.split("<footer")[0]
        if name in OMIT_SECTIONS:
            continue
        if name in LINK_SECTIONS:
            entry["sections"][name] = re.findall(r'href="/(?:catalog|principles)/([a-z0-9-]+)/"', body)
            continue
        if name == "코드 레퍼런스":
            for lang, code in re.findall(r'<pre[^>]*data-language="([^"]*)"[^>]*><code>(.*?)</code></pre>', body, re.S):
                entry["code"].append((lang, html.unescape(re.sub(r"<[^>]+>", "", code))))
            continue
        items = ko_items(body)
        if name == "이럴 땐 피하세요":
            entry["avoid_bold"] = [text(b) for x in items for b in re.findall(r"<strong>(.*?)</strong>", x, re.S)]
        entry["sections"][name] = [text(x) for x in items]
    return entry


def alternatives(entry, by_title):
    """Bold names in 이럴 땐 피하세요: catalog slug if the title matches, else the bare name."""
    return list(dict.fromkeys(f"`{by_title[n]}`" if n in by_title else n for n in entry["avoid_bold"]))


def render(entry, section, by_title=None):
    """Principles: whole file. Techniques: conditions only (when/avoid/alternatives/links)."""
    lines = [f"# {entry['title']} (`{entry['slug']}`)", ""]
    if section == "catalog":
        lines += [f"{entry['kind']} · 과제: {', '.join(entry['tags'])} · 데이터: {', '.join(entry['data']) or '-'}"
                  f" · 형태: {', '.join(entry['shapes']) or '-'}", ""]
    lines += [entry["summary"], "", f"출처: {SITE}/{section}/{entry['slug']}/", ""]
    for name, items in entry["sections"].items():
        if not items or (section == "catalog" and name not in MAIN_SECTIONS | LINK_SECTIONS):
            continue
        if name in LINK_SECTIONS:
            lines += [f"**{name}:** " + ", ".join(f"`{x}`" for x in dict.fromkeys(items)), ""]
            continue
        lines += [f"## {name}", ""]
        lines += [f"- {x}" for x in items] if name != "설명" else [x + "\n" for x in items]
        lines.append("")
        if name == "이럴 땐 피하세요" and (alt := alternatives(entry, by_title or {})):
            lines += ["**대안:** " + ", ".join(alt), ""]
    return "\n".join(lines).rstrip() + "\n"


def render_detail(entry):
    lines = [f"# {entry['title']} 상세 (`{entry['slug']}`)", ""]
    for name, items in entry["sections"].items():
        if items and name not in MAIN_SECTIONS | LINK_SECTIONS:
            lines += [f"## {name}", ""] + ([x + "\n" for x in items] if name == "설명" else [f"- {x}" for x in items]) + [""]
    lines += ["## 코드 레퍼런스", ""]
    for lang, code in entry["code"]:
        lines += [f"```{lang}", code.rstrip("\n"), "```", ""]
    return "\n".join(lines).rstrip() + "\n"


def index(entries):
    rows = ["# 기법 색인 (vis.hwpark.net 스냅샷)", "",
            "기법을 고른 뒤 `techniques/<slug>.md`에서 언제 쓰나·피할 때·대안을, `techniques/<slug>.detail.md`에서 설명·구조·변형·코드를 읽는다. 생성 파일이므로 직접 고치지 말고 `scripts/sync_vis_rules.py`로 갱신한다.", ""]
    for kind in ["차트", "인터랙션"]:
        rows += [f"## {kind}", "", "| slug | 이름 | 과제 | 데이터 | 형태 | 한 줄 설명 |", "|---|---|---|---|---|---|"]
        rows += [f"| `{e['slug']}` | {e['title']} | {', '.join(e['tags'])} | {', '.join(e['data']) or '-'} | {', '.join(e['shapes']) or '-'} | {e['summary']} |"
                 for e in sorted(entries, key=lambda e: e["title"]) if e["kind"] == kind]
        rows.append("")
    return "\n".join(rows)


def collect(section, source):
    if source:
        pages = {p.stem: p.read_text(encoding="utf-8") for p in sorted((source / section).glob("*.html"))}
    else:
        slugs = sorted(set(re.findall(rf'href="/{section}/([a-z0-9-]+)/"', fetch(f"{SITE}/{section}/"))))
        with ThreadPoolExecutor(8) as pool:
            pages = dict(zip(slugs, pool.map(lambda s: fetch(f"{SITE}/{section}/{s}/"), slugs)))
    if not pages:
        raise SystemExit(f"{section}: 페이지를 찾지 못했습니다.")
    return [parse(slug, page) for slug, page in pages.items()]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--from-dir", type=Path, help="Saved pages as <dir>/catalog/<slug>.html and <dir>/principles/<slug>.html")
    args = parser.parse_args()
    techniques, principles = collect("catalog", args.from_dir), collect("principles", args.from_dir)
    by_title = {e["title"]: e["slug"] for e in techniques}
    for folder, entries, section in [("techniques", techniques, "catalog"), ("principles", principles, "principles")]:
        target = OUT / folder
        target.mkdir(parents=True, exist_ok=True)
        for old in target.glob("*.md"):
            old.unlink()
        for entry in entries:
            (target / f"{entry['slug']}.md").write_text(render(entry, section, by_title), encoding="utf-8")
            if section == "catalog":
                (target / f"{entry['slug']}.detail.md").write_text(render_detail(entry), encoding="utf-8")
    (OUT / "catalog.md").write_text(index(techniques), encoding="utf-8")
    print(f"techniques {len(techniques)}, principles {len(principles)} -> {OUT}")


if __name__ == "__main__":
    main()
