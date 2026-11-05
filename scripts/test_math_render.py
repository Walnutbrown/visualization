from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from assemble import assemble
from math_render import render_math


ASSETS = Path(__file__).resolve().parent.parent / "assets"


class MathRenderTest(unittest.TestCase):
    def test_fraction_and_matrix_render_offline_with_mathml(self):
        body = r'<p>변화율 <span data-math="inline">\frac{\partial f}{\partial x}</span></p><div data-math="block">\begin{bmatrix}1&amp;2\\3&amp;4\end{bmatrix}</div>'
        rendered, css = render_math(body, ASSETS)
        self.assertEqual(rendered.count('class="katex-mathml"'), 2)
        self.assertIn("<mfrac>", rendered)
        self.assertIn("<mtable", rendered)
        self.assertNotIn('data-math=', rendered)
        self.assertIn('data-tex=', rendered)
        self.assertIn('data:font/woff2;base64,', css)
        self.assertNotIn('url(fonts/', css)
        self.assertNotIn('http', css)

    def test_no_math_needs_no_node_or_fonts(self):
        body = '<p>$5와 ${title}은 수식으로 추측하지 않습니다.</p><script type="application/json">{"example":"data-math=inline"}</script>'
        with patch('math_render.subprocess.run') as run:
            self.assertEqual(render_math(body, ASSETS), (body, ""))
            run.assert_not_called()

    def test_bad_math_or_html_preserves_previous_output(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            body, output = root / 'body.html', root / 'lesson.html'
            output.write_text('previous')
            for fragment in [r'<span data-math="inline">\frac{1}{</span>', r'<span data-math="inline">\href{https://example.com}{a}</span>', '<div data-math="block">x<em>bad</em></div>', '<span data-math="inline">x']:
                body.write_text(fragment)
                with self.assertRaises(ValueError):
                    assemble(body, output, '수식 오류')
                self.assertEqual(output.read_text(), 'previous')

    def test_source_offsets_and_html_entities_are_preserved(self):
        body = '<h1>한글</h1>\n<p>앞 <span data-math="inline">x &lt; y</span> 뒤</p>'
        rendered, _ = render_math(body, ASSETS)
        self.assertTrue(rendered.startswith('<h1>한글</h1>\n<p>앞 '))
        self.assertTrue(rendered.endswith(' 뒤</p>'))
        self.assertIn('data-tex="x &lt; y"', rendered)

    def test_missing_runtime_is_explicit(self):
        with patch('math_render.subprocess.run', side_effect=FileNotFoundError):
            with self.assertRaisesRegex(RuntimeError, 'Node.js'):
                render_math('<span data-math="inline">x</span>', ASSETS)


    def test_standard_delimiters_render_but_code_and_json_stay_raw(self):
        body = r'<p>\(\frac{a}{b}\)</p><p>\[x^2\]</p><pre>\(raw\)</pre><script type="application/json">{"t":"\\(no\\)"}</script>'
        rendered, css = render_math(body, ASSETS)
        self.assertEqual(rendered.count('class="katex-mathml"'), 2)
        self.assertIn('<span class="math-block"', rendered)
        self.assertIn(r'<pre>\(raw\)</pre>', rendered)
        self.assertIn(r'\\(no\\)', rendered)

    def test_attributes_comments_and_protected_text_stay_raw(self):
        protected = [r'<p title="\(x\)" data-note="\[y\]">본문</p>', r'<!-- \(comment\) -->',
                     r'<pre><code>\(raw\)</code>\[raw\]</pre>', r'<textarea>\(raw\)</textarea>',
                     r'<style>.x::after { content: "\(raw\)"; }</style>']
        body = "\n".join(protected) + r'<p>\(x &lt; y\)</p>'
        rendered, _ = render_math(body, ASSETS)
        for fragment in protected:
            self.assertIn(fragment, rendered)
        self.assertEqual(rendered.count('class="katex-mathml"'), 1)
        self.assertIn('data-tex="x &lt; y"', rendered)

    def test_delimiter_offsets_preserve_entities_and_adjacent_math(self):
        body = '<p>앞 &amp; ' + r'\(x &lt; y\) 뒤 \[z^2\]' + '</p>'
        rendered, _ = render_math(body, ASSETS)
        self.assertTrue(rendered.startswith('<p>앞 &amp; <span'))
        self.assertTrue(rendered.endswith('</span></p>'))
        self.assertIn('</span> 뒤 <span class="math-block"', rendered)
        self.assertEqual(rendered.count('class="katex-mathml"'), 2)

if __name__ == '__main__':
    unittest.main()
