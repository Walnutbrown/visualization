# 재생 / 스크럽 상세 (`playback-scrub`)

## 설명

재생/스크럽은 시각화를 시간 또는 순서 차원에 따라 애니메이션하기 위해 재생, 일시 정지, 앞으로 이동, 뒤로 이동, 스크러빙 슬라이더 등 미디어 플레이어 스타일의 컨트롤을 제공하는 인터랙션 패턴입니다. 재생 버튼을 누르면 차트가 프레임 단위로 업데이트되어 데이터가 시간에 따라 어떻게 변하는지 보여줍니다: 막대가 늘어나거나 줄어들고, 점이 산점도를 가로질러 이동하며, 지도의 지역이 색을 바꾸고, 추세선이 뻗어나갑니다. 스크럽 슬라이더를 사용하면 사용자가 시퀀스의 어느 지점으로든 드래그하여 데이터의 시간적 전개 중 원하는 순간에 임의로 접근할 수 있습니다.

가장 유명한 예는 한스 로슬링(Hans Rosling)의 갭마인더(Gapminder) 시각화(2006년 TED 강연으로 널리 알려짐)로, 재생 버튼을 누르면 국가별 버블이 건강 대 부의 산점도 위에서 1800년부터 현재까지 애니메이션됩니다. 이 애니메이션은 정적인 스냅샷에서는 보이지 않는 궤적, 수렴, 발산을 드러냅니다. 이 패턴은 이후 Flourish, Datawrapper, 구글의 Public Data Explorer 같은 도구의 표준 기능이 되었습니다.

재생이 효과적인 이유는 인간의 지각이 움직임을 감지하도록 정교하게 조율되어 있기 때문입니다. 움직임은 주의를 끌고, 어떤 정적 비교보다도 더 생생하게 변화를 전달합니다. 그러나 애니메이션에는 인지적 비용도 있습니다: 사용자는 이전 프레임이 어땠는지 기억해야 무엇이 바뀌었는지 알아챌 수 있고, 여러 항목이 동시에 움직이면 정보 과부하가 될 수 있습니다. 그래서 스크럽 슬라이더가 필수적입니다: 이를 통해 사용자는 일시 정지하고, 되감고, 특정 프레임을 비교할 수 있어 애니메이션이 수동적인 시청 경험에서 인터랙티브한 탐색 도구로 바뀝니다.


## 작동 방식

- 인터페이스가 재생 컨트롤을 제공합니다: 재생/일시정지 버튼, 타임라인 슬라이더(스크러버), 그리고 선택적으로 앞으로/뒤로 이동 버튼입니다.
- 재생을 누르면 타이머가 시작됩니다(setInterval 또는 requestAnimationFrame을 통해). 이 타이머는 정해진 프레임 속도로 현재 시간 단계를 진행시킵니다.
- 각 시간 단계마다 시각화가 업데이트됩니다: 마크가 현재 시간 값에 해당하는 새로운 위치, 크기, 색상으로 전환됩니다.
- 스크럽 슬라이더가 현재 위치를 추적합니다: 슬라이더 핸들이 애니메이션과 동기화되어 움직이며 시간 범위 내 진행 상황을 보여줍니다.
- 사용자는 언제든 슬라이더를 드래그하여 특정 시간 단계로 바로 이동할 수 있으며, 이때 자동 재생은 일시 정지됩니다.
- 속도 컨트롤(0.5배속, 1배속, 2배속)이 제공되어 애니메이션 속도를 조정할 수 있습니다.
- 시간 범위가 끝나면 재생이 멈추거나 처음으로 되돌아가 반복됩니다.

## 변형

- 연속 재생: 시간 매개변수가 데이터 포인트 사이에서 부드럽게 보간되어 유동적인 움직임을 만듭니다.
- 이산 단계 재생: 애니메이션이 명확한 시간 단계(예: 연도 단위) 사이를 점프하며, 각 단계 사이에 전환 효과가 있습니다.
- 누적 재생: 각 단계에서 데이터를 교체하는 대신 새 데이터가 추가됩니다(예: 시간이 지날수록 늘어나는 선 차트).
- 궤적 재생: 움직이는 마크가 점점 옅어지는 궤적을 남겨 개별 항목의 최근 경로를 추적하는 데 도움을 줍니다.
- 내레이션이 있는 재생: 각 시간 단계마다 무슨 일이 일어나는지 설명하는 텍스트 주석이 나타나, 재생과 스크롤리텔링을 결합합니다.
- 양방향 스크럽: 사용자가 앞으로만이 아니라 자유롭게 앞뒤로 스크럽할 수 있습니다.
- 슬로우모션 구간이 있는 다중 속도: 특정 시간대는 중요한 사건을 강조하기 위해 자동으로 느려집니다.

## 코드 레퍼런스

```js
// Playback/scrub for an animated scatterplot (Gapminder style)
const years = d3.range(1960, 2024);
let yearIndex = 0, playing = false, timer;

d3.select("#play-btn").on("click", () => {
  playing = !playing;
  d3.select("#play-btn").text(playing ? "Pause" : "Play");
  if (playing) {
    timer = d3.interval(() => {
      yearIndex = (yearIndex + 1) % years.length;
      updateToYear(years[yearIndex]);
      d3.select("#scrubber").property("value", yearIndex);
    }, 200);
  } else {
    timer.stop();
  }
});

d3.select("#scrubber")
  .attr("type", "range").attr("min", 0).attr("max", years.length - 1)
  .on("input", function () {
    yearIndex = +this.value;
    updateToYear(years[yearIndex]);
  });

function updateToYear(year) {
  const yearData = data.filter(d => d.year === year);
  svg.selectAll("circle")
    .data(yearData, d => d.country)
    .transition().duration(150)
    .attr("cx", d => x(d.income))
    .attr("cy", d => y(d.health))
    .attr("r", d => r(d.population));
  d3.select("#year-label").text(year);
}
```
