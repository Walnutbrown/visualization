"""Render explicitly marked TeX nodes once during offline HTML assembly."""

import base64
from html import escape, unescape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess

DELIMITERS = re.compile(r"\\\((.+?)\\\)|\\\[(.+?)\\\]", re.S)
PROTECTED = {"script", "style", "pre", "code", "textarea"}


class MathNodes(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.source, self.nodes, self.active = source, [], None
        self.protected, self.text_start = [], None
        self.lines = [0]
        for line in source.splitlines(keepends=True):
            self.lines.append(self.lines[-1] + len(line))

    def source_position(self):
        line, column = self.getpos()
        return self.lines[line - 1] + column

    def flush_text(self, end):
        if self.text_start is None:
            return
        for match in DELIMITERS.finditer(self.source[self.text_start:end]):
            tex = unescape(match[1] if match[1] is not None else match[2]).strip()
            if not tex:
                raise ValueError("빈 수식은 렌더링할 수 없습니다.")
            self.nodes.append({"start": self.text_start + match.start(), "end": self.text_start + match.end(),
                               "tag": "span", "display": match[2] is not None, "tex": tex})
        self.text_start = None

    def handle_starttag(self, tag, attrs):
        self.flush_text(self.source_position())
        if self.active is not None:
            raise ValueError("수식 요소 안에는 HTML 대신 LaTeX 텍스트만 넣으세요.")
        if tag in PROTECTED:
            self.protected.append(tag)
        if self.protected:
            return
        mode = dict(attrs).get("data-math")
        if mode is None:
            return
        if (tag, mode) not in [("span", "inline"), ("div", "block"), ("span", "block")]:
            raise ValueError("수식은 \\(…\\), \\[…\\], span data-math=inline 또는 div data-math=block으로 작성하세요.")
        self.active = {"start": self.source_position(), "tag": tag, "display": mode == "block", "text": []}

    def handle_data(self, data):
        if self.active is not None:
            self.active["text"].append(data)
        elif not self.protected and self.text_start is None:
            self.text_start = self.source_position()

    def handle_endtag(self, tag):
        self.flush_text(self.source_position())
        if self.protected:
            if tag == self.protected[-1]:
                self.protected.pop()
            return
        if self.active is None:
            return
        if tag != self.active["tag"]:
            raise ValueError("수식 요소의 닫는 태그가 맞지 않습니다.")
        tex = "".join(self.active.pop("text")).strip()
        if not tex:
            raise ValueError("빈 수식은 렌더링할 수 없습니다.")
        self.nodes.append({**self.active, "end": self.source.index(">", self.source_position()) + 1, "tex": tex})
        self.active = None

    def handle_comment(self, data):
        self.flush_text(self.source_position())
        if self.active is not None:
            raise ValueError("수식 요소 안에 HTML 주석을 넣지 마세요.")

    handle_decl = handle_comment
    handle_pi = handle_comment
    unknown_decl = handle_comment

    def close(self):
        super().close()
        self.flush_text(len(self.source))


def math_styles(assets):
    vendor = assets / "vendor" / "katex"
    css = (vendor / "katex.min.css").read_text(encoding="utf-8")

    def embed(match):
        name = re.search(r"url\((fonts/[^)]+\.woff2)\)", match[0])
        if not name:
            raise ValueError("수식 글꼴의 WOFF2 소스를 찾을 수 없습니다.")
        data = base64.b64encode((vendor / name[1]).read_bytes()).decode("ascii")
        return f'src:url(data:font/woff2;base64,{data}) format("woff2")'

    css = re.sub(r"src:[^;}]+", embed, css)
    if any(not url.startswith("data:") for url in re.findall(r"url\(([^)]+)\)", css)):
        raise ValueError("수식 스타일에 외부 자원 참조가 남아 있습니다.")
    license_text = (vendor / "LICENSE").read_text(encoding="utf-8")
    return "/* KaTeX license\n" + license_text + "\n*/\n" + css + "\n" + (assets / "math.css").read_text(encoding="utf-8")


def render_math(body, assets):
    parser = MathNodes(body)
    parser.feed(body)
    parser.close()
    if parser.active is not None:
        raise ValueError("수식 요소가 닫히지 않았습니다.")
    if not parser.nodes:
        return body, ""
    expressions = [{"tex": node["tex"], "display": node["display"]} for node in parser.nodes]
    try:
        result = subprocess.run(["node", str(Path(__file__).with_name("render_math.cjs"))], input=json.dumps(expressions), capture_output=True, text=True, timeout=120)
    except FileNotFoundError as error:
        raise RuntimeError("LaTeX 수식 조립에는 Node.js가 필요합니다. 결과를 평문으로 바꾸지 말고 실행 환경을 확인하세요.") from error
    if result.returncode:
        raise ValueError(result.stderr.strip())
    rendered = json.loads(result.stdout)
    if not isinstance(rendered, list) or len(rendered) != len(parser.nodes) or not all(isinstance(value, str) for value in rendered):
        raise ValueError("수식 렌더링 결과가 입력과 일치하지 않습니다.")
    for node, markup in reversed(list(zip(parser.nodes, rendered))):
        mode = "block" if node["display"] else "inline"
        focus = ' tabindex="0"' if node["display"] else ""
        replacement = f'<{node["tag"]} class="math-{mode}" data-tex="{escape(node["tex"], quote=True)}"{focus}>{markup}</{node["tag"]}>'
        body = body[:node["start"]] + replacement + body[node["end"]:]
    return body, math_styles(assets)
