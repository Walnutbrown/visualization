# 플로우 맵 상세 (`flow-map`)

## 설명

플로우 맵은 지리적 배경 지도 위에 방향성 있는 링크를 겹쳐 지역 간 사람, 상품, 정보, 기타 수량의 이동을 보여줍니다. 각 흐름은 출발지에서 도착지를 잇는 선이나 곡선 화살표로 그려지며, 선의 너비는 흐름의 크기에 비례합니다. 그 결과 지리적 맥락, 이동 방향, 각 전이의 상대적 규모를 동시에 전달하는 시각화가 만들어집니다.

가장 오래되고 유명한 플로우 맵은 샤를 조제프 미나르(Charles Joseph Minard)가 1869년에 나폴레옹의 러시아 원정을 묘사한 작품으로, 역대 가장 뛰어난 통계 그래픽 중 하나로 널리 평가받습니다. 현대의 플로우 맵은 이 전통을 계승하되 실제 흐름 데이터셋의 복잡성을 다루기 위해 인터랙티브성, 애니메이션, 데이터 기반 레이아웃을 더합니다. 엣지 번들링과 곡선 최적화 알고리즘은 많은 흐름이 교차하거나 겹칠 때 시각적 혼잡을 줄이는 데 도움을 줍니다.

플로우 맵은 지리적 정확성과 시각적 명료성 사이의 근본적인 긴장을 안고 있습니다. 먼 지점 사이의 직선은 종종 무관한 영역을 가로지르고, 번들링되거나 곡선화된 흐름은 실제 이동 경로를 왜곡해서 나타낼 수 있습니다. 흐름 개수가 수십 개를 넘어설 때는 정확성과 가독성의 균형을 맞추기 위해 불투명도, 애니메이션, 호버 필터링, 계층적 집계를 활용한 신중한 설계가 필요합니다.


## 구조

- 배경 지도: 경계, 해안선, 지형을 보여주는 지리적 기준.
- 흐름 선/화살표: 출발지와 도착지를 잇는 선으로, 너비가 흐름 크기에 비례합니다. 직선, 곡선(대권 경로), 번들형일 수 있습니다.
- 화살촉 또는 애니메이션: 이동 방향을 나타냅니다. 경로를 따라 흐르는 애니메이션 입자는 정적인 화살표의 효과적인 대안입니다.
- 너비 인코딩: 이동되는 양에 맞춰 스케일된 선 너비.
- 색상 인코딩: 흐름 카테고리(예: 상품 유형)나 방향(유입 대 유출)을 나타낼 수 있습니다.
- 출발지/도착지 마커: 끝점의 점이나 기호로, 때로는 총 유입량이나 유출량에 따라 크기가 조정됩니다.

## 변형

- 미나르 스타일 플로우 맵: 나폴레옹 진군 시각화처럼 경로를 따라 물량이 줄어들수록 선이 좁아지는 고전적인 손그림 스타일.
- 엣지 번들링 플로우 맵: 힘-지향 엣지 번들링이나 경로에 대한 커널 밀도 추정을 사용해 흐름을 공유 회랑으로 경유시켜 혼잡을 줄입니다.
- 애니메이션 플로우 맵: 입자나 펄스가 출발지에서 도착지까지 경로를 따라 이동하며 방향성을 보여주고 지도에 생동감을 더합니다.
- OD(출발지-도착지) 행렬 + 지도: 흐름의 스몰 멀티플 행렬을 지리적 지도와 결합하여 표 형태의 정밀함과 공간적 맥락을 모두 제공합니다.
- 디자이어 라인: 라우팅이나 번들링 없이 출발지에서 도착지까지 그대로 그린 직선으로, 지역 간 원초적 수요를 보여줍니다.

## 코드 레퍼런스

```js
// D3 flow map with curved great-circle paths
import * as d3 from "d3";

const projection = d3.geoMercator().fitSize([width, height], geoJson);
const path = d3.geoPath(projection);

const svg = d3.select("#chart").append("svg")
  .attr("viewBox", [0, 0, width, height]);

// Draw base map
svg.append("path").datum(geoJson).attr("d", path)
  .attr("fill", "#f0f0f0").attr("stroke", "#ccc");

// Draw flows as great-circle arcs
svg.selectAll(".flow").data(flows).join("path")
  .attr("d", d => {
    const source = projection([d.sourceLon, d.sourceLat]);
    const target = projection([d.targetLon, d.targetLat]);
    const dx = target[0] - source[0], dy = target[1] - source[1];
    const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
    return `M${source}A${dr},${dr} 0 0,1 ${target}`;
  })
  .attr("fill", "none")
  .attr("stroke", "#6366f1")
  .attr("stroke-width", d => Math.sqrt(d.value))
  .attr("opacity", 0.6);
```
