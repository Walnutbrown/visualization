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
            fragment = '<h1>비교</h1><p>$5, ${title}, 한글</p><div data-illustrate="chart" class="bar">차트</div>'
            body.write_text(fragment, encoding="utf-8")
            assemble(body, output, '</title><script>alert("x")</script>')
            page = output.read_text(encoding="utf-8")
            self.assertIn('data-illustrate="chart"', page)
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

    def test_components_embedded_when_used(self):
        with tempfile.TemporaryDirectory() as directory:
            body = Path(directory) / "body.html"
            output = Path(directory) / "vis.html"
            body.write_text('<div data-illustrate="chart">차트</div><div data-illustrate="waterfall">폭포</div>', encoding="utf-8")
            assemble(body, output, "컴포넌트 테스트")
            page = output.read_text(encoding="utf-8")
            self.assertIn('data-illustrate-module="chart"', page)
            self.assertIn('data-illustrate-module="waterfall"', page)
            self.assertIn('data-illustrate-module="core"', page)

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
