# 이슈 4 시안 측정 근거

- 스킬·조립기 source SHA: `7cd2a71ac9331db00c17ac9ed9999e29c944e56d`, base `aef034a9be16062c8b50b7baba53dd4e449874df`.
- 데이터: World Bank World Development Indicators `SP.POP.TOTL`, 2023년, API 최신 갱신일 2026-10-08. [원자료 API](https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?date=2023&format=json&per_page=500). 10개국(IND CHN USA IDN PAK NGA BRA BGD RUS MEX)을 추출했다. 전체 세계 상위 순위로 검증했다고 주장하지 않는다. [추출 원자료](data.json), 단위는 명.
- 차트는 원자료 값을 1,000,000으로 나눈 백만 명이며 집계 범위는 2023년 선택된 10개국, 범주당 한 관측치다. 표에는 변환하지 않은 명 단위를 썼다.
- 조회: `curl -fsSL 'https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?date=2023&format=json&per_page=500' -o all.json`; countryiso3code로 10개국 필터 후 value 내림차순.
- 재현: 해당 SHA의 저장소에서 `python3 scripts/assemble.py bar.html bar-assembled.html --title bar` (다른 조각도 동일). Chrome headless에서 reduced motion을 켜고 각 파일을 1200×1800으로 캡처했다. `mobile.png`는 Puppeteer `setViewport({width:390,height:1800})`, reduced motion, 전체 페이지 캡처다. 모바일 document scrollWidth와 innerWidth는 둘 다 390 CSS px다.
- `bar.html`, `lollipop.html`, `dot.html`, `final.html`은 실행한 조각 원본이다. 각 시안의 Plot 마크는 해당 기법의 상세 파일 코드 레퍼런스에서 출발했으며 호버 팁은 제거했다. 완성본은 정적 차트와 접근 가능한 원자료 표를 제공한다.
