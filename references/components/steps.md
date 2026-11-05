# steps · 단계 이동과 재생

```html
<section data-illustrate="steps" data-playback="true" aria-label="처리 과정">
  <section data-step data-title="입력"><h3>1. 입력</h3><p>실제 단계 그림 또는 풀이</p></section>
  <section data-step data-title="출력"><h3>2. 출력</h3><p>실제 단계 그림 또는 풀이</p></section>
</section>
```

- 직접 자식 `data-step` 영역이 두 개 이상 필요하다. 시작 파일의 SVG·풀이를 현재 자료로 교체한다.
- 이전·다음·현재 단계는 자동 생성된다. `data-playback="true"`일 때만 재생·정지 버튼이 생긴다. 자동 시작하지 않는다.
- 모션 축소 설정에서는 재생을 막고 수동 단계 이동을 유지한다. 입력칸의 좌우 키와 충돌하지 않는다.
- JS가 꺼졌거나 인쇄할 때는 모든 단계가 보인다. 재생은 이산 상태를 차례로 보여주는 기능이다.

## 문질러 잇기 (`data-scrub="true"`)

같은 대상이 움직이거나 바뀌는 과정(자리 바꾸기, 이동, 크기·모양 변화, 누적)은 단계마다 정지 그림만 그리고 `data-scrub="true"`를 붙인다. 독자가 그림 위에서 커서를 좌우로 움직이거나 끌면 단계 사이가 끊기지 않고 이어진다. 애니메이션 코드는 쓰지 않는다.

```html
<section data-illustrate="steps" data-scrub="true" aria-label="Feistel 한 라운드">
  <section data-step data-title="나누기">
    <svg viewBox="0 0 480 220" width="480" role="img" aria-labelledby="s1"><title id="s1">블록을 L₀와 R₀로 나눈다</title>
      <rect data-key="L" class="node" x="40" y="30" width="160" height="56"/><text data-key="L-name" x="120" y="64" text-anchor="middle">L₀</text>
      <rect data-key="F" class="highlight" x="280" y="30" width="160" height="56" opacity="0"/>
    </svg>
    <p>단계 설명</p>
  </section>
  <section data-step data-title="F에 넣기">
    <svg viewBox="0 0 480 220" width="480" role="img" aria-labelledby="s2"><title id="s2">…</title>
      <rect data-key="L" class="node" x="40" y="30" width="160" height="56"/><text data-key="L-name" x="120" y="64" text-anchor="middle">L₀</text>
      <rect data-key="F" class="highlight" x="40" y="140" width="160" height="56"/>
    </svg>
    <p>단계 설명</p>
  </section>
</section>
```

- 단계마다 직접 자식 `<svg>`가 하나 있고 viewBox가 같다. 첫 단계의 그림이 무대가 되고, 무대는 viewBox 너비보다 크게 그려지지 않는다.
- 움직이거나 바뀌는 요소에는 단계마다 같은 `data-key`를 단다. key가 없는 요소는 첫 단계의 것이 배경으로 남는다.
- `x`, `y`, `cx`, `cy`, `r`, `rx`, `ry`, `x1`~`y2`, `width`, `height`, `d`, `points`, `transform`, `stroke-width`, `opacity`는 단계 사이에서 이어진다. `d`·`points`·`transform`은 두 단계의 명령 구조가 같아야 이어지고, 다르면 중간에서 바뀐다. 글자, `class`, 색은 중간 지점에서 바뀐다.
- 어떤 단계에만 있는 요소는 서서히 나타나거나 사라진다. 처음부터 자리를 잡아 두려면 `opacity="0"`으로 둔다.
- 서로 자리를 바꾸는 두 요소는 같은 길로 움직이면 중간에서 겹친다. 위아래로 비켜 가는 중간 단계를 둔다.
- 각 단계 근처에는 멈춤 구간이 있어 커서를 멈추면 정확한 단계 그림에 머문다. 아래 슬라이더와 좌우 화살표 키는 다음 단계로 부드럽게 넘어간다. 그림 밖 설명은 가장 가까운 단계의 것이 보인다.
- 모션 축소 설정에서는 화살표 키가 단계로 바로 이동한다. JS가 꺼졌거나 인쇄할 때는 단계별 정지 그림이 모두 보인다.
- 단계마다 그림이 서로 다른 풀이(같은 대상이 이어지지 않음)는 scrub 없이 기본 단계 이동을 쓴다.
