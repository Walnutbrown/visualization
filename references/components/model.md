# model · 조건 탐색

```html
<figure data-illustrate="model">
  <script type="application/json">{"title":"기울기 바꾸기","model":"linear","xDomain":[-4,4],"probe":2}</script>
  <div data-fallback>y = ax + b. a = 1, b = 0에서 x = 2이면 y = 2이다.</div>
  <figcaption>슬라이더를 조절하기 전에 x = 2에서의 결과를 예측한다. 수학식으로 계산한 교육용 모델.</figcaption>
</figure>
```

- `linear`: `a` 기울기, `b` 절편. `exponential`: `a` 처음 크기, `k` 변화율.
- `parameters`로 매개변수별 `label`, `min`, `max`, `step`, `value`를 덮어쓸 수 있다. 범위·간격·기본값은 유한한 수여야 한다.
- `xDomain`과 `probe`를 지정한다. probe는 xDomain 내부여야 한다. y축은 매개변수 범위 전체를 포함하도록 자동 고정한다. 직접 `yDomain`을 주면 전체 결과를 포함해야 한다.
- 그래프의 탐침은 probe에서 시작한다. 커서로 곡선을 따라가며 다른 x의 값을 읽을 수 있고, 커서가 떠나면 probe로 돌아온다.
- 실선은 현재 값, 점선은 초기 값이다. 초기화는 컨트롤·식·그래프를 함께 되돌린다. 현재 식과 probe의 값이 함께 표시된다.
- 임의의 수식 문자열은 실행하지 않는다. 다른 모델은 실제 계산을 확인한 로컬 코드로 보완한다. 이 부품을 과학 모델 전체를 지원하는 것으로 설명하지 않는다.
