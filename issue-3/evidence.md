# 이슈 3 갤러리 태깅 측정 근거

- source SHA: `6673369f096d597b77d911bb1cd9ee06a4230dc7`
- 집계 범위: 위 SHA의 `references/vis/gallery-tags.md`에 있는 갤러리 작품 120개 전체.
- 단위: 작품 수. 한 작품은 여러 기법에 중복 집계될 수 있다. 동률은 slug 사전순.
- 원자료: [해당 커밋의 전체 태그 파일](https://github.com/Walnutbrown/visualization/blob/6673369f096d597b77d911bb1cd9ee06a4230dc7/references/vis/gallery-tags.md). 원본 응답은 HTML 앞부분을 확인했고, 형태의 근거가 부족한 작품은 태그를 비웠다.
- 명령: 저장소에서 아래 코드를 `python3`으로 실행한다.

```python
import collections, json, re, subprocess
source='6673369f096d597b77d911bb1cd9ee06a4230dc7'
s=subprocess.check_output(['git','show',source+':references/vis/gallery-tags.md'],text=True)
rows=[line.split(' | ') for line in s.splitlines() if line.startswith('| `')]
counts=collections.Counter(tag for row in rows for tag in re.findall(r'`([^`]+)`',row[1]))
print(json.dumps({'tagged':sum(row[1]!='-' for row in rows),'empty':sum(row[1]=='-' for row in rows),'total':len(rows),'top10':sorted(counts.items(),key=lambda p:(-p[1],p[0]))[:10]},ensure_ascii=False,indent=2))
```

결과:

```json
{
  "tagged": 26,
  "empty": 94,
  "total": 120,
  "top10": [
    [
      "bar-chart",
      5
    ],
    [
      "timeline",
      4
    ],
    [
      "small-multiples",
      3
    ],
    [
      "dot-map",
      2
    ],
    [
      "flow-map",
      2
    ],
    [
      "line-graph",
      2
    ],
    [
      "sort",
      2
    ],
    [
      "tooltip",
      2
    ],
    [
      "area-graph",
      1
    ],
    [
      "bubble-chart",
      1
    ]
  ]
}
```

## 태그가 있는 원자료 행

| 작품 slug | 기법 slug | 원본 접근 |
|---|---|---|
| `playfair-commercial-political-atlas-1786` | `line-graph`, `bar-chart` | HTML 응답 |
| `snow-cholera-map-1854` | `dot-map` | HTML 응답 |
| `nightingale-rose-diagram-1858` | `nightingale-rose` | HTML 응답 |
| `minard-napoleon-march-1869` | `flow-map` | HTML 응답 |
| `muybridge-horse-in-motion-1878` | `small-multiples` | HTML 응답 |
| `gapminder-wealth-health-nations-2006` | `bubble-chart`, `playback-scrub` | HTML 응답 |
| `pudding-film-dialogue-2017` | `dot-matrix-chart` | HTML 응답 |
| `nyt-extremely-detailed-election-map-2021` | `choropleth`, `semantic-zoom` | 접근 제한: HTTP Error 403 |
| `3121-desperate-journeys-2019` | `unit-chart` | HTML 응답 |
| `codex-atlanticus-2019` | `faceted-filter`, `sort` | HTML 응답 |
| `fewer-fireworks-for-celebration-better-air-quality-2019` | `radial-bar-chart`, `small-multiples`, `sort` | HTML 응답 |
| `flowmap-blue-2019` | `flow-map` | HTML 응답 |
| `visualizing-the-history-of-fugazi-2019` | `bar-chart`, `timeline` | HTML 응답 |
| `wedding-data-viz-2019` | `network-diagram` | 접근 제한: HTTP Error 403 |
| `precision-mapping-to-end-child-deaths-2022` | `bubble-map` | HTML 응답 |
| `hong-kong-protests-first-100-days-2022` | `timeline` | HTML 응답 |
| `boreal-ablaze-2023` | `line-graph`, `bar-chart` | HTML 응답 |
| `fentanyl-is-fast-cheap-and-deadly-2023` | `bar-chart` | HTML 응답 |
| `pele-s-greatest-achievements-2023` | `timeline` | HTML 응답 |
| `how-do-we-compare-2023` | `text-search-filter`, `tooltip` | HTML 응답 |
| `modern-art-movements-2023` | `timeline` | HTML 응답 |
| `screens-of-august-2023` | `stacked-bar-chart` | HTML 응답 |
| `beyond-crisis-lives-saved-2024` | `bar-chart`, `tooltip` | HTML 응답 |
| `2024-u-s-election-vote-by-vote-2024` | `dot-map` | 접근 제한: 타임아웃 |
| `is-the-love-song-dying-2024` | `area-graph` | HTML 응답 |
| `total-eclipse-2024` | `small-multiples` | HTML 응답 |

## 시각화

위 원자료로 SVG 막대 그래프를 만들고 `python3 scripts/assemble.py /tmp/vis-issue3/chart.html /tmp/vis-issue3/chart-assembled.html --title '갤러리 기법 태그 현황'`로 조립한 뒤 Chrome headless로 캡처했다.
