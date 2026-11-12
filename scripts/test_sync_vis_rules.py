"""Checks the saved vis snapshot (references/vis) for gaps. No network."""
import re
import sys
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
import sync_vis_rules as sync

VIS = Path(__file__).resolve().parent.parent / "references" / "vis"
FIXTURE = Path(__file__).resolve().parent / "fixtures" / "histogram_fragment.html"
MAIN = sorted(p for p in (VIS / "techniques").glob("*.md") if not p.name.endswith(".detail.md"))
DETAIL = sorted((VIS / "techniques").glob("*.detail.md"))
PRINCIPLES = sorted((VIS / "principles").glob("*.md"))


def read(path):
    return path.read_text(encoding="utf-8")


class SnapshotTest(unittest.TestCase):
    def test_gallery_and_tags(self):
        rows = [line.split(" | ") for line in read(VIS / "gallery.md").splitlines() if line.startswith("| `")]
        self.assertEqual(len(rows), 120)
        self.assertEqual(sum(row[4] == "고전" for row in rows), 20)
        self.assertEqual(sum(row[4] == "IIB" for row in rows), 100)
        gallery_slugs = {row[0][3:-1] for row in rows}
        self.assertEqual(len(gallery_slugs), 120)
        known = set(re.findall(r"^\| `([^`]+)`", read(VIS / "catalog.md"), re.M))
        tag_rows = [line.split(" | ") for line in read(VIS / "gallery-tags.md").splitlines() if line.startswith("| `")]
        self.assertEqual({row[0][3:-1] for row in tag_rows}, gallery_slugs)
        self.assertEqual(len(tag_rows), 120)
        for row in tag_rows:
            self.assertLessEqual(set(re.findall(r"`([^`]+)`", row[1])), known, row[0])

    def test_gallery_review_scope_and_basis(self):
        rows = [line.split(" | ") for line in read(VIS / "gallery-tags.md").splitlines() if line.startswith("| `")]
        for row in rows:
            self.assertEqual(len(row), 6, row[0])
            self.assertIn(row[2], {"근거 확인", "검토 후 판단 불가"}, row[0])
            self.assertEqual(row[1] == "-", row[2] == "검토 후 판단 불가", row[0])
            self.assertIn(row[3], {"원본 화면 검토", "원본 접근 실패", "원본 대체·제한 화면", "원본 렌더링 실패"}, row[0])
            self.assertGreater(len(row[4]), 35, row[0])
            self.assertNotIn("별도 기록", row[4], row[0])
            if row[3] != "원본 화면 검토":
                self.assertIn("상세", row[4], row[0])

    def test_counts_match_index(self):
        self.assertEqual((len(MAIN), len(DETAIL), len(PRINCIPLES)), (95, 95, 20))
        rows = [l for l in read(VIS / "catalog.md").splitlines() if l.startswith("| `")]
        self.assertEqual(len(rows), len(MAIN))
        self.assertEqual({re.match(r"\| `([^`]+)`", r).group(1) for r in rows}, {p.stem for p in MAIN})

    def test_technique_sections(self):
        for p in MAIN:
            t = read(p)
            for need in ["## 언제 사용하나", "## 이럴 땐 피하세요", "**관련 기법:**"]:
                self.assertIn(need, t, f"{p.name}: {need}")
            head = re.search(r"^(차트|인터랙션) · 과제: (.+) · 데이터: (.+) · 형태: (.+)$", t, re.M)
            self.assertTrue(head, f"{p.name}: 머리줄")
            self.assertNotIn("-", head.group(2).split(", "), f"{p.name}: 과제 태그")
            self.assertNotIn("-", head.group(3).split(", "), f"{p.name}: 데이터 태그")

    def test_detail_sections(self):
        for p in DETAIL:
            t = read(p)
            self.assertIn("## 설명", t, p.name)
            self.assertTrue("## 구조" in t or "## 작동 방식" in t, p.name)
            self.assertRegex(t, r"(?s)## 코드 레퍼런스\n\n```\w*\n.+\n```", p.name)

    def test_interactions_have_how_it_works(self):
        for p in MAIN:
            if read(p).startswith("# ") and "\n인터랙션 ·" in read(p):
                self.assertIn("## 작동 방식", read(p.with_name(p.stem + ".detail.md")), p.name)

    def test_principle_sections(self):
        for p in PRINCIPLES:
            for need in ["## 핵심 아이디어", "## 안티 패턴", "**관련 카탈로그:**"]:
                self.assertIn(need, read(p), f"{p.name}: {need}")

    def test_backtick_slugs_exist(self):
        known = {p.stem for p in MAIN} | {p.stem for p in PRINCIPLES}
        for p in [*MAIN, *PRINCIPLES, VIS / "catalog.md"]:
            for slug in re.findall(r"`([^`\s]+)`", read(p)):
                if slug != "techniques/<slug>.md" and "<" not in slug and "." not in slug:
                    self.assertIn(slug, known, f"{p.name}: `{slug}`")


class ParseTest(unittest.TestCase):
    def test_sync_does_not_overwrite_gallery_tags(self):
        with TemporaryDirectory() as directory:
            target = Path(directory)
            tags = target / "gallery-tags.md"
            tags.write_text("hand edited", encoding="utf-8")
            with patch.object(sync, "OUT", target), patch.object(sync, "collect", return_value=[]), patch.object(sys, "argv", ["sync_vis_rules.py"]):
                sync.main()
            self.assertEqual(tags.read_text(encoding="utf-8"), "hand edited")

    def test_gallery_detail(self):
        page = '''<h1>Example &amp; work</h1><span><span class="lang-ko">금상</span></span></div>
        <div class="flex flex-wrap text-muted-foreground"><span>Author</span><span class="text-border">·</span>
        <span>2024</span><span class="text-border">·</span><span><span class="lang-ko">분야</span></span></div>
        <div class="rounded-lg border-l-4"><span class="lang-ko">설명</span></div>
        <a href="https://example.com/?x=1&amp;y=2"><span class="lang-ko">원본 프로젝트 보기</span></a>'''
        e = sync.parse_gallery("example", page)
        self.assertEqual((e["title"], e["creator"], e["year"], e["kind"], e["award"], e["field"], e["summary"], e["url"]),
                         ("Example & work", "Author", "2024", "IIB", "금상", "분야", "설명", "https://example.com/?x=1&y=2"))
        historic = sync.parse_gallery("example", page.replace("금상", "고전"))
        self.assertEqual((historic["kind"], historic["award"]), ("고전", ""))

    def setUp(self):
        self.e = sync.parse("histogram", read(FIXTURE))

    def test_head(self):
        e = self.e
        self.assertEqual((e["title"], e["kind"], e["tags"], e["data"], e["shapes"]),
                         ("히스토그램", "차트", ["분포"], ["수치형"], ["막대"]))

    def test_avoid_and_alternatives(self):
        self.assertEqual(self.e["avoid_bold"], ["막대 차트", "박스 플롯", "바이올린 플롯", "선 그래프"])
        by_title = {"막대 차트": "bar-chart", "박스 플롯": "box-plot", "선 그래프": "line-graph"}
        self.assertEqual(sync.alternatives(self.e, by_title), ["`bar-chart`", "`box-plot`", "바이올린 플롯", "`line-graph`"])

    def test_code_and_sections(self):
        lang, code = self.e["code"][0]
        self.assertEqual(lang, "js")
        self.assertTrue(code.startswith("// Observable Plot - histogram"))
        self.assertIn('y: "count"', code)
        self.assertEqual(self.e["sections"]["관련 기법"], ["box-plot", "line-graph", "scatterplot", "violin-plot"])

    def test_li_with_inner_ko_span(self):
        html = '<h1><span class="lang-ko">T</span></h1><h2><span class="lang-ko">작동 방식</span></h2><ol>' \
               '<li><span class="lang-ko"><strong>가</strong>: 나</span><span class="lang-en">x</span></li></ol>'
        self.assertEqual(sync.parse("t", html)["sections"]["작동 방식"], ["가: 나"])


if __name__ == "__main__":
    unittest.main()
