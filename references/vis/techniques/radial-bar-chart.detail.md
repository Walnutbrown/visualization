# 방사형 막대 차트 상세 (`radial-bar-chart`)

## 설명

방사형 막대 차트는 익숙한 막대 차트를 중심점 둘레로 감싸서, 막대가 바퀴의 살처럼 바깥으로 뻗어 나가게 만듭니다. 각 막대는 동일한 각도의 조각을 차지하며, 길이(반지름)가 정량적 값을 인코딩합니다. 그 결과 대략 원형인 영역 안에 많은 범주를 담을 수 있는 간결하고 시각적으로 독특한 디스플레이가 만들어집니다.

원형 레이아웃은 방사형 막대 차트를 시각적 임팩트와 공간 효율이 중시되는 대시보드, 인포그래픽, 데이터 아트에서 인기 있게 만듭니다. 이 형태는 또한 주기적 데이터와 자연스러운 친화성을 가집니다: 연중 월, 하루 중 시간, 나침반 방향은 원 둘레의 각도 위치에 자연스럽게 대응되어, 차트의 원형 형태로 데이터의 주기적 성질을 강화합니다.

하지만 방사형 레이아웃은 체계적인 지각 왜곡을 일으킵니다: (중심에서 더 먼) 바깥쪽 막대는 동일한 반지름 길이의 안쪽 막대보다 더 긴 호를 그리므로 더 커 보입니다. 즉, 값이 같은 막대라도 안쪽 반지름에 대한 각도 위치에 따라 다르게 보인다는 뜻입니다. 이런 이유로 방사형 막대 차트는 선형 막대 차트에 비해 비교 정확도를 어느 정도 희생합니다. 디자이너는 안쪽 반지름을 상대적으로 크게 유지하여(안쪽과 바깥쪽 호 길이의 비율 차이를 줄여서) 정확한 값을 위한 툴팁을 제공함으로써 이를 완화할 수 있습니다.


## 구조

- 막대(세그먼트): 중심에서 방사하는 직사각형 또는 호 모양의 마크로, 범주마다 하나씩. 길이(반지름)가 값을 인코딩합니다.
- 안쪽 반지름: 막대가 시작되는 반지름. 안쪽 반지름이 클수록 안쪽과 바깥쪽 호 길이 사이의 지각 왜곡이 줄어듭니다.
- 각도 조각: 원 둘레에 배열된, 범주마다 하나씩인 동일 너비의 각도 구획.
- 방사형 격자선: 값 척도(예: 0, 25, 50, 75, 100)를 표시하는 동심원.
- 범주 레이블: 둘레를 따라 또는 각 막대 끝에 배치된 텍스트.
- 색상 인코딩: 범주별로 구별되는 색상 또는 값을 인코딩하는 그러데이션으로 채워진 막대.

## 변형

- 방사형 누적 막대 차트: 각 막대가 하위 범주 구성을 보여주는 누적 세그먼트로 나뉩니다.
- 방사형 그룹 막대 차트: 각도 조각마다 여러 막대가 서로 다른 반지름에 배치되어 하위 그룹을 비교합니다.
- 방사형 진행률 차트: 하나의 막대가 원 둘레를 부분적으로 감싸며 목표를 향한 진행률을 보여줍니다(피트니스 트래커와 KPI 대시보드에서 흔함).
- 나이팅게일 로즈 차트: 막대 대신 쐐기 모양 영역을 사용하며, 길이가 아니라 면적이 값을 인코딩합니다.
- 방사형 롤리팝 차트: 완전한 막대 대신 점이 있는 얇은 선을 사용하여 원형 레이아웃의 잉크를 줄입니다.

## 코드 레퍼런스

```js
// D3 - radial bar chart
import * as d3 from "d3";

const angle = d3.scaleBand()
  .domain(data.map(d => d.category))
  .range([0, 2 * Math.PI])
  .padding(0.1);

const radius = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.value)])
  .range([innerRadius, outerRadius]);

const arc = d3.arc()
  .innerRadius(innerRadius)
  .outerRadius(d => radius(d.value))
  .startAngle(d => angle(d.category))
  .endAngle(d => angle(d.category) + angle.bandwidth())
  .padAngle(0.02)
  .padRadius(innerRadius);

const svg = d3.select("#chart").append("svg")
  .attr("viewBox", [-width / 2, -height / 2, width, height]);

svg.selectAll("path").data(data).join("path")
  .attr("d", arc)
  .attr("fill", (d, i) => d3.schemeTableau10[i % 10]);

// Concentric gridlines
svg.selectAll(".grid").data(radius.ticks(4)).join("circle")
  .attr("r", radius)
  .attr("fill", "none").attr("stroke", "#ddd");
```
