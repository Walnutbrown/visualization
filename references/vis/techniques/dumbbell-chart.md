# 덤벨 차트 (`dumbbell-chart`)

차트 · 과제: 비교, 시간에 따른 변화, 편차 · 데이터: 범주형, 수치형 · 형태: 점

범주별로 두 개의 점을 선으로 연결하여 두 값 사이의 차이나 변화를 강조하는 차트.

출처: https://vis.hwpark.net/catalog/dumbbell-chart/

## 언제 사용하나

- 범주별로 두 값을 비교할 때(예: 전 vs. 후, 남성 vs. 여성, 예산 vs. 실제)
- 변화나 격차의 크기와 방향을 강조할 때
- 격차 크기순으로 정렬하여 순위화된 차이를 보여줄 때
- 더 깔끔하고 정확한 쌍대 비교를 위해 그룹 막대 차트를 대체할 때

## 이럴 땐 피하세요

- 범주별로 두 개 이상의 값을 비교할 때는 평행 좌표 플롯이나 여러 선을 사용하는 기울기 차트를 사용하세요
- 각 값의 절대 크기를 두드러지게 보여줘야 할 때는 대신 그룹 막대 차트를 사용하세요
- 범주가 매우 적어(3개 미만) 차트가 성겨 보일 때는 간단한 표로 충분할 수 있습니다
- 전체의 부분을 비교하는 경우에는 누적 막대 차트나 파이 차트를 사용하세요

**대안:** `parallel-coordinates`, `slope-chart`, 그룹 막대 차트, 표, `stacked-bar-chart`, `pie-chart`

**함께 쓰면 좋은 기법:** `animated-transition`, `click-to-select`, `hover-highlight`, `sort`, `tooltip`

**관련 기법:** `bar-chart`, `scatterplot`, `slope-chart`
