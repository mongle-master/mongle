# 04. 홈 · 관계 대시보드 — mustpass

> 목적: 홈 도메인(#40~#43) 코드가 반드시 지켜야 할 불변식을 확정.
> 근거: (PRD 01-home §5 정책 · §6 엣지 · §7 데이터) = SSOT, (#40~#43) = 백엔드 이슈.
> 공통 계약(에러 포맷·소유 컨텍스트·소프트삭제)은 [00-infra.md](00-infra.md) 를,
> 파생 스탯(만남 고유 날짜)은 [02-person.md](02-person.md) §파생(#30) 을, 만남/기념일 카테고리 앵커는 [01-chip.md](01-chip.md) 를 그대로 소비한다.

## 관계 지도 구성 (must, #40)

- `GET /api/v1/home/relation-map` — 내 소유·active 인물만 대상. 응답 = `me`(중심 "나" 노드) + `nodes`(인물) + `edges`(나↔인물).
- **노드** = 인물: id·이름·프로필 사진·즐겨찾기·관계태그(id+라벨)·친밀도(#41). 관계태그 라벨은 칩 id 로 해석(소프트삭제 칩도 라벨 유지, [00-infra](00-infra.md)).
- **엣지** = 나↔각 인물 1개씩. 인물 간 연결은 PRD 미정의라 만들지 않는다. `distant` = 그 인물이 멀어진 관계인지(#41).
- **노드 정렬:** 즐겨찾기 먼저 → 이름 가나다(대소문자 무시) → id 오름차순(동명이인 타이브레이커). 그래프 표시 결정성을 위한 것(관계 점수화·서열화 아님).
- **콜드스타트(인물 0명):** `nodes`·`edges` 빈 배열, `me` 만. (필터·회고는 프론트가 미노출.)

## 친밀도·멀어진 관계 판정 (must, #41)

- 근거는 그 인물의 **만남 카테고리 고유 날짜**(`PersonStatsService.statsOf(person).meetingDatesDesc`) 하나뿐 — 만난 횟수·마지막 만남과 단일 근거를 공유한다.
- **판정 보류(UNKNOWN):** 고유 만남 날짜가 **2개 미만**이면 평소 주기를 알 수 없어 판정하지 않는다 → `distant` 아님. (아직 만남이 거의 없는 사람은 흐리게 하지 않는다 — PRD §5.)
- **평소 주기 기준:** 고유 만남 날짜 ≥2 면 연속 날짜 간격의 **평균**을 평소 주기로 본다. 마지막 만남 이후 경과일이 `평균 주기 × 2` 를 **초과**하면 `DISTANT`(멀어짐), 아니면 `NORMAL`.
- **임계값(암묵지·튜닝 지점):** `MIN_MEETINGS = 2`, `DISTANT_MULTIPLIER = 2.0`. 고정 기간이 아니라 사람별 평소 주기 기준(PRD §5).
- **즐겨찾기도 대상:** 즐겨찾기여도 `DISTANT` 판정은 동일하게 낸다(멀어진 소중한 사람을 다시 떠올리게). 강조 표시(테두리·★)는 프론트가 유지.
- 응답 친밀도 필드: `status`(UNKNOWN·NORMAL·DISTANT)·`averageIntervalDays`(주기 없으면 null)·`daysSinceLastMeet`(만남 없으면 null). `edge.distant == (status == DISTANT)`.

## 관계태그 필터 (must, #42)

- `GET /api/v1/home/relation-map?relationTagChipIds=1&relationTagChipIds=2` — 관계태그 chipId **다중 필터**.
- **합집합(OR):** 인물의 관계태그 중 **하나라도** 필터에 들면 포함(좁히기 아니라 넓혀 보기, PRD §5).
- **빈 필터 = 전체.** 필터로 빠진 인물은 노드·엣지에서 **제외**(숨김 — 흐린 표시는 멀어진 관계 전용이라 섞지 않는다).

## 1년 전 오늘 회고 (must, #43)

- `GET /api/v1/home/throwback` — 기록의 `occurredDate` 가 **정확히 1년 전(같은 월·일, 연도 = 올해−1)** 인 기록. 카드 문구가 "1년 전 오늘"이라 여러 해 전 기록은 대상이 아니다.
- **윤년 2/29:** 오늘이 2/29 여도 작년(비윤년)에는 2/29 기록이 존재할 수 없다 → 연도 필터로 자연히 **빈 결과**(PRD §5: 해당 연도에 없으면 미노출). 별도 분기 불필요.
- **복수면 1건 선정 우선순위:** ① 즐겨찾기 인물이 연결된 기록 → ② 사진 있는 기록 → ③ 카테고리가 `기념일` → ④ 그날 **이른 시각**(시간 없으면 뒤) → ⑤ 먼저 남긴 것(id 오름차순).
- **없으면 빈 결과** → `204 No Content`(프론트 플로팅 미노출).
- **응답 제목:** 사용자가 입력한 제목만 내린다(없으면 null). 자동 제목(#37)을 쓰지 않는다 — 회고 카드 폴백("함께한 순간")이 자동 제목과 다르기 때문(프론트가 null 을 폴백 처리).
- 응답: `eventId`·대표(첫) `personId`·`personName`·`title`(nullable)·`occurredDate`·대표 `photoUrl`(없으면 null).

## 계약·엣지 (표)

| 상황 | 입력 | 기대 결과 |
|---|---|---|
| 인물 0명 | GET /api/v1/home/relation-map | 200, nodes·edges 빈 배열, me 포함 |
| 만남 날짜 1개 이하 인물 | (관계 지도) | intimacy.status = UNKNOWN, edge.distant = false |
| 평균 주기 30일·마지막 만남 90일 전 | (관계 지도) | status = DISTANT (90 > 30×2) |
| 평균 주기 30일·마지막 만남 40일 전 | (관계 지도) | status = NORMAL (40 ≤ 60) |
| 태그 A·B 다중 선택 | ?relationTagChipIds=A&relationTagChipIds=B | A 또는 B 가진 인물 모두(OR) |
| 태그 필터 결과 0명 | (관계 지도) | 200, nodes·edges 빈 배열 |
| 1년 전 같은 월·일 기록 없음 | GET /api/v1/home/throwback | 204 No Content |
| 1년 전 오늘 복수 기록 | GET /api/v1/home/throwback | 200, 우선순위로 1건 |
| 오늘이 2/29·작년 비윤년 | GET /api/v1/home/throwback | 204 No Content |
| 기록 제목 미입력 | GET /api/v1/home/throwback | 200, title = null |

## 재사용 진입점 (열어둠)

- `IntimacyCalculator.of(meetingDatesDesc, today)` — 친밀도 판정 정책(#41). 임계값 상수는 `IntimacyCalculator`.
- `ChipService.anniversaryCategoryId()` — 회고 우선순위 ③(기념일) 판정용. `meetingCategoryId()` 와 동형(공통 칩 라벨 앵커).
</content>
