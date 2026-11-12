import base64
import contextlib
import importlib.util
import io
import re
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from assemble import assemble, font_styles, title_mismatch

HAS_FONTTOOLS = all(importlib.util.find_spec(name) for name in ("fontTools", "brotli"))


class AssembleTest(unittest.TestCase):
    def test_offline_document_preserves_body_and_escapes_title(self):
        with tempfile.TemporaryDirectory() as directory:
            body = Path(directory) / "body.html"
            output = Path(directory) / "nested" / "vis.html"
            fragment = '<h1>비교</h1><p>$5, ${title}, 한글</p><div class="bar">차트</div>'
            body.write_text(fragment, encoding="utf-8")
            assemble(body, output, '</title><script>alert("x")</script>')
            page = output.read_text(encoding="utf-8")
            self.assertIn('class="bar"', page)
            self.assertIn('&lt;/title&gt;&lt;script&gt;', page)
            self.assertNotIn('<script>alert', page)
            self.assertIn('lang="ko"', page)
            self.assertNotIn('prefers-color-scheme', page)
            self.assertNotIn('<link', page)
            self.assertEqual(body.read_text(encoding="utf-8"), fragment)

    def test_page_slider_has_no_displacement_filter(self):
        with tempfile.TemporaryDirectory() as directory:
            body = Path(directory) / "body.html"
            output = Path(directory) / "vis.html"
            body.write_text("<h1>시각화</h1>", encoding="utf-8")
            assemble(body, output, "시각화")
            page = output.read_text(encoding="utf-8")
        css = re.search(r"<style[^>]*>(.*?)</style>", page, re.S).group(1)
        rules = [r for r in css.split("}") if ".page-slider" in r.split("{")[0]]
        self.assertTrue(rules)
        for rule in rules:
            self.assertNotIn("url(", rule)

    def test_title_mismatch_flags_only_different_h1(self):
        self.assertIsNone(title_mismatch('<h1>행렬, <em>선형</em>변환</h1><p>x</p>', '행렬, 선형변환'))
        self.assertIsNone(title_mismatch('<p>h1 없음</p>', '제목'))
        self.assertEqual(title_mismatch('<h1>다른 제목</h1>', '제목'), '다른 제목')

    def test_input_cannot_be_overwritten(self):
        with tempfile.TemporaryDirectory() as directory:
            body = Path(directory) / "body.html"
            body.write_text("original", encoding="utf-8")
            with self.assertRaises(ValueError):
                assemble(body, body, "title")
            self.assertEqual(body.read_text(encoding="utf-8"), "original")

    def assemble_fragment(self, fragment):
        with tempfile.TemporaryDirectory() as directory:
            body = Path(directory) / "body.html"
            output = Path(directory) / "vis.html"
            body.write_text(fragment, encoding="utf-8")
            assemble(body, output, "번들 테스트")
            return output.read_text(encoding="utf-8")

    def test_vendor_bundles_only_when_used(self):
        plain = self.assemble_fragment("<h1>번들 테스트</h1><p>Plot과 d3 이야기</p>")
        self.assertNotIn("data-illustrate-vendor", plain)
        plot = self.assemble_fragment("<h1>번들 테스트</h1><script>Plot.plot({})</script>")
        self.assertEqual(re.findall(r'data-illustrate-vendor="([^"]+)"', plot), ["d3.min", "plot.umd.min"])
        d3 = self.assemble_fragment("<h1>번들 테스트</h1><script>d3.select('x')</script>")
        self.assertEqual(re.findall(r'data-illustrate-vendor="([^"]+)"', d3), ["d3.min"])
        sankey = self.assemble_fragment("<h1>번들 테스트</h1><script>d3.sankey()</script>")
        self.assertEqual(re.findall(r'data-illustrate-vendor="([^"]+)"', sankey), ["d3.min", "d3-sankey.min"])
        for page in (plot, d3, sankey):  # 번들이 조각 스크립트보다 먼저 실행된다
            self.assertLess(page.index("data-illustrate-vendor"), page.index("<main"))

    def test_vendor_pages_make_no_external_requests(self):
        page = self.assemble_fragment("<h1>번들 테스트</h1><script>Plot.plot({}); d3.sankey()</script>")
        self.assertNotRegex(page, r"<script[^>]*\ssrc=|<link\b|@import|url\(\s*[\"']?(?:https?:)?//")

    def test_examples_assemble_offline(self):
        examples = Path(__file__).resolve().parent.parent / "examples"
        for name in ("plot_bar", "d3_sankey"):
            with tempfile.TemporaryDirectory() as directory:
                output = Path(directory) / "vis.html"
                assemble(examples / f"{name}.html", output, re.search(r"<h1>(.*?)</h1>", (examples / f"{name}.html").read_text(encoding="utf-8"))[1])
                page = output.read_text(encoding="utf-8")
            self.assertIn("data-illustrate-vendor", page)
            self.assertNotRegex(page, r"<script[^>]*\ssrc=|<link\b|@import")

    def test_home_navigation(self):
        with tempfile.TemporaryDirectory() as directory:
            body = Path(directory) / "body.html"
            output = Path(directory) / "vis.html"
            body.write_text("<h1>테스트</h1>", encoding="utf-8")
            assemble(body, output, "테스트", home="https://example.com")
            page = output.read_text(encoding="utf-8")
            self.assertIn('href="https://example.com"', page)
            self.assertIn('class="visual-home"', page)


if __name__ == "__main__":
    unittest.main()
