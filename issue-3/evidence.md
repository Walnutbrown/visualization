# PR #8 재검토 근거

집계 source SHA: `e6a3e166a010680dc9eba0c9806015de6c4024b6`.

[불변 원자료 gallery-tags.md](https://github.com/Walnutbrown/visualization/blob/e6a3e166a010680dc9eba0c9806015de6c4024b6/references/vis/gallery-tags.md)의 120개 작품 전체를 센다. 단위는 작품 수이며 한 작품은 여러 기법에 중복 집계된다. 기법별 수를 내림차순으로, 동률은 slug 사전순으로 정렬한 상위 10개다. 태그 있음 40개, 빈 태그 80개다. [counts.json](counts.json)에 실제 결과를 저장했다.

## 원본 검토 범위

2026-11-12에 상세 본문 120개를 읽고 모든 원본 URL에 Ego Lite 브라우저 접근을 시도했다. 원본 화면 부분 검토 80개, 탐색·DNS·차단 실패 16개, 오류·폐기·판매·소개·구독·동의 등의 대체/제한 화면 18개, 문서는 열리나 작품이 렌더링되지 않은 경우 6개다. 이 숫자는 빈 태그 80개와 다른 분류다. 상세를 읽지 않은 행은 없으며, 원본을 보지 못한 경우를 원본 검토 완료로 취급하지 않았다.

[작품별 관측 기록](source-review.json)은 요청/최종 URL, 첫 관측 시각, 실제 탐색 오류, 상세 HTML SHA-256, 원본 상태, 판단 근거와 실행한 조작을 담는다. 상세 HTML은 최초 색인 수집 때 저장한 스냅샷이며 해시는 그 파일에 대한 것이다. 원본 첫 화면과 대표 시각물/스크롤 구간을 확인했고, 모든 책·연작·긴 기사·영상·상호작용을 전수 감수한 것은 아니다. 한 작품의 태그를 다른 시리즈 전체에 일반화하지 않았고, 미실행 조작은 행에 남겼다. 탐색 시간 제한은 최초 10초이고 일부 후속 진입은 15–20초다. 실패 후 이전 탭 문서가 남은 네 건은 원본 증거에서 제외했다.

접근 실패라도 상세가 인코딩이나 작동을 구체적으로 설명한 경우에만 상세 기반 태그를 유지했다. 예를 들어 Wedding Data Viz의 하객 노드와 관계 배너, Fireworks의 시간별 PM2.5 방사형 막대·도시 반복·순위 정렬, Screens of August의 일별 앱 사용시간 누적 막대는 그 설명을 근거로 한다. 반면 Fugazi의 막대/타임라인, 3,121 Desperate Journeys의 유닛 차트, 폐기된 아동 사망률 도구의 버블 지도 등은 구체적 근거가 없어 제거했다.

대표 실행 화면은 다음과 같다. 원본은 변경될 수 있으며, 아래 PNG는 이 검토 시점의 부분 화면이다. 그 밖의 로컬 관측 화면은 해시만 기록했고 전체를 게시하지 않았다.

| 작품 | 실행한 조작과 확인 결과 |
|---|---|
| [Codex Atlanticus](review-screens/codex-atlanticus-2019.png) | 주제 필터 후 1,119→515페이지, 연대순 정렬 |
| [FlowmapBlue](review-screens/flowmap-blue-2019.png) | Zürich 검색·선택 후 521,510건 중 113,999건과 관련 흐름만 표시 |
| [Heartbeats](review-screens/heartbeats-2022.png) | Human 선택 후 72 BPM 등 상세 열림 |
| [K-means](review-screens/k-means-clustering-explainer-2022.png) | 표본 수 4 입력 후 산점도가 네 점으로 바뀜 |
| [How do we compare](review-screens/how-do-we-compare-2023.png) | Korea 검색·선택 후 26개 지표와 46% 요약 표시; 툴팁 태그는 상세 설명 근거 |
| [Love Songs](review-screens/is-the-love-song-dying-2024.png) | 방향키 1→24단계 진행, 시대별 누적 영역 그래프 확인 |
| [Seeing ABM](review-screens/seeing-agent-based-modelling-2024.png) | 재생 후 0→50단계와 행복 추세선, 시민 수 편집 창 확인 |
| [Roots of Racism](review-screens/the-roots-of-racism-2024.png) | 주택 보유율 46→90% 변경 후 예상 사건 수 16→10 갱신 |
| [Abortion Mazes](review-screens/the-united-states-of-abortion-mazes-2024.png) | By barriers 정렬 후 Arkansas 미로 진입·시작·방향키 이동 |
| [Beyond Crisis](review-screens/beyond-crisis-lives-saved-2024.png) | 출처 안내 호버 후 CDC/FDA/NIH와 출처 링크 부유 패널 표시 |

## PNG를 만드는 실제 코드와 명령

이 PNG는 [build.py](build.py)가 직접 만든 SVG 막대 그래프를 illustrate의 `scripts/assemble.py`로 조립한 HTML에서 캡처했다. Plot이나 D3로 그리지 않았다. 아래 모든 입력·코드·산출물을 같은 디렉터리에 게시했다.

- [build.py](build.py): 불변 커밋의 태그를 `git show`로 읽고 집계·검사·SVG 조각 생성
- [chart.fragment.html](chart.fragment.html): 실제 SVG 조각 입력
- [chart.html](chart.html): 실제 assemble 출력. 공통 CSS, 글꼴, 페이지 모듈이 인라인됨
- [capture.mjs](capture.mjs): 실제 캡처 코드. 1200×1100, deviceScaleFactor 1, 움직임 감소, 글꼴 로드 대기, 막대 10개·vendor script 0개·하단 잘림 검사
- [gallery-tags.png](gallery-tags.png): 실제 게시 PNG
- [SHA256SUMS](SHA256SUMS): 게시 코드·입력·출력·검토 기록·화면 파일들의 SHA-256

저장소 루트에서 재현한다. `ASSETS`는 이 pr-assets 브랜치의 로컬 체크아웃 절대 경로다. 실행에 필요한 것은 Python, 설치된 Ego Lite 브라우저와 Node이며 새 Python 패키지를 설치하지 않았다.

```sh
ASSETS=/absolute/path/to/pr-assets
SOURCE=e6a3e166a010680dc9eba0c9806015de6c4024b6
git fetch origin Walnutbrown/issue-3
git checkout "$SOURCE"
python3 "$ASSETS/issue-3/build.py" --repo "$PWD" --source "$SOURCE" --out /tmp/issue3-repro
python3 scripts/assemble.py /tmp/issue3-repro/chart.fragment.html /tmp/issue3-repro/chart.html --title '갤러리 기법 태그 현황'
ego-browser nodejs < "$ASSETS/issue-3/capture.mjs"
shasum -a 256 /tmp/issue3-repro/gallery-tags.png
```

캡처 후 Ego 작업 공간은 다음 명령으로 닫았다.

```sh
ego-browser nodejs -e 'const task=await taskSpace("issue-3 source review");await task.finish({keep:[]});'
```

실제 환경: macOS, Python 3.15.0, Ego browser 0.6.2.9 / Chromium 156.0.8078.74 / Node 24.22.1. 글꼴 서브셋 패키지가 없어 assemble은 저장소의 Spoqa Han Sans Neo 전체 글꼴을 내장했다. 같은 환경의 두 캡처는 `cmp`로 바이트가 동일했다. 다른 브라우저·글꼴 처리 환경에서는 PNG 바이트가 달라질 수 있으며 게시 바이트의 확인은 아래 해시와 manifest를 사용한다.

실제 게시 PNG: **1200×1100, 71,466 bytes**, SHA-256 **`50819c628938751ab79715305c6f6d325575654850762d13d738f5d8eb1d6ede`**. 제목·모든 막대·수치·단위·source SHA의 한글 표시와 잘림 여부를 육안 확인했다.

## 필수 게이트 검증

- `python3 -m unittest discover -s scripts`: **30 tests, OK** ([실행 로그](unittest.txt)). 120행·slug 유효성·수동 파일 보존에 더해, 모든 행의 검토 상태/범위/근거와 빈 태그 판단 일치를 검사한다.
- 저장 HTML의 `--from-dir` 재생성을 임시 디렉터리에 실행: 기법 95개·상세 95개·원칙 20개·갤러리 120개가 현재 스냅샷과 동일, 수동 태그 보존 확인.
- 실제 PR 본문의 Mermaid를 [flow.mmd](flow.mmd)에 추출하고 Mermaid CLI로 [flow.svg](flow.svg) 렌더 성공. 명령: `mmdc -i flow.mmd -o flow.svg` (설치된 npm 캐시 실행 파일 사용).
- 새 PNG는 위 source SHA의 집계와 일치한다. 게시 파일을 다시 내려받아 SHA-256·바이트 수·크기를 대조한다.
