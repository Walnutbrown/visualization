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

# How each technique is drawn in this skill. Unlisted techniques: hand-written SVG following the technique file.
SUPPORT = {
    "bar-chart": "`chart` bar", "line-graph": "`chart` line (커서 탐침)", "scatterplot": "`chart` scatter",
    "waterfall-chart": "`waterfall`", "histogram": "`histogram`", "venn-diagram": "`venn`",
    "heatmap": "`heatmap`", "correlation-matrix": "`heatmap` (발산형)", "adjacency-matrix": "`heatmap`",
    "dendrogram": "`diagram` 계층", "network-diagram": "`diagram` (정방향만)",
    "small-multiples": "직접 SVG (두 패널 비교는 스몰 멀티플이 아니라 `compare`)",
    "stepper": "`steps`", "playback-scrub": "`steps`의 `data-scrub` (커서·드래그로 단계 사이를 잇는다)",
    "coordinated-highlighting": "`focus`", "click-to-select": "`focus`", "hover-highlight": "`focus`",
    "parametric-manipulation": "`model` (선형·지수)", "direct-manipulation": "`model` 슬라이더",
    "expand-collapse": "`<details>`", "tooltip": "SVG `<title>` + 직접 라벨",
    "annotation-layer": "정적 주석 (SVG text)", "toggle-view": "`focus` 또는 `<details>`",
}
DASHBOARD = {"bookmark-share", "brush-and-link", "cross-filter", "dynamic-query", "faceted-filter",
             "lasso-select", "linked-views", "semantic-zoom", "text-search-filter", "zoom-and-pan"}
OMIT_SECTIONS = {"코드 레퍼런스", "프롬프트 예시", "더 읽어보기"}
LINK_SECTIONS = {"함께 쓰면 좋은 기법", "관련 기법", "관련 카탈로그"}


def text(fragment):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", fragment))).strip()


def fetch(url):
    with urllib.request.urlopen(url, timeout=30) as response:
        return response.read().decode("utf-8")


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
        "summary": html.unescape(summary.group(1)) if summary else "", "sections": {},
    }
    for part in re.split(r"<h2[^>]*>", page)[1:]:
        head, _, body = part.partition("</h2>")
        name, body = ko(head), body.split("<footer")[0]
        if name in OMIT_SECTIONS:
            continue
        if name in LINK_SECTIONS:
            entry["sections"][name] = re.findall(r'href="/(?:catalog|principles)/([a-z0-9-]+)/"', body)
            continue
        items = [text(x) for x in re.findall(r'<li class="lang-ko"[^>]*>(.*?)</li>', body, re.S)]
        entry["sections"][name] = items or [text(x) for x in re.findall(r'<p class="lang-ko"[^>]*>(.*?)</p>', body, re.S)]
    return entry


def support(slug):
    return SUPPORT.get(slug) or ("대시보드용 · 학습 페이지에서는 보통 불필요" if slug in DASHBOARD else "직접 SVG")


def render(entry, section):
    lines = [f"# {entry['title']} (`{entry['slug']}`)", ""]
    if section == "catalog":
        lines += [f"{entry['kind']} · 과제: {', '.join(entry['tags'])} · 데이터: {', '.join(entry['data']) or '-'}",
                  f"이 스킬에서 그리는 방법: {support(entry['slug'])}", ""]
    lines += [entry["summary"], "", f"출처: {SITE}/{section}/{entry['slug']}/", ""]
    for name, items in entry["sections"].items():
        if not items:
            continue
        if name in LINK_SECTIONS:
            lines += [f"**{name}:** " + ", ".join(f"`{x}`" for x in dict.fromkeys(items)), ""]
            continue
        lines += [f"## {name}", ""]
        lines += [f"- {x}" for x in items] if name != "설명" else [x + "\n" for x in items]
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def index(entries):
    rows = ["# 기법 색인 (vis.hwpark.net 스냅샷)", "",
            "기법을 고른 뒤 `techniques/<slug>.md`에서 언제 쓰나·피할 때·구조를 읽는다. 생성 파일이므로 직접 고치지 말고 `scripts/sync_vis_rules.py`로 갱신한다.", ""]
    for kind in ["차트", "인터랙션"]:
        rows += [f"## {kind}", "", "| slug | 이름 | 과제 | 한 줄 설명 | 스킬 |", "|---|---|---|---|---|"]
        rows += [f"| `{e['slug']}` | {e['title']} | {', '.join(e['tags'])} | {e['summary']} | {support(e['slug'])} |"
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
    for folder, entries, section in [("techniques", techniques, "catalog"), ("principles", principles, "principles")]:
        target = OUT / folder
        target.mkdir(parents=True, exist_ok=True)
        for old in target.glob("*.md"):
            old.unlink()
        for entry in entries:
            (target / f"{entry['slug']}.md").write_text(render(entry, section), encoding="utf-8")
    (OUT / "catalog.md").write_text(index(techniques), encoding="utf-8")
    print(f"techniques {len(techniques)}, principles {len(principles)} -> {OUT}")


if __name__ == "__main__":
    main()
