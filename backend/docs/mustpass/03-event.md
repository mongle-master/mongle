# 03. 기록(Event) — mustpass

> 목적: 기록 도메인(#32~#39) 코드가 반드시 지켜야 할 불변식을 확정.
> 근거: (PRD 04-record §4 필드·§6 엣지·§7 파생 · README §12.2 칩·§12.3 글자수·§12.4 날짜·§12.5 문구·§12.6 이미지) = SSOT.
> 공통 계약(에러 포맷·소유 컨텍스트·소프트삭제·한도·이미지)은 [00-infra.md](00-infra.md) 를,
> 칩 병합·종류 규칙은 [01-chip.md](01-chip.md) 를, 인물 소유·마지막 만남 진입점은 [02-person.md](02-person.md) 를 그대로 소비한다.

## 필드 · 소유 (must, #32)

- 기록은 **소유자(ownerId, 데모 사용자)** 에 귀속되고 **소프트삭제**(`deletedAt`)를 상속한다.
- 필드: 제목(선택·40자)·왜(선택·100자)·무엇을(선택·100자)·날짜(필수)·시간(선택)·카테고리(필수 1)·날씨(선택 0~1)·감정(선택 ≤5)·연결 인물(필수 ≥1)·사진(선택 ≤5).
- **언제 = 날짜(LocalDate, 필수) + 시간(LocalTime, nullable)**. 시간은 넣은 경우에만 의미.
- 칩·인물은 **id 참조**만 저장한다(라벨·이름 복사 안 함) — rename 하면 지난 기록에 저절로 반영(§12.2, [01-chip](01-chip.md)).

## 연결 인물 (must, #33)

- 기록↔인물 다대다는 **명시적 조인 엔티티**(`EventPerson`, id 참조·순서 보존)로 표현한다. 대표 인물 = **displayOrder 0**(첫 번째) 연결 인물.
- **최소 1명 필수.** 비면 400 `REQUIRED_FIELD` "함께한 사람을 한 명 이상 선택해 주세요.".
- 요청에 같은 인물 id 가 중복되면 **첫 등장 기준 1건으로 정규화**해 저장한다(대표 인물 = 정규화 후 첫 번째, displayOrder 재부여).
- **내 소유·active(미삭제) 인물만** 연결. 없거나·타인·삭제된 인물 id 가 섞이면 404 `NOT_FOUND`.
- 다중 연결 시 각 인물이 모두 파생 갱신 대상(아래 #36).

## 칩 연결 (must, #34)

- 감정: **다중 ≤5**(`EMOTION_PER_EVENT_MAX`). 초과면 400 `SELECTION_LIMIT` "감정은 최대 5개까지 고를 수 있어요."(PRD 04 §6).
- 요청에 같은 감정 칩 id 가 중복되면 **첫 등장 기준 1건으로 정규화**해 저장한다(개수 상한 판단도 정규화 이후 개수 기준).
- 날씨: **단일 0~1개**. 2개 이상은 애초에 단일 필드라 불가.
- 카테고리: **단일·필수**. 미지정이면 **기본 카테고리**(ChipService 사용자 시점 카테고리 목록의 첫 칩, 시드상 `만남`)로 채운다.
- 칩 id 는 그 사용자에게 **보이는 칩**(공통 안 숨김 + 개인 active)만 허용하고 **종류가 일치**해야 한다. 아니면 404 `NOT_FOUND`.
  (감정 자리에 날씨 칩, 없는 칩, 타인 개인 칩 → 모두 404 `NOT_FOUND`.)
- 소프트삭제된 칩을 참조한 **과거 기록 조회**는 라벨이 그대로 보인다([00-infra](00-infra.md) — 조회는 findAllById, active 필터 없음).

## 사진 (must, #35)

- 기록당 **최대 5장**(`EVENT_PHOTO_MAX`). 초과면 400 `SELECTION_LIMIT` "사진은 최대 5장까지 넣을 수 있어요."(PRD 04 §6).
- 미리 업로드된 경로(url) 참조 방식(`POST /api/v1/images`, 프로필 사진과 동일 컨벤션). **첨부 순서 보존**.

## 자동 제목 (must, #37)

- 제목은 선택. **미입력(공백 포함) 시 저장 값은 null** 이고, 조회 응답에서 계산해 내려준다.
  - 단일 인물: `{대표 이름} · {카테고리}`
  - 다중 인물: `{대표 이름} 외 N명 · {카테고리}` (N = 연결 인물 수 − 1)
- **조회 시 계산**(저장 확정 안 함) — 인물명·카테고리 라벨은 id 참조라 rename 이 지난 기록 제목에도 반영돼야 하기 때문(§12.2 철학과 일치).

## 날짜 검증 (must, #39 · §12.4)

- **미지정 시 오늘**로 채운다(기본값).
- **미래 불가** — 오늘보다 미래면 400 `FUTURE_DATE`. **과거는 허용**.
- 시간은 선택이며 날짜와 독립(시간만으로 미래 판정하지 않는다).

## 글자수 (must, §12.3)

| 대상 | 한도 | 초과 시 |
|---|---|---|
| 제목 | 40자(`EVENT_TITLE_MAX`) | 400 `LENGTH_EXCEEDED` "최대 40자까지 쓸 수 있어요." |
| 왜 | 100자(`WHY_MAX`) | 400 `LENGTH_EXCEEDED` |
| 무엇을 | 100자(`WHAT_MAX`) | 400 `LENGTH_EXCEEDED` |

- 빈 문자열·공백만인 제목/왜/무엇을은 **미입력으로 취급**(null 저장). 제목이 null 이면 자동 제목(#37).

## 생성 · 저장 후 파생 (must, #36 · §7)

- **최소 저장 조건 = 연결 인물 ≥1**. 나머지(제목·왜·무엇을·감정·날씨·사진·시간)는 전부 선택, 카테고리·날짜는 기본값 자동.
- 저장 후 연결된 **각 인물**의 파생값을 갱신한다:
  - **마지막 만남:** 카테고리가 `만남`인 기록이면 각 인물 `updateLastMetIfNewer(기록 날짜)`([02-person](02-person.md) 진입점). 더 최근일 때만 앞당긴다.
  - `만남` 앵커 = 공통 CATEGORY 칩 label `만남`(공통 칩은 rename·삭제 불가라 안정적 식별자).
  - **함께한 기록 수·만난 횟수**는 조회 시 계산(#30) — 여기서 저장하지 않는다.

## 단건 조회 · 수정 (must, #38)

- `GET /api/v1/events/{id}` — 수정 모드 재사용용 상세: 연결 인물(id+이름)·칩(id+라벨, 감정/날씨/카테고리)·사진·왜·무엇을·날짜·시간·(계산된)제목. 내 소유·active 만, 아니면 404 `NOT_FOUND`.
- `PUT /api/v1/events/{id}` — 등록과 **동일 검증**으로 전체 수정. 칩·인물·사진은 보낸 값으로 **교체**. 내 소유·active 만, 아니면 404 `NOT_FOUND`.
- **수정 파생 일관성 한계(의도적):** 수정으로 만남 날짜가 **더 과거로** 바뀌어도 인물의 `마지막 만남`을 **되돌리지 않는다**(updateLastMetIfNewer 는 전진만). #30 파생 계산이 조회 시 이벤트 기준으로 다시 계산하므로 여기서 역계산까지 하지 않는다(과설계 회피).

## 계약 · 엣지 (표)

| 상황 | 입력 | 기대 결과 |
|---|---|---|
| 연결 인물 0명 | POST /api/v1/events | 400 `REQUIRED_FIELD` "함께한 사람을 한 명 이상 선택해 주세요." |
| 타인/없는/삭제된 인물 id | POST /api/v1/events | 404 `NOT_FOUND` |
| 인물 1명만·나머지 미입력 | POST /api/v1/events | 201, 카테고리=만남·날짜=오늘·제목 자동 |
| 제목 41자 | POST /api/v1/events | 400 `LENGTH_EXCEEDED` |
| 왜/무엇을 101자 | POST /api/v1/events | 400 `LENGTH_EXCEEDED` |
| 감정 6개 | POST /api/v1/events | 400 `SELECTION_LIMIT` "감정은 최대 5개까지 고를 수 있어요." |
| 사진 6장 | POST /api/v1/events | 400 `SELECTION_LIMIT` "사진은 최대 5장까지 넣을 수 있어요." |
| 감정 자리에 날씨 칩 id | POST /api/v1/events | 404 `NOT_FOUND` |
| 없는·타인 칩 id | POST /api/v1/events | 404 `NOT_FOUND` |
| 카테고리 미지정 | POST /api/v1/events | 201, 기본 카테고리(만남) |
| 날짜 미지정 | POST /api/v1/events | 201, 오늘 |
| 날짜 = 내일 | POST /api/v1/events | 400 `FUTURE_DATE` |
| 날짜 = 과거 | POST /api/v1/events | 201 |
| 만남 기록 저장(날짜 최신) | POST /api/v1/events | 201, 각 인물 마지막 만남 = 기록 날짜 |
| 만남 기록 저장(날짜 과거) | POST /api/v1/events | 201, 인물 마지막 만남 불변 |
| 제목 미입력·단일 인물 | GET /api/v1/events/{id} | title = `{이름} · {카테고리}` |
| 제목 미입력·3명 | GET /api/v1/events/{id} | title = `{대표 이름} 외 2명 · {카테고리}` |
| 인물/칩 rename 후 조회 | GET /api/v1/events/{id} | 바뀐 이름·라벨로 보임(id 참조) |
| 타인/없는 기록 조회·수정 | GET·PUT /api/v1/events/{id} | 404 `NOT_FOUND` |
| 소프트삭제된 칩 참조 조회 | GET /api/v1/events/{id} | 라벨 값 그대로([00-infra](00-infra.md)) |

## 후속 에이전트가 소비하는 EventRepository 쿼리 (열어둠)

- `findByIdAndOwnerIdAndDeletedAtIsNull(id, ownerId)` — 단건.
- `findByOwnerIdAndDeletedAtIsNullOrderByOccurredDateDescIdDesc(ownerId)` — 전역 타임라인(#44~46).
- `findByPersonId(personId)` — 사람별 피드(#44).
- `findByPersonIdAndCategoryChipId(personId, categoryChipId)` — 카테고리 필터(#46).
- `countByPersonId(personId)` — 함께한 기록 수(#30).
- `countDistinctOccurredDateByPersonIdAndCategoryChipId(personId, categoryChipId)` — 만난 횟수(#30, 만남 카테고리 고유 날짜 수).
- `findByPersonIdAndOccurredDateBetween(personId, from, to)` — 날짜 범위(#41 친밀도).
- `findByOwnerIdAndMonthDay(ownerId, month, day)` — 1년 전 오늘 회고(#43, 같은 월·일).

> 인물별 쿼리는 `EventPerson` 조인 엔티티 JOIN(JPQL) 기반이다 — 파생·홈·타임라인이 이 진입점을 확장한다.
