# 북마크 / 상태 공유 상세 (`bookmark-share`)

## 설명

북마크 / 상태 공유는 시각화의 현재 상태(활성화된 필터, 선택 항목, 확대 수준, 정렬 순서, 펼쳐진 노드, 그 밖의 모든 사용자 설정)를 지속적이고 공유 가능한 형태로 직렬화하는 인터랙션 패턴입니다. 일반적으로는 쿼리 파라미터가 인코딩된 URL 형태를 취하지만, 저장된 프리셋, 다운로드 가능한 설정 파일, 클립보드에 바로 복사할 수 있는 링크가 될 수도 있습니다. 다른 사용자가 이 URL을 열면 시각화는 정확히 동일한 상태로 로드됩니다.

이 패턴은 인터랙티브 시각화의 근본적인 문제, 즉 인사이트가 휘발성이라는 문제를 해결합니다. 사용자가 5분간 필터링, 확대, 선택을 거쳐 의미 있는 뷰에 도달하더라도, 탭을 닫거나 기본 URL만 공유하면 그 분석 작업은 전부 사라져버립니다. 북마크 / 상태 공유는 인터랙티브 상태를 이메일에 첨부하거나, 보고서에 삽입하거나, 슬랙에 게시하거나, 나중에 저장해둘 수 있는 하나의 정식 산출물로 만들어줍니다. 일시적인 탐색을 지속 가능한 발견으로 바꿔주는 것입니다.

구현 방식은 정교함의 정도에 따라 다양합니다. 가장 단순한 방식은 URL 해시 파라미터(#year=2020&region=Asia&zoom=4)에 상태를 인코딩하는 것으로, 서버가 필요 없지만 URL 길이 제한을 받습니다. 더 정교한 시스템은 서버 측 저장소를 사용합니다: 상태를 JSON으로 직렬화하여 짧은 ID와 함께 저장하고, 공유 가능한 URL에는 그 ID만 포함시킵니다. Tableau Server, Observable, 그리고 많은 커스텀 대시보드가 이 패턴을 지원합니다. 설계상의 과제는 어떤 상태를 직렬화할지 정하는 것입니다. 너무 적으면 공유된 뷰가 쓸모없어지고, (일시적인 호버 상태까지 포함해) 너무 많으면 URL이 취약해집니다.


## 작동 방식

- 사용자가 시각화를 설정합니다: 필터를 적용하고, 확대하고, 항목을 선택하고, 정렬하거나 파라미터를 조정합니다.
- 사용자가 "공유" 또는 "북마크" 버튼을 클릭하거나, 상태가 바뀔 때마다 URL이 자동으로 갱신됩니다.
- 시스템이 현재 상태를 직렬화합니다: 필터 값, 확대 변환, 정렬 컬럼/순서, 활성 선택 항목을 압축된 표현으로 변환합니다.
- 상태가 URL(쿼리 파라미터 또는 해시)로 인코딩되거나 짧은 ID와 함께 서버 측에 저장됩니다.
- 사용자는 URL을 클립보드에 복사(원클릭 복사)하거나 통합된 공유 메커니즘을 통해 공유합니다.
- 다른 사용자가 URL을 열면, 시스템이 인코딩된 상태를 파싱하여 시각화를 정확히 그 설정으로 복원합니다.
- 선택적으로 "저장된 뷰" 패널을 통해 사용자가 여러 개의 북마크된 상태에 이름을 붙이고 정리할 수 있습니다.

## 변형

- URL 해시 인코딩: 상태가 URL 프래그먼트(#filters=...)에 인코딩됩니다. 서버가 필요 없지만 URL 길이에 제한이 있습니다.
- URL 쿼리 파라미터 인코딩: 상태가 쿼리 파라미터(?year=2020&region=Asia)로 인코딩됩니다. 사용자가 보고 편집할 수 있습니다.
- 서버 저장 스냅샷: 상태가 JSON으로 직렬화되어 서버에 저장됩니다. 공유 가능한 URL은 짧습니다(예: /view/a3x9k). 큰 상태 객체도 지원합니다.
- 자동 갱신 URL: 사용자가 상호작용할 때마다(history.replaceState를 통해) URL이 실시간으로 갱신되므로, 어느 순간에든 주소창을 복사하면 현재 상태를 그대로 캡처합니다.
- 이름이 지정된 저장 뷰: 사용자가 여러 뷰에 이름을 붙여 저장(예: "3분기 지역별 매출")하고 드롭다운에서 전환할 수 있습니다.
- 임베드 코드 생성: 공유 가능한 출력물이 인코딩된 상태를 담은 HTML 임베드 스니펫(<iframe>)이 되어, 블로그나 보고서에 삽입할 수 있습니다.
- 스크린샷 + 상태: 북마크가 직렬화된 상태와 정적 스크린샷을 함께 캡처하여, 인터랙티브 버전이 로드되기 전 미리보기를 제공합니다.

## 코드 레퍼런스

```js
// Auto-updating URL state with history API
function serializeState() {
  return new URLSearchParams({
    year: currentYear,
    region: activeRegion || "",
    zoom: currentZoom.toFixed(2),
    sort: sortColumn,
    order: sortOrder,
  }).toString();
}

function restoreState() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("year")) setYear(+params.get("year"));
  if (params.get("region")) setRegion(params.get("region"));
  if (params.has("zoom")) setZoom(+params.get("zoom"));
  if (params.has("sort")) setSort(params.get("sort"), params.get("order"));
}

// Update URL on every interaction
function onStateChange() {
  const qs = serializeState();
  history.replaceState(null, "", `?${qs}`);
}

// Copy share link to clipboard
d3.select("#share-btn").on("click", () => {
  navigator.clipboard.writeText(window.location.href);
  d3.select("#share-btn").text("Copied!").transition()
    .delay(1500).text("Share");
});

// Restore state on page load
restoreState();
```
