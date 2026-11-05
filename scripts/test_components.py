import json
import subprocess
import unittest
from pathlib import Path

COMPONENTS = Path(__file__).resolve().parent.parent / "assets" / "components"


def run(expression):
    """Evaluate a JS expression after loading core and the data helpers with a minimal fake DOM."""
    sources = "\n".join((COMPONENTS / f"{name}.js").read_text(encoding="utf-8") for name in ["core", "chart", "waterfall", "histogram", "heatmap", "venn", "steps"])
    node = "tag => ({tag, textContent: '', children: [], setAttribute() {}, addEventListener() {}, append(...c) { this.children.push(...c); }})"
    program = f"globalThis.window = globalThis; globalThis.document = {{querySelectorAll: () => [], createElementNS: (_, tag) => ({node})(tag)}};\n{sources}\n" \
              f"try {{ console.log(JSON.stringify({{ok: ({expression})}})); }} catch (error) {{ console.log(JSON.stringify({{error: error.message}})); }}"
    result = subprocess.run(["node", "-e", program], capture_output=True, text=True, check=True)
    return json.loads(result.stdout)


def shown(node):
    """Strings drawn on screen in a rendered SVG tree; <title> tooltips do not count."""
    if node["tag"] == "title":
        return []
    return ([node["textContent"]] if node["tag"] == "tspan" else []) + [text for child in node["children"] for text in shown(child)]


class ChartTest(unittest.TestCase):
    BIRTHDAY = '{kind:"line", title:"t", data:[{x:0,y:0},{x:23,y:0.507,label:"23명"},{x:60,y:0.994}], markers:[{y:0.5,label:"확률 1/2"}]}'

    def test_point_label_and_marker_are_visible(self):
        texts = shown(run(f'Illustrate.plot({self.BIRTHDAY}, 600)')["ok"])
        self.assertIn("23명", texts)
        self.assertIn("확률 1/2 0.5", texts)

    def test_bar_axis_stretches_to_marker(self):
        texts = shown(run('Illustrate.plot({kind:"bar", title:"t", data:[{label:"A",value:3}], markers:[{value:10,label:"목표"}]}, 600)')["ok"])
        self.assertIn("목표 10", texts)
        self.assertIn("10", texts)

    def test_ticks_are_round_values_inside_a_given_range(self):
        self.assertEqual(run('Illustrate.ticks([0.9, 1.2]).values')["ok"], [0.9, 1, 1.1, 1.2])
        self.assertEqual(run('Illustrate.ticks([1, 7]).values')["ok"], [2, 4, 6])

    def test_small_tick_steps_keep_their_digits(self):
        self.assertIn("0.015", shown(run('Illustrate.plot({kind:"line", title:"t", yDomain:[0,0.02], data:[{x:0,y:0},{x:1,y:0.02}]}, 600)')["ok"]))

    def test_automatic_range_widens_to_labelled_ticks(self):
        texts = shown(run('Illustrate.plot({kind:"scatter", title:"t", data:[{x:1,y:2},{x:9,y:8}]}, 600)')["ok"])
        self.assertIn("0", texts)
        self.assertIn("10", texts)

    def test_unlabelled_marker_is_rejected(self):
        self.assertIn("label", run('Illustrate.chartMarkers([{y:0.5}], {x:[0,1], y:[0,1]})')["error"])

    def test_marker_needs_exactly_one_axis(self):
        self.assertIn("value 하나", run('Illustrate.chartMarkers([{x:1, label:"a"}], {value:[0,10]})')["error"])

    def test_marker_outside_given_domain_is_rejected(self):
        self.assertIn("범위", run(f'Illustrate.plot({{...{self.BIRTHDAY}, yDomain:[0,1], markers:[{{y:2,label:"a"}}]}}, 600)')["error"])


class MotionTest(unittest.TestCase):
    def test_probe_starts_on_the_given_point_and_only_lines_have_one(self):
        self.assertIn("23 → 0.507", shown(run(f'Illustrate.plot({{...{ChartTest.BIRTHDAY}, probe: 22}}, 600)')["ok"]))
        self.assertNotIn("→", "".join(shown(run('Illustrate.plot({kind:"scatter", title:"t", probe: 1, data:[{x:1,y:2}]}, 600)')["ok"])))

    def test_probe_outside_the_data_is_rejected(self):
        self.assertIn("probe", run(f'Illustrate.plot({{...{ChartTest.BIRTHDAY}, probe: 99}}, 600)')["error"])

    def test_numbers_glide_only_between_matching_shapes(self):
        self.assertEqual(run('Illustrate.mix("M0,0 L10,20", "M10,0 L20,40", 0.5)')["ok"], "M5,0 L15,30")
        self.assertEqual(run('Illustrate.mix("translate(-4.5 2)", "translate(5.5 2)", 0.25)')["ok"], "translate(-2 2)")
        self.assertEqual(run('[0.4, 0.6].map(t => Illustrate.mix("translate(0,0)", "rotate(90)", t))')["ok"], ["translate(0,0)", "rotate(90)"])


class WaterfallTest(unittest.TestCase):
    def test_running_totals_and_computed_subtotal(self):
        rows = run('Illustrate.waterfallRows([{label:"매출",value:100,total:true},{label:"원가",value:-55},{label:"총이익",total:true},{label:"세금",value:-10.1},{label:"순이익",total:true,value:34.9}])')["ok"]
        self.assertEqual([(r["start"], r["end"]) for r in rows], [(0, 100), (100, 45), (0, 45), (45, 34.9), (0, 34.9)])

    def test_wrong_stated_total_is_rejected(self):
        self.assertIn("누적", run('Illustrate.waterfallRows([{label:"a",value:10,total:true},{label:"b",value:5},{label:"c",value:14,total:true}])')["error"])

    def test_first_step_must_be_a_total(self):
        self.assertIn("첫 단계", run('Illustrate.waterfallRows([{label:"a",value:10},{label:"b",value:5}])')["error"])


class HistogramTest(unittest.TestCase):
    def test_edges_go_to_upper_bin_and_maximum_closes_last_bin(self):
        bins = run('Illustrate.histogramBins({values:[0, 0.1, 0.2, 0.3, 0.3, 0.4], binWidth:0.1})')["ok"]
        self.assertEqual([b["count"] for b in bins], [1, 1, 1, 3])

    def test_whole_number_values(self):
        bins = run('Illustrate.histogramBins({values:[45,52,58,61,100], binWidth:10})')["ok"]
        self.assertEqual([(b["from"], b["count"]) for b in bins], [(40, 1), (50, 2), (60, 1), (70, 0), (80, 0), (90, 1)])

    def test_identical_values_make_one_bin(self):
        self.assertEqual(len(run('Illustrate.histogramBins({values:[5,5,5], binWidth:2})')["ok"]), 1)

    def test_prebinned_gaps_are_rejected(self):
        self.assertIn("빈틈", run('Illustrate.histogramBins({bins:[{from:0,to:1,count:2},{from:2,to:3,count:1}]})')["error"])

    def test_unequal_bin_widths_are_rejected(self):
        self.assertIn("너비", run('Illustrate.histogramBins({bins:[{from:0,to:1,count:10},{from:1,to:10,count:10}]})')["error"])

    def test_decimal_bin_widths_tolerate_rounding(self):
        bins = [{"from": 0, "to": 0.1, "count": 1}, {"from": 0.1, "to": 0.3 - 0.1, "count": 2}]
        self.assertEqual(run(f'Illustrate.histogramBins({{bins:{json.dumps(bins)}}})')["ok"], bins)


class HeatmapTest(unittest.TestCase):
    def test_sequential_classes_cover_domain(self):
        self.assertEqual(run('(s => [0, 3.74, 3.75, 15].map(s.classOf))(Illustrate.heatmapScale({values:[[0,15]]}))')["ok"], [0, 0, 1, 3])

    def test_diverging_is_symmetric_around_midpoint(self):
        self.assertEqual(run('(s => [-1, -0.3, 0, 0.3, 1].map(s.classOf))(Illustrate.heatmapScale({scale:"diverging", domain:[-1,1], values:[[-1,1]]}))')["ok"], [0, 1, 2, 3, 4])

    def test_value_outside_domain_is_rejected(self):
        self.assertIn("domain", run('Illustrate.heatmapScale({domain:[0,1], values:[[2]]})')["error"])


class VennTest(unittest.TestCase):
    SETS = '[{id:"A",label:"고객"},{id:"B",label:"주문"}]'

    def test_region_names_describe_exclusive_membership(self):
        regions = run(f'Illustrate.vennRegions({{sets:{self.SETS}, regions:[{{sets:["A"]}},{{sets:["B","A"]}}]}})')["ok"]
        self.assertEqual([(r["key"], r["name"]) for r in regions], [("A", "고객에만 속함"), ("A&B", "고객·주문 모두에 속함")])

    def test_outside_region_needs_universe(self):
        self.assertIn("universe", run(f'Illustrate.vennRegions({{sets:{self.SETS}, regions:[{{sets:[]}}]}})')["error"])

    def test_more_than_three_sets_is_rejected(self):
        self.assertIn("2개 또는 3개", run('Illustrate.vennRegions({sets:[{id:"a",label:"a"},{id:"b",label:"b"},{id:"c",label:"c"},{id:"d",label:"d"}]})')["error"])


class WrapTest(unittest.TestCase):
    def test_korean_wraps_between_words(self):
        self.assertEqual(run('Illustrate.wrap("주문 없는 고객", 62)')["ok"], ["주문 없는", "고객"])

    def test_long_word_still_splits(self):
        self.assertEqual(run('Illustrate.wrap("가나다라마바", 30)')["ok"], ["가나", "다라", "마바"])


if __name__ == "__main__":
    unittest.main()
