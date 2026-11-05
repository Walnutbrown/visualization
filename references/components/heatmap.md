# heatmap · 히트맵·행렬

행 × 열 값의 패턴을 색으로 보여 준다. 상관 행렬, 혼동 행렬, 교차표, 인접 행렬(그래프), 행렬 연산의 원소, 요일 × 시간 패턴에 쓴다. 규칙은 `vis/techniques/heatmap.md`, `correlation-matrix.md`, `adjacency-matrix.md`.

```html
<figure data-illustrate="heatmap">
  <script type="application/json">{"title":"주식과 부동산의 상관이 가장 높다","scale":"diverging","domain":[-1,1],"rowLabel":"자산","columnLabel":"자산",
    "rows":["주식","채권","금"],"columns":["주식","채권","금"],
    "values":[[1,-0.3,0.1],[-0.3,1,null],[0.1,null,1]]}</script>
  <div data-fallback><table>…같은 행렬…</table></div>
  <figcaption>파랑은 양의 상관, 주황은 음의 상관. 빈칸(–)은 자료 없음.</figcaption>
</figure>
```

- `rows`, `columns`는 문자열 배열, `values`는 행 수 × 열 수 2차원 배열이다. 결측은 `null`로 넣으면 점선 빈칸과 "–"로 표시된다. 0으로 채우지 않는다.
- `scale`: `sequential`(기본, 4단계 파랑)은 크기, `diverging`(5단계 주황–회색–파랑)은 기준값 `midpoint`(기본 0)에서의 편차다. 상관계수는 `diverging` + `domain: [-1, 1]`.
- `domain`을 생략하면 데이터 최솟값~최댓값이다. 나란히 비교하는 히트맵은 같은 `domain`을 지정한다.
- 색은 4~5단계 구간색이고 범례 눈금에 경계값이 표시된다. 셀 값 숫자는 144칸 이하에서 기본 표시(`showValues`로 조정)하므로 색만으로 값을 읽게 하지 않는다.
- 열이 많아 셀이 44px보다 좁아지면 그림 영역만 가로 스크롤된다. 2 × 2처럼 칸이 아주 적으면 표나 막대가 낫다.
- 선택 강조: 각 행이 `data-key = 행 이름`이다. `focus` 버튼으로 한 행을 강조할 수 있다.
