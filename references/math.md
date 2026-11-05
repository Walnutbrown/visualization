# LaTeX 수식

본문 수식은 평문 유니코드로 흉내 내지 않고 LaTeX로 쓴다. 단순한 숫자·축 이름은 텍스트로 남겨도 된다. 복잡한 수식 라벨은 SVG text 안에 TeX를 넣지 말고 가까운 HTML 수식으로 배치한다. 기호·정의·수치·근사 조건은 원자료와 일치시킨다.

## 작성

문장 안 수식은 `\(…\)`, 독립 수식은 `\[…\]`로 써도 된다. 조립기가 본문 텍스트의 구분자를 찾아 KaTeX로 렌더링한다. HTML 속성·주석과 `<pre>`, `<code>`, `<script>`, `<style>`, `<textarea>` 안의 구분자는 바꾸지 않는다. 그 밖에 `$…$`는 금액 표기와 구별할 수 없으므로 수식으로 쓰지 않는다.

```html
<p>편미분: <span data-math="inline">\frac{\partial f}{\partial x}</span></p>
<div class="lesson-result">
  <div data-math="block">H(x,y)=\begin{bmatrix}6x&amp;-12\\-12&amp;48y\end{bmatrix}</div>
</div>
```

- 문장 안은 `span data-math="inline"`, 독립 수식은 `div data-math="block"`이다. 요소 안에는 LaTeX 텍스트만 넣는다. 한글 설명은 수식 밖에 둔다.
- HTML의 `&`, `<`, `>`는 `&amp;`, `&lt;`, `&gt;`로 이스케이프한다. 행렬의 칼럼 구분 `&`도 HTML 본문에서는 `&amp;`다. Python으로 작성하면 TeX 문자열에 `html.escape`를 적용한다.
- 독립 수식 div를 p 안에 넣지 않는다. p를 닫거나 `div class="lesson-result"`로 묶는다.
- 분수는 `\frac`, 벡터 성분은 아래첨자, 행렬은 `bmatrix`, 여러 계산 줄은 `aligned`를 사용한다. 문자를 줄줄이 나열하거나 대괄호 배열로 행렬을 흉내 내지 않는다.
- 긴 식은 의미 단위로 나눈다. 그래도 넓으면 수식 영역 내부에서 스크롤하게 하고 본문 글씨를 작게 줄이지 않는다. 색은 주변 글자색을 따르며 장식용 색 명령을 넣지 않는다.

## 조립과 검수

기존 `assemble.py`·`assemble_lesson.py`를 그대로 쓴다. 수식이 있으면 로컬 Node.js와 동봉된 KaTeX가 한 번에 HTML+MathML로 변환한다. 문서에 수식 CSS·WOFF2 글꼴·라이선스를 한 번만 내장한다. 결과에는 수식 실행용 JavaScript가 필요 없으며, 오프라인·JS 비활성 상태에서도 읽을 수 있다. 수식이 없으면 수식 자원을 넣지 않는다. 호출할 때 npm 설치나 CDN 접속을 하지 않는다.

수식 오류나 실행 환경 오류는 조립 실패로 처리하고 이전 HTML을 보존한다. 오류를 숨기거나 평문으로 바꿔서 완료하지 않는다. 지원하지 않는 TeX 명령은 KaTeX가 지원하는 동등한 식으로 바꾸고 수학적 의미를 확인한다.

분수·행렬·미분·첨자가 맞게 보이는지, 잘리거나 주변 문장과 겹치지 않는지 넓은 화면과 모바일에서 확인한다. 파일 크기는 글꼴과 렌더링 결과 때문에 늘 수 있지만, 이 코드를 모델이 매번 생성하거나 읽을 필요는 없다. 본문 조각에는 짧은 LaTeX만 보관한다.

동적으로 바뀌는 복잡한 수식은 별도 로컬 렌더링을 검증해야 한다. 이 조립 경로는 정적 본문과 미리 작성한 단계 수식을 대상으로 한다.

구현 참고: [KaTeX API](https://katex.org/docs/api.html), [Node.js 사용](https://katex.org/docs/node.html), [옵션](https://katex.org/docs/options.html). 스킬에 동봉했으므로 제작 때 다시 조회할 필요는 없다.
