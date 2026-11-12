"""Build the measured PR chart fragment from an immutable repository commit."""
import argparse
from collections import Counter
from html import escape
import json
from pathlib import Path
import re
import subprocess

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('--repo', type=Path, required=True)
p.add_argument('--source', required=True)
p.add_argument('--out', type=Path, required=True)
a = p.parse_args()
source = subprocess.check_output(['git', '-C', str(a.repo), 'rev-parse', a.source + '^{commit}'], text=True).strip()
raw = subprocess.check_output(['git', '-C', str(a.repo), 'show', source + ':references/vis/gallery-tags.md'], text=True)
rows = [line.split(' | ') for line in raw.splitlines() if line.startswith('| `')]
assert len(rows) == 120 and len({r[0] for r in rows}) == 120
counts = Counter(tag for row in rows for tag in re.findall(r'`([^`]+)`', row[1]))
top = sorted(counts.items(), key=lambda x: (-x[1], x[0]))[:10]
assert top and all(0 < value <= len(rows) for _, value in top)
data = {'source': source, 'total': len(rows), 'tagged': sum(row[1] != '-' for row in rows), 'empty': sum(row[1] == '-' for row in rows), 'top10': top}
body = [f'<style>body{{background:#fff}}main{{max-width:1060px}}svg{{width:100%;height:auto}}.source{{font-size:14px;overflow-wrap:anywhere}}</style>',
        '<h1>갤러리 기법 태그 현황</h1>',
        f'<p class="lead">작품 {len(rows)}개 · 태그 있음 {data["tagged"]}개 · 빈 태그 {data["empty"]}개</p>',
        '<h2>기법별 작품 수 상위 10개</h2>',
        '<svg viewBox="0 0 1000 540" role="img" aria-labelledby="chart-title"><title id="chart-title">기법별 태깅 작품 수. 한 작품은 여러 기법에 포함될 수 있음.</title>']
scale = 570 / top[0][1]
for i, (name, value) in enumerate(top):
    y = 20 + i * 48
    body.append(f'<text x="275" y="{y+23}" text-anchor="end" font-size="20">{escape(name)}</text><rect x="295" y="{y}" width="{value*scale:.2f}" height="31" fill="#365a86"/><text x="{305+value*scale:.2f}" y="{y+23}" font-size="20">{value}개</text>')
body.extend(['</svg>', '<p>단위: 작품 수 · 범위: 갤러리 120개 전체<br>한 작품에 여러 기법 중복 집계 · 동률은 slug 사전순</p>',
             f'<p class="source">원자료: references/vis/gallery-tags.md<br>source SHA: {source}</p>'])
a.out.mkdir(parents=True, exist_ok=True)
(a.out / 'chart.fragment.html').write_text('\n'.join(body), encoding='utf-8')
(a.out / 'counts.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(data, ensure_ascii=False))
