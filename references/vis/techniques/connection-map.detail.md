# 연결 지도 상세 (`connection-map`)

## 설명

연결 지도는 지리적 지점 사이에 선이나 호를 그려 위치 간에 관계, 경로, 또는 연결이 존재함을 보여줍니다. 선의 너비로 이동 규모를 강조하는 플로우 맵과 달리, 연결 지도는 네트워크의 위상 구조에 초점을 맞춥니다: 어떤 장소들이 연결되어 있는지, 각 장소가 몇 개의 연결을 갖는지, 연결성의 전체적인 공간 패턴이 어떤 모습인지를 보여줍니다. 대표적인 예로는 허브 공항에서 출발하는 모든 항공편을 보여주는 항공 노선 지도가 있습니다.

연결 지도는 네트워크 시각화와 지도 제작의 교차점에 위치합니다. 지리적 맥락을 활용해 추상적인 네트워크 구조에 의미를 부여합니다. 뉴욕과 런던 사이의 항공 노선은 지도에서 볼 때와 노드-링크 다이어그램의 추상적인 엣지로 볼 때 서로 다른 의미를 갖습니다. 지리적 근거는 시청자가 거리, 지역적 군집, 연결 패턴의 공간적 논리를 이해하는 데 도움을 줍니다.

가장 큰 과제는 시각적 혼잡입니다. 수백 개의 연결을 가진 허브는 사방으로 선을 방사하고, 여러 허브가 겹치면 개별 연결을 가려버리는 밀집한 망이 만들어집니다. 이를 해결하는 전략으로는 인터랙티브 필터링(선택한 하나의 노드에 대한 연결만 표시), 엣지 번들링(공유된 통로를 따라 선을 라우팅), 불투명도 조절, 점진적 공개(그 순간 가장 강하거나 가장 관련성 높은 연결만 표시)가 있습니다.


## 구조

- 기본 지도: 세계, 국가, 또는 지역 경계를 보여주는 지리적 참조 레이어.
- 노드: 지리적 위치(도시, 공항, 시설)의 지점으로, 흔히 연결 차수나 중요도에 따라 크기가 정해집니다.
- 연결선/호: 노드 쌍을 연결하는 선이나 곡선으로, 직선, 대권 호, 또는 번들 경로로 그려집니다.
- 노드 레이블: 도시나 위치 이름으로, 직접 표시되거나 호버 시 표시됩니다.
- 색상 인코딩: 유형(국내 대 국제), 클러스터, 또는 정량적 속성에 따라 선의 색이 정해집니다.
- 불투명도: 선의 겹침을 다루기 위해 적용되며, 겹침이 더 밀집한 영역은 자연스럽게 더 어둡게 보여 강도를 전달합니다.

## 변형

- 대권 연결 지도: 호가 구면 위의 최단 경로를 따라가며, 곡선이 실제 지리적 관계를 드러냅니다.
- 허브 앤 스포크 지도: 항공 노선 표시처럼 하나 이상의 중앙 허브에서 연결이 방사됩니다.
- 엣지 번들 연결 지도: 선이 공유된 통로를 따라 라우팅되어 집계 패턴을 드러내고 혼잡을 줄입니다.
- 필터링된 연결 지도: 선택된 노드에 대한 연결이나 임계값을 충족하는 연결만 표시되어 밀집한 네트워크를 탐색 가능하게 만듭니다.
- 애니메이션 연결 지도: 연결이 순차적으로 나타나거나 맥동하여 네트워크의 시간적 변화를 보여줍니다.

## 코드 레퍼런스

```js
// D3 connection map with great-circle arcs
import * as d3 from "d3";

const projection = d3.geoNaturalEarth1().fitSize([width, height], world);
const path = d3.geoPath(projection);

const svg = d3.select("#chart").append("svg")
  .attr("viewBox", [0, 0, width, height]);

// Base map
svg.append("path").datum(world).attr("d", path)
  .attr("fill", "#f7f7f7").attr("stroke", "#ddd");

// Great-circle arcs
svg.selectAll(".connection").data(connections).join("path")
  .attr("d", d => path({
    type: "LineString",
    coordinates: [[d.lon1, d.lat1], [d.lon2, d.lat2]]
  }))
  .attr("fill", "none")
  .attr("stroke", "#6366f1")
  .attr("stroke-opacity", 0.3)
  .attr("stroke-width", 1);

// Nodes
svg.selectAll("circle").data(cities).join("circle")
  .attr("cx", d => projection([d.lon, d.lat])[0])
  .attr("cy", d => projection([d.lon, d.lat])[1])
  .attr("r", d => Math.sqrt(d.connections) * 2)
  .attr("fill", "#f59e0b");
```
