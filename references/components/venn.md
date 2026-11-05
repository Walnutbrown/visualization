# venn · 벤 다이어그램

2~3개 집합의 겹침과 고유 영역을 보여 준다. SQL JOIN, 확률의 사건(합·교·여사건), 집합 연산, 개념 범주의 포함 관계에 쓴다. 규칙은 `vis/techniques/venn-diagram.md`.

```html
<figure data-illustrate="venn">
  <script type="application/json">{"title":"LEFT JOIN은 고객 테이블 전체를 남긴다","sets":[{"id":"A","label":"고객 테이블"},{"id":"B","label":"주문 테이블"}],
    "regions":[{"sets":["A"],"text":"주문 없는 고객","highlight":true},{"sets":["A","B"],"text":"주문 있는 고객","highlight":true},{"sets":["B"],"text":"고객 없는 주문"}]}</script>
  <div data-fallback>LEFT JOIN 결과 = 고객에만 있는 행 + 양쪽에 있는 행.</div>
</figure>
```

- `sets`는 2개 또는 3개다. 4개 이상은 행렬(`heatmap`)이나 막대로 바꾼다.
- `regions`의 `sets`는 그 영역이 **정확히** 속한 집합이다. `["A"]`는 A에만, `["A","B"]`는 A와 B에만(3개일 때 C 제외) 속한다. `text`는 영역 안에 적을 짧은 구(개수, 의미)이고, `highlight: true`면 파랑으로 칠하고 글자를 굵게 한다.
- `universe`(전체집합 이름)를 주면 바깥 사각형이 생기고 `sets: []`로 어느 집합에도 속하지 않는 영역(여사건)을 지정할 수 있다.
- 원의 크기와 겹침 면적은 개수에 비례하지 않는다. 개수 비교가 핵심이면 `text`에 수를 쓰고 막대를 함께 둔다.
- JOIN 종류처럼 여러 경우를 비교할 때는 같은 `sets`로 그림을 여러 개 만들어 `lesson-grid`에 나란히 두고 강조 영역만 바꾼다.
- 선택 강조: 영역 `key`(기본은 `A&B`처럼 id를 &로 연결, 바깥은 `outside`)를 `focus` 버튼과 맞춘다.
