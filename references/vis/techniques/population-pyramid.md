# 인구 피라미드 (`population-pyramid`)

차트 · 과제: 비교, 분포 · 데이터: 범주형, 수치형 · 형태: 막대

연령대별 인구 분포를 남녀 등 두 범주로 나누어 대칭으로 보여주는 양방향 가로 막대 차트.

출처: https://vis.hwpark.net/catalog/population-pyramid/

## 언제 사용하나

- 인구나 노동력의 연령과 성별 구조 시각화
- 두 시점이나 지역 간 인구통계 분포 비교(나란히 배치)
- 두 상호 보완적 그룹이 순서형 변수에 걸쳐 어떻게 분포하는지 보여주기
- 인구통계학적 불균형, 공백, 불일치 강조하기

## 이럴 땐 피하세요

- 두 그룹 이상을 비교할 때는 그룹 막대 차트나 누적 막대 차트를 사용하세요
- 범주가 순서형이 아닐 때(자연스러운 순서가 없을 때)는 표준 막대 차트가 더 명확합니다
- 두 그룹이 상호 보완적이지 않거나 비교 불가능한 스케일일 때
- 시계열 데이터의 경우에는 두 개의 시리즈를 가진 선 그래프를 사용하세요

**대안:** 그룹 막대 차트, `stacked-bar-chart`, `line-graph`

**함께 쓰면 좋은 기법:** `animated-transition`, `click-to-select`, `dynamic-query`, `hover-highlight`, `tooltip`

**관련 기법:** `bar-chart`, `histogram`, `line-graph`
