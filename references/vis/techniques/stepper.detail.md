# 스테퍼 (단계 탐색) 상세 (`stepper`)

## 설명

스테퍼는 시각화 상태 시퀀스를 이산적으로 앞뒤로 탐색할 수 있게 합니다. 스크롤로 촉발되는 전환(스크롤리텔링)이나 연속적인 애니메이션(재생) 대신, 사용자가 명시적으로 "다음"과 "이전" 버튼을 클릭하거나(또는 화살표 키를 눌러) 한 번에 한 단계씩 진행합니다. 각 단계는 시각화의 뚜렷한 상태를 보여줍니다: 새로운 데이터 부분집합, 바뀐 주석, 다른 하이라이트, 또는 변형된 뷰입니다.

스테퍼는 가장 단순한 저자 주도형 내비게이션 패턴입니다. 저자에게는 독자가 마주하는 상태의 시퀀스에 대한 완전한 통제권을, 독자에게는 속도 조절에 대한 완전한 통제권을 부여합니다. 준비가 되었을 때만 진행합니다. 이 조합 덕분에 스테퍼는 교육 콘텐츠, 가이드형 분석 안내, 웹 페이지에 삽입된 프레젠테이션 슬라이드에 이상적입니다. 사용자가 올바른 전환을 촉발하기 위해 스크롤 속도를 조절할 필요가 없기 때문에 스크롤리텔링보다 인지 부하가 낮습니다; 버튼 클릭 하나가 정확히 하나의 상태 변화를 만들어냅니다.

번호가 매겨진 단계 표시기(흔히 점이나 진행 표시줄로 표시됨)는 방향 감각을 제공합니다. 사용자는 자신이 7단계 중 3단계에 있음을 알고 남은 콘텐츠의 양을 가늠할 수 있습니다. 일부 스테퍼는 특정 단계 번호를 클릭해 직접 이동할 수 있게 하여, 선형 진행과 임의 접근을 결합합니다. 키보드 지원(좌/우 화살표)은 구현이 쉽고 접근성에 중요합니다.


## 작동 방식

- 시각화에는 내비게이션 컨트롤이 함께 제공됩니다: "이전"과 "다음" 버튼, 그리고 선택적으로 번호가 매겨진 단계 표시기(점, 숫자, 또는 진행 표시줄)입니다.
- 각 단계는 미리 정의된 시각화 상태에 대응합니다: 특정 데이터 필터, 주석 세트, 하이라이트 패턴, 또는 차트 구성입니다.
- "다음"을 클릭하면 현재 상태에서 다음 상태로의 전환이 트리거됩니다. 애니메이션 전환이 무엇이 바뀌었는지 보여줍니다.
- "이전"을 클릭하면 전환이 반대로 진행되어 이전 상태로 돌아갑니다.
- 단계 표시기가 갱신되어 시퀀스 내 현재 위치를 보여줍니다.
- 선택적으로, 설명 텍스트가 시각화와 함께 갱신되어 현재 단계가 무엇을 보여주는지, 왜 중요한지를 설명합니다.
- 키보드 화살표 키도 접근성과 프레젠테이션 모드를 위해 내비게이션을 구동할 수 있습니다.

## 변형

- 버튼 스테퍼: 차트 아래나 옆에 있는 단순한 "이전 / 다음" 버튼입니다. 가장 기본적인 형태입니다.
- 도트 스테퍼: 슬라이드쇼 표시기처럼 각 점이 하나의 단계를 나타내고 현재 점이 하이라이트되는 한 줄의 점들입니다. 점을 클릭하면 해당 단계로 이동합니다.
- 번호 스테퍼: 단계에 제목과 함께 번호(1, 2, 3, ...)가 매겨져, 사용자가 탐색하기 전에 전체 구조를 이해할 수 있게 합니다.
- 진행 표시줄 스테퍼: 사용자가 진행함에 따라 수평 막대가 채워져 연속적인 진행 감각을 제공합니다.
- 키보드 구동 스테퍼: 눈에 보이는 버튼 없이 화살표 키로 단계를 구동합니다. 프레젠테이션 모드에서 사용됩니다.
- 분기 스테퍼: 특정 단계에서 사용자가 두 경로 중 하나를 선택할 수 있어(예: "지역별 보기" 또는 "시간별 보기"), 비선형적 내러티브를 만듭니다.
- 자동 진행 스테퍼: 슬라이드쇼처럼 타이머에 따라 단계가 자동으로 진행되지만, 사용자가 일시 정지하고 수동으로 제어할 수 있습니다.

## 코드 레퍼런스

```js
// Stepper with forward/back navigation and step indicators
const steps = [
  { filter: null, annotation: "Overview of all data" },
  { filter: d => d.region === "Asia", annotation: "Focus: Asia" },
  { filter: d => d.region === "Europe", annotation: "Focus: Europe" },
  { filter: d => d.year >= 2020, annotation: "Recent data (2020+)" },
];
let currentStep = 0;

function goToStep(i) {
  currentStep = Math.max(0, Math.min(i, steps.length - 1));
  const step = steps[currentStep];
  const filtered = step.filter ? data.filter(step.filter) : data;
  updateChart(filtered);
  d3.select("#annotation").text(step.annotation);
  d3.selectAll(".step-dot")
    .classed("active", (_, j) => j === currentStep);
  d3.select("#prev-btn").attr("disabled", currentStep === 0 ? true : null);
  d3.select("#next-btn")
    .attr("disabled", currentStep === steps.length - 1 ? true : null);
}

d3.select("#next-btn").on("click", () => goToStep(currentStep + 1));
d3.select("#prev-btn").on("click", () => goToStep(currentStep - 1));
d3.select("body").on("keydown", (event) => {
  if (event.key === "ArrowRight") goToStep(currentStep + 1);
  if (event.key === "ArrowLeft") goToStep(currentStep - 1);
});
```
