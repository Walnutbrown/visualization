# AGENTS.md — `Walnutbrown/visualization` 워크트리 분업 및 자동화 규약

본 저장소(`Walnutbrown/visualization`)는 박현우 교수의 시각화 분류 체계(`vis.hwpark.net`)에 기반한 순수 데이터 시각화 스킬(`illustrate`) 프로젝트이며, **개미 군단(Ant Colony) 워크트리 자동화 프로세스**로 운영됩니다.

---

## 1. 역할별 워크트리 구성 및 권한 (3권 분립)

| 역할 (displayName) | 워크트리 경로 | 핵심 책임 및 권한 제한 |
|---|---|---|
| **`main`** | `/Users/jeong-ingyeong/orca/visualization` | 기준 브랜치(`main`). 병합 완료 후 `git pull --ff-only`로 항상 최신 상태 유지. |
| **`뿌리기`** | `/Users/jeong-ingyeong/orca/workspaces/visualization/뿌리기-3` | 사용자 요구사항 분석 및 코드 경로 사전 검증 후 GitHub Issue 생성 (`일개미` 라벨 부착). **직접 코드 수정·PR 생성·병합 금지.** |
| **`일개미`** | `/Users/jeong-ingyeong/orca/workspaces/visualization/일개미` | 5분 주기 자동화 조정자. 열린 `일개미` 이슈마다 하위 워크트리(`issue-<번호>`)에 일꾼을 배정하여 구현·테스트·PR 생성·피드백 반영 수행. **단독 병합 금지.** |
| **`감독`** | `/Users/jeong-ingyeong/orca/workspaces/visualization/pearleye` | 독립 리뷰어 및 최종 병합권자. PR 게이트·코드 정합성·테스트를 독립 검증하여 문제 없으면 승인 SHA 병합, 문제 있으면 `ask`로 일개미에게 반환. 매시간 정각 사람이 읽기 쉬운 근황 요약 보고 수행. |
| **`질문`** | `/Users/jeong-ingyeong/orca/workspaces/visualization/질문` | 사용자의 이해를 돕기 위해 아키텍처 및 시각화 구조 위주로 설명·질의응답 수행. |

---

## 2. 에이전트 배정 및 인계 우선순위 (선순위 한도 우선 확인)

일꾼(Worker)이나 감독(Review Supervisor)을 새로 실행하거나 한도 도달로 다음 단계로 인계할 때는 **항상 `python3 /Users/jeong-ingyeong/orca/agent-handoff/inspect_handoffs.py`를 실행**하여 1순위부터 선순위 모델의 한도가 남았는지 확인한 뒤 배정합니다.

1. **1순위 (`claude`)**: 주간 및 5시간 세션 사용량 `< 100%` → `--agent claude --model opusplan`
2. **2순위 (`codex`)**: 주간 사용량 `< 100%` → `--agent codex`
3. **3순위 (`antigravity:argon`)**: Gemini 전체 `< 100%` 및 Gemini 4 Argon 주간 `< 98%` → `--agent antigravity --model gemini-4-argon-medium`
4. **4순위 / 최종 폴백 (`antigravity:flash`)**: 선순위가 모두 소진되었거나 조회 실패 시 → `--agent antigravity --model gemini-3.8-flash-high`

> **핵심 원칙**: 인계 시 다음 단계로 넘어갈 때 단순히 아래 단계로만 내려가지 않고, **항상 선순위(1순위 Claude → 2순위 Codex → 3순위 Argon)의 한도가 리셋되어 남았는지 먼저 확인**합니다.

---

## 3. 필수 PR 게이트 (모든 PR 예외 없이 적용)

일개미가 생성·갱신하는 모든 PR과 감독의 리뷰는 아래 4가지 게이트를 반드시 통과해야 합니다:

1. **Mermaid 구조도**: PR 본문에 변경 아키텍처/흐름을 나타내는 렌더 가능한 fenced `mermaid` 다이어그램 포함.
2. **시각화 PNG 에셋 (`pr-assets`)**:
   - `illustrate` (`scripts/assemble.py`)로 제작한 차트/시각화를 캡처하여 고아 브랜치 `pr-assets`에 게시.
   - PR 본문에 `![설명](https://github.com/Walnutbrown/visualization/blob/pr-assets/<파일명>.png?raw=true)` 형태로 임베드.
3. **실측 근거**: PNG에 표시된 수치는 실제 base/head 또는 실행 결과에서 측정한 값이어야 하며, 단위·집계 범위·측정 근거(source SHA)를 명시 (가짜 수치·빈 이미지·placeholder 금지).
4. **단위 테스트 통과**: `python3 -m unittest discover -s scripts` 전체 통과.

---

## 4. 병합 후 로컬 동기화 및 워크트리 정리

1. **로컬 동기화**:
   - 감독이 PR을 병합하면 `/Users/jeong-ingyeong/orca/visualization` (`main`)에서 작업 트리가 깨끗한지 확인 후 `git pull --ff-only`를 실행하여 `origin/main`과 동기화합니다.
2. **하위 워크트리 자동 정리**:
   - PR 병합·감독 리뷰·로컬 동기화가 완료된 후, 해당 `issue-<번호>` 하위 워크트리의 `git status --porcelain`이 비어 있고 push 안 된 커밋이 없을 때만 `orca worktree rm --worktree path:<경로>`로 제거합니다 (`--force`, `--delete-branch` 금지).
   - `main`, `뿌리기-3`, `일개미`, `pearleye`, `질문` 등 역할 워크트리는 절대 제거하지 않습니다.

---

## 5. 사용자 승인 대기 (`승인대기` 라벨)

이슈나 PR에 사용자 판단/승인이 필요한 경우 세션에서 무한 대기하지 않습니다:
1. 해당 이슈/PR에 `승인대기` 라벨을 부착 (`gh api repos/Walnutbrown/visualization/issues/<번호>/labels -f 'labels[]=승인대기'`).
2. 필요한 판단 사항과 선택지를 한 줄 코멘트로 기록.
3. `orca worktree set --worktree active --unread`로 사용자 호출 후 해당 틱을 종료.
