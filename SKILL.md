---
name: illustrate
description: Create standalone data visualizations using the vis.hwpark.net technique and principle snapshots.
---

# illustrate

기법과 원칙의 판단 근거는 `references/vis/`의 사이트 원문 스냅샷만 사용한다. 실행 중 사이트를 직접 읽지 않는다. 스냅샷은 `scripts/sync_vis_rules.py`로만 갱신한다. 사이트에 기준이 없으면 “사이트에 기준 없음”이라고 쓰고, 별도의 판단은 우리 판단이라고 표시한다.

## 1. 프로파일

읽기: `references/vis/catalog.md`만.

데이터의 각 컬럼을 색인의 데이터 타입 태그로 분류한다. 색인의 과제 태그 어휘를 사용해 데이터가 답할 수 있는 질문 2~4개를 제시하고 사용자가 고르게 한다. 선택한 질문의 과제와 데이터 태그로 후보를 10개 이하로 좁힌다.

## 2. 후보 3개

읽기: 1단계에서 고른 후보의 `references/vis/techniques/<slug>.md`만. 대안 또는 관련 기법으로 이동할 때도 해당 조건 파일만 읽는다.

각 후보의 `언제 사용하나`와 `이럴 땐 피하세요`를 범주 수, 행 수 등 실제 데이터 수치와 대조한다. 탈락하면 `대안`과 `관련 기법`을 한 단계만 따라간다. 후보 3개를 제안하고 각 후보의 근거 문장을 원문 그대로 인용하고 파일에 적힌 출처 URL을 붙인다. 기준이 없는 경우 “사이트에 기준 없음”이라고 쓴다. 후보가 3개에 못 미치면 이유를 밝힌다.

## 3. 작은 시안

읽기: 후보 3개의 `references/vis/techniques/<slug>.detail.md`, `references/vis/gallery-tags.md`, 필요하면 `references/vis/gallery.md`, `references/style.md`, `scripts/assemble.py`, `assets/vendor/`, `examples/`.

각 상세 파일의 `코드 레퍼런스`에서 출발해 실제 데이터로 주석과 인터랙션 없는 정적 시안 3개를 만든다. 갤러리 태그에서 같은 기법의 작품 링크를 함께 보여 주고 사용자가 하나를 고르게 한다. 조각은 `python3 scripts/assemble.py <fragment.html> <output.html> --title "제목"`으로 독립 HTML에 조립한다.

## 4. 완성

읽기: 선택 기법의 상세 파일, `references/vis/principles/`의 원칙 20개, 필요한 인터랙션의 `references/vis/techniques/<slug>.md`, `references/style.md` 및 구현에 필요한 조립기·에셋·예시.

선택한 시안 하나에 각 원칙의 `핵심 아이디어`를 적용하고 `안티 패턴`으로 검수한다. 인터랙션은 선택 기법의 `함께 쓰면 좋은 기법`에 있는 것만 각 조건 파일을 대조해 고른다. 스타일의 “스킬 자체 규칙”은 사이트 기준이 아닌 구현 규칙이다. 결과와 함께 원칙 20개 전부를 나열한 검수표를 제공하고, 각 원칙에 `적용함(무엇을)` 또는 `해당 없음(사유)`을 적는다.
