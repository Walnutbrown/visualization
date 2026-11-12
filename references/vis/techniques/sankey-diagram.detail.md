# 샌키 다이어그램 상세 (`sankey-diagram`)

## 설명

샌키 다이어그램은 너비가 각 흐름의 크기를 인코딩하는 링크를 사용해 노드(범주) 집합 사이의 흐름을 시각화합니다. 노드는 단계나 범주를 나타내는 열로 배열되고, 곡선이나 직선 형태의 띠가 노드를 연결하여 수량이 어떻게 분할되고, 합쳐지고, 한 노드에서 다른 노드로 전달되는지 보여줍니다. 노드로 들어오는 총 너비는 항상 나가는 총 너비와 같아서(흐름의 보존), 다이어그램은 자체적으로 일관되고 즉시 읽을 수 있습니다.

이 차트는 복잡한 시스템 내에서 지배적인 경로와 뜻밖의 이전을 드러내는 데 탁월합니다. 링크 너비가 수량에 비례하기 때문에, 독자는 정확한 숫자를 읽지 않고도 서로 다른 흐름의 상대적 크기를 빠르게 비교할 수 있습니다. 이 때문에 샌키 다이어그램은 에너지 예산, 물질 흐름, 예산 배분, 사용자 여정 분석에 특히 효과적입니다.

샌키 다이어그램은 두 차원의 정보를 동시에 인코딩합니다: 범주적 관계(어떤 노드가 연결되는지)와 정량적 크기(링크 너비)입니다. 색상은 일반적으로 범주를 구분하기 위해 링크나 노드에 적용되며, 노드의 수직 순서는 명료함을 위해 링크 교차를 최소화하도록 최적화될 수 있습니다.


## 구조

- 노드: 각 단계에서 범주를 나타내는 사각형(또는 둥근 블록)으로, 총 유입 또는 유출량에 비례하여 크기가 정해집니다
- 링크(띠): 소스 노드와 타깃 노드를 연결하는 곡선 경로로, 너비는 흐름 크기에 비례합니다
- 열(단계): 흐름의 순서를 정의하는 수직 정렬 그룹(예: 출발, 중간, 도착)
- 레이블: 각 범주를 식별하는 노드 위의 텍스트 주석으로, 때로는 수치 값과 함께 표시됩니다
- 색상 인코딩: 그룹을 구분하기 위해 링크(소스나 타깃 범주 기준)나 노드에 적용됩니다

## 변형

- 충적도: 각 단계의 노드가 시간에 따른 동일한 범주 변수를 나타내는 변형으로, 그룹 소속이 여러 구간에 걸쳐 어떻게 변하는지를 강조합니다
- 원형 샌키: 링크가 되돌아 곡선을 그리며, 순환적이거나 양방향인 흐름을 보여주는 데 유용합니다
- 수직 샌키: 흐름이 좌우가 아니라 위에서 아래로 진행됩니다
- 그라디언트 색상 링크: 링크가 소스에서 타깃 색조로 색상이 전이되어 개별 경로를 추적하는 데 도움을 줍니다

## 코드 레퍼런스

```js
// D3 Sankey using d3-sankey plugin
import {sankey, sankeyLinkHorizontal} from "d3-sankey";
import * as d3 from "d3";

const {nodes, links} = sankey()
  .nodeWidth(20)
  .nodePadding(10)
  .extent([[0, 0], [width, height]])({
    nodes: data.nodes.map(d => ({...d})),
    links: data.links.map(d => ({...d}))
  });

const svg = d3.select("#chart").append("svg").attr("viewBox", [0, 0, width, height]);

svg.append("g")
  .selectAll("rect")
  .data(nodes).join("rect")
  .attr("x", d => d.x0).attr("y", d => d.y0)
  .attr("width", d => d.x1 - d.x0).attr("height", d => d.y1 - d.y0)
  .attr("fill", d => d3.schemeTableau10[d.index % 10]);

svg.append("g")
  .selectAll("path")
  .data(links).join("path")
  .attr("d", sankeyLinkHorizontal())
  .attr("stroke-width", d => Math.max(1, d.width))
  .attr("stroke", d => d3.schemeTableau10[d.source.index % 10])
  .attr("fill", "none").attr("opacity", 0.5);
```
