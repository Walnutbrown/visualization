# 산점도 (`scatterplot`)

차트 · 과제: 관계, 탐색 지원 · 데이터: 수치형 · 형태: 점

두 변수 간의 관계를 점으로 표현하는 차트.

출처: https://vis.hwpark.net/catalog/scatterplot/

## 언제 사용하나

- 두 정량적 변수 간의 상관관계나 연관성을 조사할 때
- 다변량 데이터에서 군집, 공백, 이상치를 식별할 때
- 회귀 모델을 적합하기 전에 가정을 확인할 때
- 구조에 대한 강한 사전 가설 없이 데이터셋을 탐색할 때

## 이럴 땐 피하세요

- 한 변수가 범주형인 경우에는 막대 차트나 스트립 플롯을 사용하세요
- 시간적 순서가 중요한 시계열 데이터의 경우에는 선 그래프를 사용하세요(산점도는 순서를 잃습니다)
- 과다 플로팅으로 개별 점을 구별할 수 없는 경우(수천 개의 점)에는 구간화된 히트맵, 밀도 등고선, 또는 헥스빈 플롯을 고려하세요
- 그룹 간 단일 변수의 크기를 비교할 때는 막대 차트나 박스 플롯이 더 직접적입니다

**대안:** `bar-chart`, `line-graph`, `heatmap`, `box-plot`

**함께 쓰면 좋은 기법:** `brush-and-link`, `click-to-select`, `cross-filter`, `hover-highlight`, `linked-views`, `tooltip`, `zoom-and-pan`

**관련 기법:** `bubble-chart`, `histogram`, `line-graph`
