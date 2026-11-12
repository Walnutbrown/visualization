# 이슈 3 태그 집계 근거

- 원자료: `references/vis/gallery-tags.md`, source SHA `6673369f096d597b77d911bb1cd9ee06a4230dc7`
- 범위: 갤러리 작품 120행. 단위: 작품 수. 한 작품에 여러 기법을 태그할 수 있다.
- 결과: 태깅 26개, 미태깅 94개. 10위에서 동률은 slug 사전순으로 선택한다.
- 상위 10개: bar-chart 5, timeline 4, small-multiples 3, dot-map 2, flow-map 2, line-graph 2, sort 2, tooltip 2, area-graph 1, bubble-chart 1.
- PNG: 위 원자료를 SVG 막대 그래프로 구성하고 `python3 scripts/assemble.py /tmp/vis-issue3/chart.html /tmp/vis-issue3/chart-assembled.html --title '갤러리 기법 태그 현황'`로 조립 후 Chrome headless로 캡처했다.

재현 집계 명령 (해당 SHA 체크아웃에서 실행):

```sh
python3 - <<'PY'
from collections import Counter
from pathlib import Path
import re
rows = [x.split(' | ') for x in Path('references/vis/gallery-tags.md').read_text().splitlines() if x.startswith('| `')]
counts = Counter(t for row in rows for t in re.findall(r'`([^`]+)`', row[1]))
print('전체:', len(rows), '태깅:', sum(r[1] != '-' for r in rows), '미태깅:', sum(r[1] == '-' for r in rows))
for slug, n in sorted(counts.items(), key=lambda x: (-x[1], x[0]))[:10]:
    print(slug, n)
PY
```
