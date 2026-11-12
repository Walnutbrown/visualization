# 포스 디렉티드 그래프 상세 (`force-directed-graph`)

## 설명

포스 디렉티드 그래프는 네트워크 데이터를 위한 특정 레이아웃 알고리즘으로, 노드를 서로 밀어내는 하전 입자처럼 취급하는 동시에 엣지는 연결된 노드를 끌어당기는 스프링처럼 작동합니다. 물리 시뮬레이션은 시스템이 평형 상태에 도달할 때까지 반복되며, 그 결과 밀접하게 연결된 클러스터는 공간상에서 자연스럽게 뭉치고, 느슨하게 연결되거나 고립된 노드는 바깥으로 밀려나는 레이아웃이 만들어집니다. 이 기법은 Eades(1984)에 의해 대중화되었고, Fruchterman과 Reingold(1991), Kamada와 Kawai(1989)에 의해 더욱 정교해졌습니다.

포스 디렉티드 레이아웃의 핵심 장점은 수동으로 위치를 지정할 필요가 없다는 것입니다. 알고리즘이 구조를 자동으로 발견합니다. 커뮤니티는 공간적 클러스터로 드러나고, 브리지는 그룹 사이에 늘어난 노드로 나타나며, 연결이 많은 허브 노드는 중심으로 이동합니다. 레이아웃이 미리 정해지는 것이 아니라 자연스럽게 나타나기 때문에, 네트워크 위상을 이해하기 위한 진정한 발견 도구가 됩니다.

하지만 포스 디렉티드 레이아웃은 비결정적이며(실행할 때마다 다른 레이아웃이 나옴), 큰 네트워크에서는 계산 비용이 큽니다(단순한 구현에서는 반복당 O(n^2)이지만, Barnes-Hut 근사로 이를 줄일 수 있음), 엣지 밀도가 높을 때 "헤어볼(hairball)" 문제가 생기기 쉽습니다. 인터랙션은 필수적입니다: 사용자가 노드를 드래그하고, 클러스터를 확대하고, 호버로 세부 정보를 확인하고, 속성으로 필터링해야 중간 규모 네트워크를 파악할 수 있습니다.


## 구조

- 노드: 개체를 나타내는 원; 크기는 차수, 중심성, 또는 다른 지표를 인코딩할 수 있고, 색상은 범주나 커뮤니티를 인코딩합니다.
- 엣지(링크): 관련된 노드를 잇는 선; 두께는 가중치나 빈도를 인코딩할 수 있으며, 방향성(화살표 포함) 또는 무방향일 수 있습니다.
- 힘 시뮬레이션: 전하 반발력, 스프링 인력, 중심화 힘, 선택적 충돌 감지를 통해 위치를 계산하는 알고리즘.
- 레이블: 작은 네트워크에서는 직접 표시되는 노드 이름, 큰 네트워크에서는 호버 시 표시됩니다.
- 노드 드래그: 인터랙티브한 재배치; 드래그된 노드는 고정되어 레이아웃의 일부를 고정시킵니다.
- 클러스터: 밀접하게 연결된 노드들의 자연스럽게 나타나는 공간적 그룹.

## 변형

- Fruchterman-Reingold: 인력과 반발력을 균형 잡는 고전적인 스프링-임베더 알고리즘.
- ForceAtlas2: Gephi에서 나온 연속형 레이아웃 알고리즘으로, 확장성과 매끄러운 수렴을 위해 설계되었습니다.
- 제약된 포스 레이아웃: 노드가 부분적으로 고정되고(예: 한 축에서 타임라인에 고정), 시뮬레이션은 다른 축에서만 작동합니다.
- 3D 포스 레이아웃: 시뮬레이션을 3차원으로 확장하여 회전 컨트롤이나 VR로 봅니다.
- 클러스터형 포스 레이아웃: 그룹을 먼저 배치한 다음 그룹 내부에 노드를 배치하는 다단계 시뮬레이션.
- 방사형 포스 레이아웃: 노드가 초점 노드로부터의 거리에 따라 동심원에 제약됩니다.

## 코드 레퍼런스

```js
// D3 force-directed graph
import * as d3 from "d3";

const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links).id(d => d.id).distance(60))
  .force("charge", d3.forceManyBody().strength(-120))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collide", d3.forceCollide(12));

const svg = d3.select("#chart").append("svg")
  .attr("viewBox", [0, 0, width, height]);

const link = svg.append("g").selectAll("line")
  .data(links).join("line")
  .attr("stroke", "#ccc").attr("stroke-width", d => Math.sqrt(d.weight));

const node = svg.append("g").selectAll("circle")
  .data(nodes).join("circle")
  .attr("r", d => Math.sqrt(d.degree) * 3)
  .attr("fill", d => d3.schemeTableau10[d.group])
  .call(d3.drag()
    .on("start", dragStarted)
    .on("drag", dragged)
    .on("end", dragEnded));

simulation.on("tick", () => {
  link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
  node.attr("cx", d => d.x).attr("cy", d => d.y);
});
```
