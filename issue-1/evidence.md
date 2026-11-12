# issue-1 실측 근거

- base: d02a049bcaa2d7e6604dd5226f963787f20ca140 (origin/main)
- head: 813cdff339880097b7f36227684243e4c05786eb (Walnutbrown/issue-1)
- 사이트 원문: 2026-11-12에 https://vis.hwpark.net/catalog/ 95쪽, /principles/ 20쪽을 내려받아 `<h2>` 한국어 제목으로 섹션 유무를 셌다.

## 크기 (단위: 바이트, 집계: references/vis/techniques/ 의 기법 95개, 파일 크기 합 / 95)
측정: base는 `git show d02a049:references/vis/techniques/<slug>.md`의 바이트 길이, head는 `wc -c`와 같은 파일 크기.
| 항목 | 파일 수 | 합계 | 평균 |
|---|---|---|---|
| base `<slug>.md` | 95 | 461,613 | 4,859 |
| head `<slug>.md` (조건) | 95 | 157,683 | 1,660 |
| head `<slug>.detail.md` (상세) | 95 | 369,526 | 3,890 |
| head 합계 | 190 | 527,209 | 5,550 (쌍 기준) |

## 섹션별 보유 수 (파일 수; 사이트 / base / head)
| 구분 | 섹션 | 사이트 | base | head |
|---|---|---|---|---|
| 차트 65 | 언제 사용하나·이럴 땐 피하세요·설명·구조·변형·관련 기법 | 65 | 65 | 65 |
| 차트 65 | 코드 레퍼런스 | 65 | 0 | 65 |
| 인터랙션 30 | 언제 사용하나·이럴 땐 피하세요·설명·변형·관련 기법 | 30 | 30 | 30 |
| 인터랙션 30 | 작동 방식 | 30 | 25 | 30 |
| 인터랙션 30 | 코드 레퍼런스 | 30 | 0 | 30 |
| 원칙 20 | 설명·핵심 아이디어·좋은 예시·안티 패턴·관련 카탈로그 | 20 | 20 | 20 |

## 명령
- `python3 scripts/sync_vis_rules.py` 와 같은 파서를 저장 HTML에 적용(`--from-dir`)해 스냅샷 재생성
- `python3 -m unittest discover -s scripts` → Ran 52 tests, OK
- PNG: `python3 scripts/assemble.py frag.html pr1.html` → Chrome(DevTools) 전체 페이지 캡처
- Mermaid: `npx @mermaid-js/mermaid-cli@12.2.0 -i flow.mmd -o flow.svg` 성공(파싱·렌더)
