# PR #8 — 사용자 확정 A안 근거

집계 source SHA: `6ee8f2fb116435bb02e6ac4062c88186ee6bab70`. 사이트 상세 수집일: 2026-11-17.

사이트 상세의 ‘사용된 기법’을 `gallery.md`에 자동 수집하고, `gallery-tags.md`는 사이트 링크와 별개인 우리 판단으로 유지한다. `SKILL.md`의 작은 시안 단계는 두 파일을 읽고 출처를 구분해 작품 링크를 제시한다. 수동 빈 태그는 판단 보류이며 기법이 없거나 작품을 쓰지 않는다는 뜻으로 해석하지 않는다.

## 실측값

[counts.json](counts.json)은 `build.py`가 불변 source SHA의 두 Markdown 표를 작품 slug로 대조한 결과다. [site-review.json](site-review.json)은 120개 작품 각각의 사이트 기법과 수동 태그를 별도로 담는다.

- 전체 120개 작품: 수동 태그 있음 40개, 빈 태그 80개.
- 사이트 연결: 43개 작품, 77개 링크, 28종 기법.
- 수동 태그가 빈 80개 중 사이트 연결이 있는 작품 22개, 양쪽 모두 비어 있는 작품 58개.
- 두 출처 중 하나라도 연결된 작품은 62개. 두 출처를 합쳐 새 수동 태그로 저장하지 않는다.
- 수동 기법별 작품 수 상위 10개: click-to-select 4, line-graph 4, small-multiples 4, text-search-filter 4, timeline 4, bar-chart 3, sort 3, dot-map 2, flow-map 2, network-diagram 2.

단위는 작품 수이며 링크 수와 기법 종수는 별도 표기했다. 기법별 작품 수에는 한 작품이 여러 번 포함될 수 있다. 상위 10개는 작품 수 내림차순, 동률은 slug 사전순이다.

## 원자료와 검토 범위

[gallery-pages.tar.gz](gallery-pages.tar.gz)에 120개 상세 HTML을 저장했고 [source-pages.json](source-pages.json)에 URL과 HTML SHA-256을 기록했다. 링크가 없는 상세도 빠짐없이 저장했다. ‘사용된 기법’ 절 밖의 탐색·다른 절 링크는 수집하지 않는다. 기존 120개 작품의 메타데이터와 수동 태그 행은 `e6a3e166a010680dc9eba0c9806015de6c4024b6`의 행과 비교해 모두 보존됨을 확인했다.

2026-11-17에는 사이트 기법 링크를 전수 대조했으며 원본 프로젝트의 화면·상호작용을 재검토하지 않았다. 원본 검토 기록은 [기존 source-review.json](../source-review.json)과 각 수동 태그 행의 범위·근거를 따른다. 빈 태그 58개는 기법 미사용 판정이 아니며, 이번 작업으로 그 원본의 기법을 확정하지 않았다.

## 재현

저장소 source SHA 체크아웃과 이 `pr-assets` 브랜치 체크아웃을 준비한다. 아래 경로는 실제 실행한 경로이며 `capture.mjs`도 같은 절대 경로를 사용한다.

```sh
SOURCE=6ee8f2fb116435bb02e6ac4062c88186ee6bab70
ASSETS=/private/tmp/issue3-assets-a/issue-3/option-a
python3 "$ASSETS/build.py" --repo "$PWD" --source "$SOURCE" --out "$ASSETS"
python3 scripts/assemble.py "$ASSETS/chart.fragment.html" "$ASSETS/chart.html" --title '갤러리 기법 연결과 빈 태그'
ego-browser nodejs < "$ASSETS/capture.mjs"
```

캡처 출력에 표시된 TaskSpace ID를 사용해, 화면 확인 뒤 별도 호출에서 `task.finish({keep:[]})`로 종료한다. 실제 실행은 ID 3을 사용했고 종료 완료했다.

보관 HTML의 갤러리 재생성 대조는 아래와 같다. 전체 사이트 동기화를 위한 catalog/principles HTML은 이 아카이브에 포함하지 않았다.

```sh
mkdir -p /private/tmp/issue3-a-replay
tar -xzf "$ASSETS/gallery-pages.tar.gz" -C /private/tmp/issue3-a-replay
python3 - <<'PY'
from pathlib import Path
import sys
sys.path.insert(0, 'scripts')
import sync_vis_rules as sync
actual = sync.gallery_index(sync.collect('gallery', Path('/private/tmp/issue3-a-replay')))
assert actual == Path('references/vis/gallery.md').read_text()
print('120개 보관 HTML 재생성 일치')
PY
```

## 게이트와 PNG

- `python3 -m unittest discover -s scripts`: 30 tests, OK. [실행 로그](unittest.txt).
- 갤러리 120행과 기법 slug의 실존 여부, 정확한 기법 링크·중복 없음, ‘사용된 기법’ 절만 추출, 빈 기법 목록, 수동 파일 동기화 보존 검사 통과.
- 보관 HTML로 갤러리 재생성 결과 일치. 기존 메타데이터 120행과 수동 태그 120행 보존 대조 통과.
- PR Mermaid 본문과 [flow.mmd](flow.mmd) 일치, Mermaid CLI의 [flow.svg](flow.svg) 렌더 성공.
- [build.py](build.py)의 수동 SVG → illustrate `scripts/assemble.py` → [chart.html](chart.html) → Ego Lite/Chromium [capture.mjs](capture.mjs) → [gallery-tags.png](gallery-tags.png). Plot/D3는 사용하지 않았다.
- 캡처 검증: 막대 10개, vendor script 0개, viewport 1200×1250, 하단 좌표 1020.51로 잘림 없음. 한글·수치·단위·SHA를 육안 확인했다.
- PNG: 1200×1250, 101,596 bytes, SHA-256 `e7d56e2b6c82063e208e2c5e4781f38223e20d5634265105fbc24b4a24135307`.
- 글꼴 서브셋 패키지가 없어 assemble이 저장소의 Spoqa Han Sans Neo 전체 글꼴을 내장했다. PDF는 생성하지 않았다.

[verification.json](verification.json)과 [SHA256SUMS](SHA256SUMS)에 검증 결과와 게시 파일 해시를 기록했다.
