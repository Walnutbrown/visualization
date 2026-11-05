# 로컬 부품 목록

본문의 `data-illustrate` 선언을 조립기가 읽고 필요한 CSS·JS만 내장한다. 쓰기로 한 부품의 사용법 파일만 읽는다. 부품 소스(`assets/components/`)는 수정·디버깅할 때만 읽는다. CDN, npm 설치, 외부 API가 필요하지 않다.

| 부품 | 그리는 것 | 사용법 |
|---|---|---|
| `chart` | 막대(bar)·선(line)·산점도(scatter), 선 그래프 커서 탐침 | `components/chart.md` |
| `waterfall` | 폭포 차트: 시작값 → 증감 → 합계 | `components/waterfall.md` |
| `histogram` | 히스토그램: 연속 변수의 분포 | `components/histogram.md` |
| `heatmap` | 히트맵·행렬: 상관·교차표·인접 행렬 | `components/heatmap.md` |
| `venn` | 벤 다이어그램: 2~3개 집합의 겹침 | `components/venn.md` |
| `diagram` | 계층형 정방향 관계도 | `components/diagram.md` |
| `compare` | 두 사례 나란히 배치(CSS만) | `components/compare.md` |
| `steps` | 단계 이동, 커서로 단계 사이를 잇는 모션(`data-scrub`) | `components/steps.md` |
| `focus` | 버튼으로 같은 key 요소 함께 강조 | `components/focus.md` |
| `model` | 매개변수 슬라이더(선형·지수) | `components/model.md` |

목록에 없는 기법은 `vis/techniques/<slug>.md`의 구조·주의를 따라 inline SVG로 그리고 `diagram.md`의 SVG 규칙을 지킨다.

## 모든 부품의 공통 규칙

- 설정은 `<script type="application/json">` 한 개에 둔다. `title`은 필수이며 그림에서 읽을 결론을 문장으로 쓴다("분기별 매출"보다 "3분기에 매출이 정점"). `description`을 생략하면 데이터로 대체 텍스트를 만든다.
- 동적 라벨은 textContent로 표시한다. HTML 문자열을 설정에 넣지 않는다. JSON을 HTML에 삽입할 때 `<`를 `<`로 이스케이프해 `</script>`가 요소를 닫지 않게 한다. Python에서는 `json.dumps(config, ensure_ascii=False).replace('<', '\\u003c')`를 쓸 수 있다.
- `data-fallback`에는 핵심 값·관계·초기 풀이를 둔다. JS가 꺼져도 값과 설명을 읽을 수 있어야 한다.
- 설정 오류는 그림 자리에 "시각화 확인 필요"로 표시된다. 오류 표시는 검수 실패이므로 전달 전에 고친다. 폰트·색·크기·조작 UI를 결과물마다 새로 만들지 않는다.
