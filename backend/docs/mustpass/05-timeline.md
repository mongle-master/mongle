# 05. 타임라인(Timeline) — mustpass

> 목적: 타임라인 조회(#44 사람별 피드·#45 활동 흐름·#46 전체 타임라인) 코드가 반드시 지켜야 할 불변식을 확정.
> 근거: (PRD 03-timeline §2·§3·§4·§7 · 05-my-timeline §2·§3·§4 · README §12.4 날짜·§12.5 문구) = SSOT.
> 공통 계약(소유·소프트삭제·에러 포맷)은 [00-infra.md](00-infra.md), 칩 앵커·병합은 [01-chip.md](01-chip.md),
> 인물 소유·대표 규칙은 [02-person.md](02-person.md), 카드 필드·자동 제목(#37)은 [03-event.md](03-event.md) 를 그대로 소비한다.

## 공통 (must)

- 조회는 **내 소유·active(deletedAt IS NULL)** 만 본다. 소프트삭제된 기록은 어떤 타임라인에도 안 나온다.
- **소프트삭제된 칩·인물**을 참조한 과거 기록은 **라벨·이름이 그대로 보인다**(findAllById, [00-infra](00-infra.md)).
- 카드 표시 필드·**자동 제목(#37)**·언제(날짜+선택 시간)는 [03-event.md](03-event.md) 규칙을 그대로 쓴다 — 여기서 다시 정의하지 않는다(제목 규칙 drift 방지 위해 `EventResponse` 재사용).
- 정렬 방향은 **최신 → 과거**: `occurredDate DESC, id DESC`. 같은 날은 나중에 저장된 기록(id 큰 쪽)이 위 — "같은 날은 나중 일이 위로"의 근사.

## #44 사람별 피드 (must)

- `GET /api/persons/{personId}/timeline` — 그 인물에 연결된 모든 기록(대표/비대표 무관)을 최신순.
- **인물 소유·active 아니면 404 `NOT_FOUND`** (없는·타인·삭제된 personId).
- 카드 = [03-event.md](03-event.md)의 `EventResponse`(제목·카테고리·언제·왜/무엇을·감정·사진·연결 인물). 자동 제목·rename 반영 동일.
- **카테고리 필터**(선택, `categoryChipIds` 다중): 여러 개 = **합집합(OR)**, 하나라도 맞으면 노출. 미지정이면 전체. **필터는 목록에만** 적용.

## #45 활동 흐름 집계 (must)

- `GET /api/persons/{personId}/activity-flow` — 인물 소유·active 아니면 404.
- **레인 3종**: `MEETING`·`CONTACT`·`MEMORY` = 공통 카테고리 `만남`·`연락`·`기념일`. (근거: PRD 03 §4 — 만남/연락/추억 레인, 추억 = 기념일.)
- **`기타`·사용자 추가 카테고리는 제외**(PRD 03 §4·§7 — 기본 차트에 넣지 않음). 목록(#44)에만 노출.
- **가로축 = 월, 최근 6개월**(현재월 포함, 과거→현재 순). (PRD 03 §4 기본 6개월.)
- 각 (월, 레인) 값은 **유무 boolean** — 그 달 그 레인 기록 **1건 이상이면 true**, 아니면 false. **횟수·강도는 담지 않는다**(관계 점수화 금지, §12.5).
- **`hasAnyActivity`**: 전 기간(윈도 밖 포함) 3레인 기록이 하나라도 있으면 true. 차트를 감출지("기록 전무") vs "최근 6개월은 조용했어요" 판정 근거.
- 레인 앵커(만남/연락/기념일)는 **공통 카테고리 칩 라벨**로 해석. 앵커 칩이 없으면(방어) 그 레인은 전부 false.

## #46 전체 타임라인 (must)

- `GET /api/timeline` — 내 전 인물 통합 연대기, 최신순.
- **월 단위 그룹**: `YYYY년 M월` 헤더로 묶고 그룹도 카드도 최신 → 과거. 응답은 `groups[]`(각 `year`·`month`·`label`·`cards[]`).
- 카드에 **연결된 사람들** 포함 — 아바타(profileImageUrl)·이름·favorite. **대표 = 즐겨찾기 → 가나다 우선 1인**(PRD 05 §4)으로 정렬해 `persons[0]` 가 대표, `외 (N-1)명`. (자동 제목(#37)의 대표=첫 연결 인물과는 별개 규칙.)
- **카테고리 필터**(`categoryChipIds` 다중 OR)·**사람 필터**(`personIds` 다중 OR). 두 축은 **교집합(AND)**. **필터는 목록에만** 적용.

## 계약 · 엣지 (표)

| 상황 | 입력 | 기대 결과 |
|---|---|---|
| 없는·타인·삭제된 personId | GET /api/persons/{id}/timeline | 404 `NOT_FOUND` |
| 연결 기록 없음 | GET /api/persons/{id}/timeline | 200, 빈 리스트 |
| 카테고리 2개 필터 | GET .../timeline?categoryChipIds=a,b | 두 카테고리 합집합 |
| 인물/칩 rename 후 | GET .../timeline | 바뀐 이름·라벨로 보임(id 참조) |
| 소프트삭제 칩 참조 기록 | GET .../timeline | 라벨 그대로 |
| 없는·타인·삭제된 personId | GET .../activity-flow | 404 `NOT_FOUND` |
| 만남 1건(이번 달) | GET .../activity-flow | 이번 달 MEETING=true, 나머지 false |
| 기타 카테고리만 존재 | GET .../activity-flow | 3레인 전부 false, hasAnyActivity=false |
| 6개월 밖 만남만 존재 | GET .../activity-flow | 윈도 전부 false, hasAnyActivity=true |
| 전 기록 조회 | GET /api/timeline | 최신순, 월 그룹, 카드에 연결 사람 |
| 카테고리+사람 동시 필터 | GET /api/timeline?categoryChipIds=a&personIds=1 | (a) AND (인물1) |
| 다인 연결 카드 | GET /api/timeline | persons 대표(즐겨찾기→가나다) 우선, 외 N명 |
</content>
