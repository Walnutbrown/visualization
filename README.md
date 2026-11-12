# visualization

박현우 교수님의 시각화 분류 체계([vis.hwpark.net](https://vis.hwpark.net))에 기반한 **순수 데이터 시각화 스킬 (`illustrate`)** 및 조립 도구 모음입니다.

---

## 💡 프로젝트 소개

데이터의 구조(차원, 유형)와 전달하려는 커뮤니케이션 목표(비교, 추세, 분포, 상관, 구성비 등)를 체계적으로 분석하여, 95개 기법과 20대 지각 원칙에 따른 최적의 시각화를 생성합니다.

- **외부 런타임 의존성 제로**: 생성된 HTML 파일 하나만으로 오프라인에서도 모든 글꼴, 벡터 그래픽, 수식, 인터랙션이 완벽히 구동됩니다.
- **체계적인 95개 카탈로그**: `references/vis/catalog.md` 및 개별 명세서(`references/vis/techniques/*.md`)를 통해 언제 쓰고 언제 피해야 하는지 명확한 지침을 제공합니다.
- **접근성 및 인지 원칙 내장**: 4.5:1 이상의 명도 대비, 색상 외 2차 식별 단서, 게슈탈트 원리, 데이터-잉크 비율 극대화가 기본 내장되어 있습니다.

---

## 📂 저장소 구조

```text
visualization/
├── SKILL.md                 # illustrate 스킬 정의 파일
├── references/              # 시각화 설계 가이드 및 카탈로그
│   ├── visual-rules.md      # 핵심 시각화 규칙 및 20대 원칙 체크리스트
│   ├── style.md             # 디자인 토큰, 색상 체계, 타이포그래피 시스템
│   ├── math.md              # KaTeX 수식 렌더링 가이드
│   └── vis/                 # vis.hwpark.net 로컬 스냅샷
│       ├── catalog.md       # 95개 기법 매핑 색인
│       ├── techniques/      # 95개 기법별 상세 명세 (용도, 피할 때, 구조)
│       └── principles/      # 20대 시각화 원칙 상세 가이드
├── assets/                  # 오프라인 인라인 에셋
│   ├── base.css             # 기본 반응형 스타일 및 테마 토큰
│   ├── base.html            # 스탠드얼론 HTML 템플릿
│   ├── components/page.js   # 페이지 공통 동작 (스크롤 등장, 단원 바)
│   └── vendor/              # 인라인 폰트 (Spoqa Han Sans Neo), KaTeX, D3, Observable Plot
├── scripts/                 # 조립 및 검증 스크립트
│   ├── assemble.py          # HTML 조립 컴파일러
│   ├── math_render.py       # 수식 렌더러
│   ├── sync_vis_rules.py    # vis.hwpark.net 기법 동기화 도구
│   └── test_assemble.py     # 단위 테스트
└── examples/                # Plot 막대, D3 샌키 예시
```

---

## 🚀 빠른 시작 (CLI)

HTML 조각(`fragment.html`)을 단일 스탠드얼론 웹 문서로 컴파일합니다.

```bash
# 기본 조립
python3 scripts/assemble.py input_fragment.html output.html --title "시각화 문서 제목"

# 여러 조각 파일 병합
python3 scripts/assemble.py header.html output.html --title "시각화" --append chart1.html --append chart2.html
```

---

## 🧪 테스트 실행

```bash
python3 -m unittest discover -s scripts
```

---

## 📜 라이선스

- Spoqa Han Sans Neo: SIL Open Font License 1.1
- KaTeX: MIT License
- 본 저장소의 시각화 규칙 및 코드: MIT License
