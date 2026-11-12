# 레이더 차트 상세 (`radar-chart`)

## 설명

레이더 차트(스파이더 차트 또는 웹 차트라고도 함)는 중심점에서 방사형으로 뻗은 등각 축들 위에 다변량 데이터를 표시합니다. 각 축은 서로 다른 변수를 나타내며, 데이터 값은 그 크기에 비례하는 중심으로부터의 거리에 따라 각 축 위에 표시됩니다. 표시된 점들은 연결되어 닫힌 다각형을 형성하며, 그 형태가 데이터 개체의 전반적인 "프로필"을 드러냅니다. 여러 개체를 반투명 다각형으로 겹쳐 비교할 수도 있습니다.

레이더 차트는 여러 차원에 걸친 개체의 전반적인 프로필이나 균형을 비교하는 것이 목표일 때 가장 효과적입니다. "이 선수는 다재다능한가, 특화되어 있는가?"나 "제품 A의 기능 구성이 제품 B와 어떻게 비교되는가?" 같은 질문에 답합니다. 감싸인 다각형의 면적은 전반적인 크기에 대한 직관적인 감각을 주고, 형태는 강점과 약점을 드러냅니다.

그러나 레이더 차트에는 상당한 지각적 한계가 있습니다. 다각형의 면적은 축의 순서에 좌우되는데, 이 순서는 임의적입니다. 축을 재배열하면 같은 데이터라도 다른 형태와 면적이 나옵니다. 각도와 방사 거리에 대한 인간의 지각은 정렬된 위치에 대한 지각보다 정확도가 떨어져, 정밀한 비교를 어렵게 만듭니다. 이런 이유로 레이더 차트는 정밀한 정량 분석보다는 프로필의 빠른 정성적 비교에 가장 잘 어울리며, 소수의 개체(2~4개)와 적당한 수의 축(5~10개)에서 잘 작동합니다.


## 구조

- 축(스포크): 중심에서 뻗어나가는 선으로, 각각 하나의 변수를 나타냅니다
- 그리드선(웹): 각 축을 따라 스케일 간격을 표시하는 동심 다각형 또는 원
- 데이터 다각형: 한 개체의 모든 축에 걸친 표시 값을 연결하는 닫힌 도형
- 채우기 영역: 다각형 형태를 더 잘 보이게 하기 위한 다각형 내부의 반투명 채우기
- 중심점: 원점(보통 0 또는 최솟값)
- 축 레이블: 각 스포크 바깥쪽 끝의 변수 이름
- 범례: 여러 다각형이 겹쳐 있을 때 어떤 다각형이 어떤 개체에 속하는지 식별합니다

## 변형

- 채워진 레이더: 다각형이 반투명 색으로 채워져 면적을 강조하고 겹침을 눈에 띄게 합니다
- 데이터 포인트가 있는 레이더: 각 축 값에 점이 배치되어 개별 수치를 더 쉽게 식별할 수 있습니다
- 스몰 멀티플 레이더: 다각형을 겹치는 대신, 각 개체가 그리드 안에 자신만의 작은 레이더 차트를 가져 겹침으로 인한 혼잡을 피합니다
- 극좌표 영역 차트(나이팅게일 로즈): 유사한 방사형 레이아웃이지만 점의 거리 대신 쐐기 면적을 사용하는, 관련되어 있지만 별개인 차트
- 최소-최대 밴드가 있는 레이더: 음영 밴드가 그룹 전체의 범위(최소~최대)를 보여주고, 평균을 나타내는 선이 함께 표시됩니다

## 코드 레퍼런스

```js
// D3 radar chart (simplified)
import * as d3 from "d3";

const axes = ["Speed", "Power", "Defense", "Stamina", "Skill", "Agility"];
const angleSlice = (2 * Math.PI) / axes.length;
const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

const line = d3.lineRadial()
  .radius(d => rScale(d.value))
  .angle((d, i) => i * angleSlice)
  .curve(d3.curveLinearClosed);

const svg = d3.select("#chart").append("svg")
  .attr("viewBox", [-width/2, -height/2, width, height]);

// Draw gridlines
[20, 40, 60, 80, 100].forEach(level => {
  svg.append("polygon")
    .attr("points", axes.map((_, i) => {
      const r = rScale(level);
      return [r * Math.cos(i * angleSlice - Math.PI/2),
              r * Math.sin(i * angleSlice - Math.PI/2)].join(",");
    }).join(" "))
    .attr("fill", "none").attr("stroke", "#ccc");
});

// Draw data polygon
svg.append("path").datum(playerStats)
  .attr("d", line).attr("fill", "steelblue").attr("fill-opacity", 0.3)
  .attr("stroke", "steelblue").attr("stroke-width", 2);
```
