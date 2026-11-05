#!/usr/bin/env python3
"""Combine an authored visual fragment with the shared offline document design."""

import argparse
import base64
import importlib.util
import io
import re
import sys
from html import escape, unescape
from html.parser import HTMLParser
from pathlib import Path
from string import Template
from tempfile import NamedTemporaryFile

from math_render import render_math


COMPONENTS = {
    "compare": [],
    "chart": ["core", "chart"],
    "diagram": ["core", "diagram"],
    "steps": ["core", "steps"],
    "focus": ["core", "focus"],
    "model": ["core", "chart", "model"],
    "waterfall": ["core", "waterfall"],
    "histogram": ["core", "histogram"],
    "heatmap": ["core", "heatmap"],
    "venn": ["core", "venn"],
}


class Components(HTMLParser):
    def __init__(self):
        super().__init__()
        self.names = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name == "data-illustrate":
                for component in (value or "").split():
                    if component not in COMPONENTS:
                        raise ValueError(f"Unknown illustrate component: {component}")
                    if component not in self.names:
                        self.names.append(component)

    handle_startendtag = handle_starttag


WEIGHTS = ((400, "Regular"), (500, "Medium"), (700, "Bold"))
CSS_GLYPHS = "●↗↘×+−0123456789"  # drawn by CSS `content`, so no element text carries them
LENS = ('<svg width="0" height="0" aria-hidden="true" style="position:absolute"><filter id="lens" x="0" y="0" width="100%" height="100%" '
        'color-interpolation-filters="sRGB"><feImage href="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' '
        'preserveAspectRatio=\'none\'%3E%3ClinearGradient id=\'x\'%3E%3Cstop offset=\'0\' stop-color=\'%23000\'/%3E%3Cstop offset=\'.14\' stop-color=\'%23808080\'/%3E'
        '%3Cstop offset=\'.86\' stop-color=\'%23808080\'/%3E%3Cstop offset=\'1\' stop-color=\'%23fff\'/%3E%3C/linearGradient%3E'
        '%3Crect width=\'100\' height=\'100\' fill=\'url(%23x)\'/%3E%3C/svg%3E" result="map" preserveAspectRatio="none"/>'
        '<feDisplacementMap in="SourceGraphic" in2="map" scale="9" xChannelSelector="R" yChannelSelector="R"/></filter></svg>')


def can_subset() -> bool:
    return all(importlib.util.find_spec(name) for name in ("fontTools", "brotli"))


def subset_font(data: bytes, text: str) -> bytes:
    """Keep only the glyphs of `text`; the page is rebuilt on every assembly, so new letters are picked up."""
    from fontTools import subset, ttLib
    options = subset.Options(flavor="woff2", hinting=False)
    font = ttLib.TTFont(io.BytesIO(data))
    subsetter = subset.Subsetter(options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    out = io.BytesIO()
    font.flavor = "woff2"
    font.save(out)
    return out.getvalue()


def font_styles(assets: Path, text: str, full=()) -> str:
    """Embed Spoqa Han Sans Neo (400, 500, 700) cut down to the letters of `text`; weights in `full` stay whole."""
    vendor = assets / "vendor" / "spoqa"
    text = "".join(sorted({*text, *CSS_GLYPHS, *map(chr, range(32, 127))}))
    faces = []
    subsetting = can_subset()
    if not subsetting:
        print("경고: fonttools와 brotli가 없어 글꼴을 전체 내장합니다(파일이 커집니다). 서브셋을 쓰려면 python3 -m pip install fonttools brotli", file=sys.stderr)
    for weight, name in WEIGHTS:
        font_file = vendor / f"SpoqaHanSansNeo-{name}.woff2"
        if not font_file.exists():
            continue
        data = font_file.read_bytes()
        if subsetting and weight not in full:
            data = subset_font(data, text)
        faces.append(f'@font-face{{font-family:"Spoqa Han Sans Neo";font-weight:{weight};font-display:swap;'
                     f'src:url(data:font/woff2;base64,{base64.b64encode(data).decode("ascii")}) format("woff2");}}')
    return "/* Spoqa Han Sans Neo (SIL Open Font License 1.1), github.com/spoqa/spoqa-han-sans */\n" + "\n".join(faces) + "\n"


def page_text(body: str, scripts) -> str:
    """Every letter the page can draw: element text, SVG text and the strings inside the embedded scripts."""
    return unescape(re.sub(r"<[^>]+>", " ", body)) + "".join(scripts)


H1 = re.compile(r"<h1\b[^>]*>(.*?)</h1>", re.S)


def title_mismatch(body: str, title: str):
    """Return the h1 text when it differs from the page title, so the two stay consistent."""
    heading = H1.search(body)
    text = " ".join(unescape(re.sub(r"<[^>]+>", "", heading[1])).split()) if heading else None
    return text if text is not None and text != " ".join(title.split()) else None


def assemble(body_path: Path, output_path: Path, title: str, *, append_paths=(), home=None) -> None:
    paths = [body_path, *append_paths]
    if any(path.resolve() == output_path.resolve() for path in paths):
        raise ValueError("Body input and output must be different files")
    assets = Path(__file__).resolve().parent.parent / "assets"
    body = "\n".join(path.read_text(encoding="utf-8") for path in paths)

    mismatch = title_mismatch(body, title)
    if mismatch:
        print(f"참고: h1 '{mismatch}'이(가) 전달된 제목 '{title}'과 다릅니다.", file=sys.stderr)

    if home:
        body = f'<nav class="visual-home"><a href="{escape(home, quote=True)}">홈으로</a></nav>\n' + body

    components = Components()
    components.feed(body)

    styles = (assets / "base.css").read_text(encoding="utf-8")
    scripts = [f'<script data-illustrate-module="page">\n{(assets / "components" / "page.js").read_text(encoding="utf-8")}\n</script>']

    if components.names:
        styles += "\n" + (assets / "components" / "components.css").read_text(encoding="utf-8")
        selected = []
        for name in components.names:
            for dependency in COMPONENTS[name]:
                if dependency not in selected:
                    selected.append(dependency)
        # Focus runs after renderers so linked marks are ready on the first click.
        if "focus" in selected:
            selected.remove("focus")
            selected.append("focus")
        for name in selected:
            source = (assets / "components" / f"{name}.js").read_text(encoding="utf-8")
            scripts.append(f'<script data-illustrate-module="{name}">\n{source}\n</script>')

    body, math_css = render_math(body, assets)
    styles = font_styles(assets, page_text(body, scripts) + title, ()) + styles + math_css
    body = LENS + "\n" + body
    page = Template((assets / "base.html").read_text(encoding="utf-8")).substitute(
        title=escape(title),
        css=styles,
        body=body,
        scripts="\n".join(scripts),
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with NamedTemporaryFile(mode="w", encoding="utf-8", dir=output_path.parent, delete=False) as file:
        temporary = Path(file.name)
        try:
            file.write(page)
            file.close()
            temporary.replace(output_path)
        finally:
            temporary.unlink(missing_ok=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("body", type=Path, help="Input HTML fragment")
    parser.add_argument("output", type=Path, help="Target standalone HTML output")
    parser.add_argument("--title", required=True, help="Document title (<title> and header)")
    parser.add_argument("--home", metavar="URL", help="Optional home navigation link")
    parser.add_argument("--append", type=Path, action="append", default=[], help="Append another authored body fragment")
    args = parser.parse_args()
    try:
        assemble(args.body, args.output, args.title, append_paths=args.append, home=args.home)
    except (OSError, ValueError) as error:
        sys.exit(f"조립 실패: {error}")
