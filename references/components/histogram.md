# histogram · 히스토그램

연속 변수의 분포 모양(치우침, 봉우리, 이상치)을 보여 준다. 시험 점수, 수익률, 표본평균의 분포, 측정 오차 등에 쓴다. 규칙은 `vis/techniques/histogram.md`.

```html
<figure data-illustrate="histogram">
  <script type="application/json">{"title":"점수는 70점대에 가장 많이 몰려 있다","values":[45,52,58,61,63,64,67,68,70,71,72,72,74,75,76,78,79,80,81,83,85,86,88,90,92,95,100],"binWidth":10,"xLabel":"점수","yLabel":"학생 수","markers":[{"x":74.6,"label":"평균"}]}</script>
  <div data-fallback><table>…구간별 개수…</table></div>
  <figcaption>구간은 [40, 50)처럼 왼쪽 끝을 포함하고, 마지막 구간만 오른쪽 끝도 포함한다.</figcaption>
</figure>
```

- 원자료는 `values`와 `binWidth`(필수), 선택적 `start`(첫 구간 시작, 기본은 binWidth의 배수로 내림)로 넣는다. 이미 도수분포표가 있으면 `bins: [{from, to, count}]`를 쓴다. 구간은 너비가 같고 빈틈없이 이어져야 한다. 너비가 다르면 개수 대신 밀도를 표시하는 별도 SVG를 쓴다.
- 구간 너비가 모양을 바꾼다. 원자료의 구간이 있으면 그대로 쓰고, 직접 정했다면 캡션에 너비를 밝힌다.
- `markers: [{x, label}]`는 평균·중앙값·기준값 같은 참조선이다(장식보다 맥락). 값이 가까운 마커 여러 개는 겹치므로 하나만 쓰거나 본문에 적는다.
- 개수 축은 정수 눈금이다. 막대는 맞닿아 연속 변수임을 나타낸다. 범주 비교에는 `chart` bar를 쓴다.
- 관측치가 20개 미만이면 개별 점이 더 낫다(점 도표, 직접 SVG). 여러 집단 비교는 같은 `start`·`binWidth`로 나란히(`compare`) 두거나 박스 플롯을 고려한다.
