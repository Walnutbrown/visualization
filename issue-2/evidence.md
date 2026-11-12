# issue-2 증거

- 소스: Walnutbrown/visualization 브랜치 `Walnutbrown/issue-2`, head `e3b0c8bac30241215340fc52b90ad49783a56dd7`, base `d02a049bcaa2d7e6604dd5226f963787f20ca140`
- 번들(npm registry tarball): d3 7.9.2 (sha256 f0c1d2c2…d1aa), @observablehq/plot 0.6.19 (667ea5e7…c6ddc3), d3-sankey 0.12.3 (6bd8cdb1…ff22). 전체 해시는 `assets/vendor/*/version.json`.

## 조립 결과 파일 크기 (바이트, 글꼴 서브셋 적용)
환경: macOS, Python 3.15.0, fonttools 4.68.0, brotli 1.2.1 (같은 venv). 값은 같은 명령 5회 실행의 중앙값이고 괄호는 최소~최대다. 글꼴 서브셋(woff2 저장)이 실행마다 수백 B 달라 단일 실행은 ±0.05% 흔들린다.

| 파일 | 조립기 | 번들·컴포넌트 | 크기(B) |
|---|---|---|---|
| base d02a049 `examples/sample_fragment.html` | d02a049의 `scripts/assemble.py` | 컴포넌트 chart/core/page/waterfall 포함 | 132,463 (132,335~132,503) |
| head Plot 막대 `examples/plot_bar.html` | head(e3b0c8b) | d3+plot 번들 | 573,187 (573,187~573,271) |
| head D3 샌키 `examples/d3_sankey.html` | head(e3b0c8b) | d3+d3-sankey 번들 | 371,535 (371,439~371,627) |

명령(base): `mkdir t && git archive d02a049 | tar -x -C t; venv/bin/python t/scripts/assemble.py t/examples/sample_fragment.html out.html --title "데이터 유형별 시각화 기법 가이드"; wc -c out.html`
명령(head): `venv/bin/python scripts/assemble.py examples/plot_bar.html out.html --title "2023년 인구 상위 10개국"` / `… examples/d3_sankey.html … --title "타이태닉호 탑승자의 흐름"`

정정: 이전 evidence의 base 95,401 B는 d02a049 조립기가 아니라 head 조립기(컴포넌트 미처리)로 잰 값이라 틀렸다. head 조립기로 같은 조각을 조립하면 95,373~95,449 B다. 감독이 잰 base 132,347 B는 위 5회 범위(132,335~132,503)에 든다. 이전 head 값 573,015 / 371,471도 단일 실행이었고 위 범위와 0.05% 안에서 같다(감독 573,291 / 371,575도 범위 안).
증감(중앙값): base → Plot +440,724 B, base → 샌키 +239,072 B. 번들 원본(`wc -c`): d3.min.js 280,622 / plot.umd.min.js 211,860 / d3-sankey.min.js 5,652.
서브셋 없이(fonttools 미설치) 조립한 값은 이전 측정에서 head 1,243,886 / 1,039,445 B였으며 이번에 base를 다시 재지 않았다.

## 캡처
`Google Chrome --headless=new --host-resolver-rules="MAP * ~NOTFOUND" --window-size=1000,1100 --virtual-time-budget=5000 --screenshot=… file://…/{plot_bar,d3_sankey}.html` (모든 호스트 해석 차단 = 네트워크 없음), 1000×1100 PNG.

## 데이터
- Plot 막대: World Bank API `SP.POP.TOTL`, `date=2023`, 10개국 (`api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?date=2023&format=json&per_page=400`, lastupdated 2026-10-08).
- D3 샌키: R `datasets::Titanic`(Dawson 1995). 합계 검산: 승무원 885 + 1등석 325 + 2등석 285 + 3등석 706 = 2,201; 생존 711, 사망 1,490. 원본 파일을 직접 내려받아 대조하지는 않았고 합계 검산만 했다.

## 테스트
`python3 -m unittest discover -s scripts` → Ran 16 tests, OK (fonttools 없는 환경과 있는 venv 모두).

## Mermaid 검증
`npx -p @mermaid-js/mermaid-cli mmdc -i flow.mmd -o flow.png`로 실제 파싱·렌더, 오류 없음. flow.png 참조.
