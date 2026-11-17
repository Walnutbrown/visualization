"""Measure both gallery sources at an immutable commit and build the PR chart."""
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
def rows(name):
    raw = subprocess.check_output(['git', '-C', str(a.repo), 'show', source + ':references/vis/' + name], text=True)
    return [line.split(' | ') for line in raw.splitlines() if line.startswith('| `')]
manual_rows, site_rows = rows('gallery-tags.md'), rows('gallery.md')
manual = {re.findall(r'`([^`]+)`', r[0])[0]: re.findall(r'`([^`]+)`', r[1]) for r in manual_rows}
site = {re.findall(r'`([^`]+)`', r[0])[0]: re.findall(r'`([^`]+)`', r[10]) for r in site_rows}
assert len(manual_rows) == len(site_rows) == len(manual) == len(site) == 120
assert manual.keys() == site.keys()
counts = Counter(t for tags in manual.values() for t in tags)
site_counts = Counter(t for tags in site.values() for t in tags)
top = sorted(counts.items(), key=lambda pair: (-pair[1], pair[0]))[:10]
data = {'source': source, 'total': len(manual), 'manual_tagged': sum(bool(t) for t in manual.values()),
        'manual_blank': sum(not t for t in manual.values()), 'site_tagged': sum(bool(t) for t in site.values()),
        'site_links': sum(site_counts.values()), 'site_technique_types': len(site_counts),
        'blank_with_site': sum(not manual[s] and bool(site[s]) for s in manual),
        'blank_both': sum(not manual[s] and not site[s] for s in manual),
        'either_source': sum(bool(manual[s] or site[s]) for s in manual), 'manual_top10': top}
assert data['blank_with_site'] + data['blank_both'] == data['manual_blank']
assert data['manual_tagged'] + data['blank_with_site'] == data['either_source']
body = ['<style>body{background:#fff}main{max-width:1060px}svg{width:100%;height:auto}.source{font-size:14px;overflow-wrap:anywhere}</style>',
        '<h1>갤러리 기법 연결과 빈 태그</h1>',
        f'<p class="lead">작품 {data["total"]}개 · 수동 태그 {data["manual_tagged"]}개 · 수동 판단 보류 {data["manual_blank"]}개</p>',
        f'<p>사이트 연결: {data["site_tagged"]}개 작품 · {data["site_links"]}개 링크 · {data["site_technique_types"]}종 기법<br>'
        f'빈 수동 태그 {data["manual_blank"]}개 중 사이트 연결 있음 {data["blank_with_site"]}개 / 양쪽 연결 없음 {data["blank_both"]}개<br>'
        f'두 출처 중 하나라도 연결된 작품: {data["either_source"]}개. 빈칸은 기법 없음이 아닌 판단 보류.</p>',
        '<h2>수동 기법별 작품 수 상위 10개</h2>',
        '<svg viewBox="0 0 1000 520" role="img" aria-labelledby="chart-title"><title id="chart-title">수동 태그 상위 열 개. 단위는 작품 수이며 중복 집계.</title>']
scale = 570 / top[0][1]
for i, (name, value) in enumerate(top):
    y = 20 + i * 48
    body.append(f'<text x="275" y="{y+23}" text-anchor="end" font-size="20">{escape(name)}</text><rect x="295" y="{y}" width="{value*scale:.2f}" height="31" fill="#365a86"/><text x="{305+value*scale:.2f}" y="{y+23}" font-size="20">{value}개</text>')
body.extend(['</svg>', '<p>단위: 작품 수(링크·기법 종수는 별도 표기) · 범위: 갤러리 120개 전체<br>기법별 작품 수는 중복 집계 · 동률은 slug 사전순 · 출처별 판단은 별도 유지</p>',
             f'<p class="source">원자료: references/vis/gallery.md + gallery-tags.md<br>source SHA: {source}</p>'])
a.out.mkdir(parents=True, exist_ok=True)
(a.out / 'chart.fragment.html').write_text('\n'.join(body), encoding='utf-8')
(a.out / 'counts.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(a.out / 'site-review.json').write_text(json.dumps([{'slug': s, 'site': site[s], 'manual': manual[s]} for s in sorted(manual)], ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(data, ensure_ascii=False))
