# issue-2 증거

- 소스: Walnutbrown/visualization 브랜치 `Walnutbrown/issue-2`, head `e3b0c8bac30241215340fc52b90ad49783a56dd7`, base `d02a049bcaa2d7e6604dd5226f963787f20ca140`
- 번들(npm registry tarball): d3 7.9.2 (sha256 f0c1d2c2…d1aa), @observablehq/plot 0.6.19 (667ea5e7…c6ddc3), d3-sankey 0.12.3 (6bd8cdb1…ff22). 전체 해시는 `assets/vendor/*/version.json`.

## 조립 결과 파일 크기 (바이트, 글꼴 서브셋 적용: fonttools+brotli 설치 venv)
| 파일 | 명령 | 크기(B) |
|---|---|---|
| base(d02a049) `examples/sample_fragment.html` 조립 (번들 없음) | `git show d02a049:examples/sample_fragment.html > f.html; python3 scripts/assemble.py f.html out.html --title "데이터 유형별 시각화 기법 가이드"; wc -c out.html` | 95,401 |
| head Plot 막대 (d3+plot 번들 포함) | `python3 scripts/assemble.py examples/plot_bar.html out.html --title "2023년 인구 상위 10개국"` | 573,015 |
| head D3 샌키 (d3+d3-sankey 번들 포함) | `python3 scripts/assemble.py examples/d3_sankey.html out.html --title "타이태닉호 탑승자의 흐름"` | 371,471 |

번들 원본 크기(`wc -c`): d3.min.js 280,622 / plot.umd.min.js 211,860 / d3-sankey.min.js 5,652.
서브셋 없이(fonttools 미설치) 조립하면 base 782,463 / Plot 1,243,886 / 샌키 1,039,445 B (head 두 값은 제목을 `t`로 측정).
측정 환경: macOS, Python 3.15, 단일 실행 1회, 단위 바이트.

## 캡처
`Google Chrome --headless=new --host-resolver-rules="MAP * ~NOTFOUND" --window-size=1000,1100 --virtual-time-budget=5000 --screenshot=… file://…/{plot_bar,d3_sankey}.html` (모든 호스트 해석 차단 = 네트워크 없음), 1000×1100 PNG.

## 데이터
- Plot 막대: World Bank API `SP.POP.TOTL`, `date=2023`, 10개국 (`api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?date=2023&format=json&per_page=400`, lastupdated 2026-10-08).
- D3 샌키: R `datasets::Titanic`(Dawson 1995). 합계 검산: 승무원 885 + 1등석 325 + 2등석 285 + 3등석 706 = 2,201; 생존 711, 사망 1,490. 원본 파일을 직접 내려받아 대조하지는 않았고 합계 검산만 했다.

## 테스트
`python3 -m unittest discover -s scripts` → Ran 16 tests, OK (fonttools 없는 환경과 있는 venv 모두).

## Mermaid 검증
`npx -p @mermaid-js/mermaid-cli mmdc -i flow.mmd -o flow.png`로 실제 파싱·렌더, 오류 없음. flow.png 참조.
