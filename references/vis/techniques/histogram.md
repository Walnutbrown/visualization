# 히스토그램 (`histogram`)

차트 · 과제: 분포 · 데이터: 수치형 · 형태: 막대

수치 데이터의 분포를 구간별 막대로 표현하는 차트.

출처: https://vis.hwpark.net/catalog/histogram/

## 언제 사용하나

- 연속 변수 분포의 형태를 이해할 때(급여, 온도, 시험 점수)
- 통계 모델링 전에 왜도, 이상치, 다봉성을 확인할 때
- 겹치거나 패싯 처리된 히스토그램으로 그룹 간 변수 분포를 비교할 때
- 품질 관리: 측정값이 예상 범위 내에 있는지 확인할 때

## 이럴 땐 피하세요

- 범주 간 값을 비교할 때는 막대 차트를 사용하세요(히스토그램은 연속 데이터용입니다)
- 표본 크기가 매우 작은 경우(관측치 20개 미만)에는 개별 데이터 포인트나 점 도표가 더 유익합니다
- 많은 그룹 간 분포를 비교할 때는 박스 플롯이나 바이올린 플롯이 더 간결합니다
- 시간적 순서가 중요한 경우에는 선 그래프를 사용하세요

**대안:** `bar-chart`, `box-plot`, `violin-plot`, `line-graph`

**함께 쓰면 좋은 기법:** `animated-transition`, `brush-and-link`, `cross-filter`, `dynamic-query`, `hover-highlight`, `tooltip`

**관련 기법:** `box-plot`, `line-graph`, `scatterplot`, `violin-plot`
