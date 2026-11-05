# waterfall · 폭포 차트

시작 합계가 더하기·빼기를 거쳐 최종 합계가 되는 과정을 보여 준다. 손익계산서(매출 → 순이익), 기초·기말 잔액, 예산 차이, 인구 변화(출생 − 사망 + 이주)에 쓴다. 규칙은 `vis/techniques/waterfall-chart.md`.

```html
<figure data-illustrate="waterfall">
  <script type="application/json">{"title":"매출 100억 원 중 순이익은 18억 원","unit":"억 원","xLabel":"금액(억 원)","steps":[
    {"label":"매출","value":100,"total":true},
    {"label":"매출원가","value":-55},
    {"label":"매출총이익","total":true},
    {"label":"판매비와 관리비","value":-20},
    {"label":"영업외수익","value":3},
    {"label":"법인세","value":-10},
    {"label":"당기순이익","total":true,"value":18}]}</script>
  <div data-fallback><table>…각 단계와 누적값…</table></div>
  <figcaption>회색은 합계, 파랑은 증가, 빈 막대는 감소. 설명용 가상 데이터.</figcaption>
</figure>
```

- `steps` 순서가 계산 순서다. 첫 단계는 `total: true`와 `value`가 있는 시작값이다.
- 중간·끝 합계는 `total: true`만 쓰면 누적값을 자동으로 계산한다. `value`를 함께 쓰면 누적값과 같은지 검사하며, 다르면 오류다. 원자료의 소계를 옮길 때는 `value`를 넣어 검산한다.
- 증감 `value`는 부호 있는 수다. 비용·차감은 음수로 넣는다. 라벨에는 +/− 부호가 붙고, 증가는 채운 막대, 감소는 빈 막대로 색 없이도 구별된다.
- 가로 방향이라 긴 한국어 항목명이 줄바꿈된다. 단계가 15개를 넘으면 항목을 묶는다.
- 증감 사이에 누적 관계가 없으면 `chart` bar, 비율을 봐야 하면 누적 막대·파이(직접 SVG)를 쓴다.
- 선택 강조: 단계의 `key`(기본은 label)를 `focus` 버튼과 맞춘다.
