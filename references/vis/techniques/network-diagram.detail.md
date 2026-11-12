# 네트워크 다이어그램 상세 (`network-diagram`)

## 설명

네트워크 다이어그램(흔히 포스 디렉티드 그래프로 구현됨)은 개체를 노드(점이나 원)로, 개체 간의 관계를 링크(선이나 곡선)로 표현하여 관계형 데이터를 나타냅니다. 공간적 배치는 보통 물리 시뮬레이션으로 계산됩니다: 노드는 하전 입자처럼 서로를 밀어내고, 링크는 연결된 노드를 서로 끌어당기는 스프링처럼 작동합니다. 시뮬레이션은 밀집하게 연결된 클러스터가 자연스럽게 뭉치고, 성기게 연결된 노드는 주변부로 밀려나는 평형 상태에 도달합니다.

그 결과로 나온 레이아웃은 네트워크의 위상 구조를 드러냅니다: 커뮤니티는 클러스터로 나타나고, 브리지 노드는 클러스터 사이에 자리 잡으며, 허브 노드는 중심 근처에 많은 연결을 축적하고, 고립된 노드는 가장자리에 떠 있습니다. 크기, 색상, 레이블 같은 노드 속성은 추가적인 데이터 차원(예: 연결 중심성, 카테고리, 중요도)을 인코딩하며, 두께, 색상, 스타일 같은 링크 속성은 관계의 강도, 유형, 방향성을 인코딩할 수 있습니다.

포스 디렉티드 레이아웃은 중간 규모의 네트워크(수십 개에서 수천 개 초반의 노드)에서 잘 작동합니다. 그 규모를 넘어서면 시각적 밀도가 압도적으로 커지고 시뮬레이션의 계산 비용도 커집니다. 매우 큰 네트워크의 경우 계층적 집계, 인접 행렬, 필터링된 서브그래프 뷰 같은 대안적 전략이 필요해집니다. 인터랙션(확대/축소, 팬, 이웃을 강조하는 호버, 확장이나 필터링을 위한 클릭)은 네트워크 다이어그램이 단순한 삽화 이상으로 유용해지는 데 필수적입니다.


## 구조

- 노드: 개체를 나타내는 원(또는 다른 형태). 크기가 연결 차수나 다른 지표를 인코딩하는 경우가 많습니다
- 링크(엣지): 노드를 연결하여 관계를 나타내는 선. 방향성(화살표)이 있을 수도, 없을 수도 있습니다
- 노드 레이블: 각 개체를 식별하는 텍스트로, 직접 표시되거나 호버 시 표시됩니다
- 노드 색상: 범주형 그룹(커뮤니티, 유형)이나 정량적 속성을 인코딩합니다
- 링크 가중치/두께: 관계의 강도나 빈도를 인코딩합니다
- 포스 시뮬레이션: 위치를 계산하는 알고리즘. 매개변수로는 전하 강도, 링크 거리, 충돌 반경이 있습니다

## 변형

- 포스 디렉티드 레이아웃: 표준적인 물리 기반 접근법으로, 소규모에서 중간 규모 네트워크에 적합한 범용 레이아웃입니다
- 계층형/레이어드 레이아웃(스기야마, Sugiyama): 방향성 비순환 그래프(DAG)를 위해 노드를 레이어로 배치하여 흐름 방향을 강조합니다
- 원형 레이아웃: 노드가 원 위에 배치되고 링크가 내부를 가로지릅니다. 커뮤니티 구조를 보여주는 데 적합합니다
- 아크 다이어그램: 노드가 선 위에 배치되고 링크는 반원형 아크로 표현됩니다. 컴팩트하지만 더 작은 네트워크로 제한됩니다
- 인접 행렬: (i,j) 위치의 격자 셀이 노드 i와 j가 연결되어 있으면 채워지는 대안적 표현. 밀집 네트워크에서는 노드-링크보다 확장성이 더 좋습니다
- 에고 네트워크: 하나의 노드와 그 직접적인 이웃만 보여주고 나머지는 걸러내는 집중형 뷰

## 코드 레퍼런스

```js
// D3 force-directed graph
import * as d3 from "d3";

const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links).id(d => d.id).distance(50))
  .force("charge", d3.forceManyBody().strength(-100))
  .force("center", d3.forceCenter(width / 2, height / 2));

const svg = d3.select("#chart").append("svg").attr("viewBox", [0, 0, width, height]);

const link = svg.append("g").selectAll("line").data(links).join("line")
  .attr("stroke", "#999").attr("stroke-opacity", 0.6)
  .attr("stroke-width", d => Math.sqrt(d.value));

const node = svg.append("g").selectAll("circle").data(nodes).join("circle")
  .attr("r", d => Math.sqrt(d.degree) * 3)
  .attr("fill", d => d3.schemeTableau10[d.group])
  .call(d3.drag()
    .on("start", (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
    .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
    .on("end", (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

simulation.on("tick", () => {
  link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
  node.attr("cx", d => d.x).attr("cy", d => d.y);
});
```
