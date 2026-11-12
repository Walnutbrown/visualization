# 막대 차트 (`bar-chart`)

차트 · 과제: 비교, 순위 · 데이터: 범주형, 수치형 · 형태: 막대

직사각형 막대를 사용하여 범주별 값을 비교하는 차트.

출처: https://vis.hwpark.net/catalog/bar-chart/

## 언제 사용하나

- 적은-중간 개수의 범주(5~30개)에 걸쳐 이산적인 수량을 비교할 때
- 상위 10개 목록이나 설문 응답 등 순위를 보여줄 때
- 추세보다 정확한 값 비교가 더 중요한 데이터를 제시할 때
- 청중이 별도의 학습 없이도 빠르게 해석해야 하는 결과를 표시할 때

## 이럴 땐 피하세요

- 연속적인 데이터 분포에는 대신 히스토그램을 사용하세요
- 데이터 포인트가 많은 시간에 따른 변화를 보여줄 때는 선 그래프가 시간적 연속성을 더 잘 보존합니다
- 전체에 대한 부분을 비교할 때는 누적 막대 차트나 파이 차트를 사용하세요
- 두 개의 수량형 변수를 비교할 때는 산점도를 사용하세요

**대안:** `histogram`, `line-graph`, `stacked-bar-chart`, `pie-chart`, `scatterplot`

**함께 쓰면 좋은 기법:** `animated-transition`, `click-to-select`, `cross-filter`, `hover-highlight`, `sort`, `tooltip`

**관련 기법:** `histogram`, `line-graph`, `stacked-bar-chart`
