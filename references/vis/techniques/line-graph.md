# 선 그래프 (`line-graph`)

차트 · 과제: 시간에 따른 변화, 비교 · 데이터: 시간, 수치형 · 형태: 선과 영역

데이터 포인트를 선으로 연결하여 시간에 따른 변화를 보여주는 차트.

출처: https://vis.hwpark.net/catalog/line-graph/

## 언제 사용하나

- 시간에 따른 추세, 패턴, 궤적을 보여줄 때(주가, 기온, 지표 등)
- 같은 기간 동안 여러 시리즈가 어떻게 변화하는지 비교할 때
- 변화율, 가속도, 변곡점을 강조할 때
- 점들 사이의 보간이 의미 있는 연속 데이터를 표시할 때

## 이럴 땐 피하세요

- 서로 관련 없는 범주 간 값을 비교할 때는 막대 차트를 사용하세요
- x축 범주에 의미 있는 순서가 없으면 순서 없는 점을 연결하는 것은 잘못된 연속성을 암시합니다
- 단일 변수의 분포를 보여줄 때는 히스토그램이나 박스 플롯을 사용하세요
- 데이터 포인트가 매우 적을 때(2~3개)는 막대 차트가 비교를 더 명확하게 전달할 수 있습니다

**대안:** `bar-chart`, `histogram`, `box-plot`

**함께 쓰면 좋은 기법:** `animated-transition`, `brush-and-link`, `cross-filter`, `hover-highlight`, `linked-views`, `tooltip`, `zoom-and-pan`

**관련 기법:** `area-graph`, `bar-chart`, `scatterplot`
