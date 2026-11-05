# diagram · 계층형 관계 그림

```html
<figure data-illustrate="diagram">
  <script type="application/json">{"title":"입력에서 출력까지","layers":[[{"id":"in","label":"입력"}],[{"id":"out","label":"출력"}]],"links":[{"from":"in","to":"out","label":"처리"}]}</script>
  <div data-fallback>입력을 처리하면 출력이 된다.</div>
  <figcaption>화살표는 처리 순서를 뜻한다.</figcaption>
</figure>
```

- `layers`는 위에서 아래로 배치할 계층 배열이다. 각 노드에는 유일한 `id`와 `label`이 필요하다.
- `links`는 `from`, `to`, 선택적 짧은 `label`을 가진다. 앞 계층에서 뒤 계층으로 연결한다. 포함·원인·참조·순서 중 무엇인지 구별한다.
- 긴 라벨은 줄바꿈된다. 형제 노드가 화면에 맞지 않으면 연결별 좌우 대조 행으로 바꿔 모든 연결을 표시한다. 전체 구조를 한 번에 보는 것이 중요한 경우에는 별도 부분 그림을 함께 둔다.
- 순환·역방향·복잡한 교차 연결은 미지원이다. 별도 SVG로 의미를 보존한다. 레이아웃을 맞추려고 관계를 바꾸지 않는다.
