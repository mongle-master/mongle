# 00. 인프라 — mustpass

> 목적: 전 도메인이 공유하는 공통 기반(에러 포맷·소프트삭제·검증 한도·소유 컨텍스트·이미지)의 불변식을 확정.
> 근거: (PRD README §12) = SSOT, (#8~#12) = 백엔드 인프라 이슈.
> 후속 도메인 에이전트(chip/person/event/home/timeline)는 이 파일의 계약을 그대로 소비한다.

## 불변식 (must)

- 모든 에러 응답 바디는 `{ "code": string, "message": string }` (ErrorResponse) 형식이다.
- 성공 응답은 봉투로 감싸지 않는다 — 도메인 DTO를 그대로 반환한다(기존 Sample 컨벤션).
- `message` 는 사용자에게 그대로 보여줄 수 있는 §12.5 문구다(개발자 문구·스택트레이스 금지).
- 소프트삭제된 라벨(칩 등)은 **선택 목록에서만** 빠지고, 이미 그 라벨을 참조하는 과거 기록에는 값이 남는다.
- 소유 컨텍스트: `ownerId == null` 이면 공통(모든 사용자 공유), `ownerId == 그 사용자 id`면 개인.
  선택 목록 = 공통 + 그 사용자 개인.
- 사용자 식별은 **JWT Bearer 토큰**에서만 온다(고정 데모 사용자 하드코딩 없음). 아래 인증 절 참조.
- 글자수·개수 한도를 넘기면 저장하지 않고 §12.5 문구로 거절한다.
- 업로드 이미지는 각 10MB 이하, 확장자 jpg·jpeg·png·heic·webp 만 허용한다.

## 에러 코드 ↔ 상태 ↔ 문구 (§12.5 매핑)

| ErrorCode | HTTP | 기본 message | 트리거 |
|---|---|---|---|
| `INVALID_INPUT` | 400 | 잘못된 입력입니다. | @Valid 실패 등 일반 |
| `REQUIRED_FIELD` | 400 | (필드별 override) "이름을 입력해 주세요." / "칩 이름을 입력해 주세요." | 필수 누락 |
| `LENGTH_EXCEEDED` | 400 | 최대 {N}자까지 쓸 수 있어요. | 글자수 초과 |
| `DUPLICATE` | 409 | 이미 있는 항목이에요. | 같은 종류 내 중복 |
| `FUTURE_DATE` | 400 | 오늘보다 미래일 수는 없어요. | 미래 날짜 |
| `DATE_ORDER` | 400 | 마지막 만난 날은 처음 만난 날 이후여야 해요. | 날짜 순서 오류 |
| `SELECTION_LIMIT` | 400 | 선택할 수 있는 최대 개수를 넘었어요. | 감정 5 / 관계태그 10 등 선택 상한 |
| `CHIP_LIMIT` | 400 | 칩은 종류별로 최대 30개까지 만들 수 있어요. | 개인 칩 종류별 상한 |
| `CATEGORY_REQUIRED` | 400 | 카테고리는 최소 1개가 필요해요. | 카테고리 마지막 1개 삭제 시 |
| `UNAUTHORIZED` | 401 | 로그인이 필요해요. | 토큰 없음·형식 오류·서명/만료 무효 |
| `NOT_FOUND` | 404 | 리소스를 찾을 수 없습니다. | 없는 리소스 조회 |
| `UNSUPPORTED_IMAGE_TYPE` | 400 | jpg·png·heic·webp 이미지만 올릴 수 있어요. | 허용 외 확장자 |
| `IMAGE_TOO_LARGE` | 400 | 이미지는 각 10MB 이하만 올릴 수 있어요. | 10MB 초과 |
| `SAVE_FAILED` | 500 | 저장에 실패했어요. 잠시 후 다시 시도해 주세요. | 저장 실패 |
| `INTERNAL_ERROR` | 500 | 서버 오류가 발생했습니다. | 예기치 못한 예외 |

## 인증 (JWT)

- 발급: `POST /api/v1/auth/token` body `{ "username": string }` → `{ token, userId, username }`.
  데모 로그인이라 비밀번호가 없다 — 없는 username 이면 사용자를 만들어 발급한다.
- 사용: 이후 모든 보호 API 는 `Authorization: Bearer {token}` 를 보낸다. HS256, claim `sub` = userId 문자열, claim `username` = 로그인 이름.
- 주입: 컨트롤러가 `@AuthUser user: UserPrincipal` 을 받으면 리졸버가 헤더의 토큰을 파싱·검증해 채운다.
  `UserPrincipal(id, username)` 은 토큰 클레임만으로 구성 — 요청당 DB 조회 없음. 컨트롤러는 id·username 중 필요한 것만 골라 쓴다.
  이 파라미터를 쓰는 엔드포인트만 토큰을 요구한다(별도 보안 필터 없음).
- 무인증 경로(토큰 불요): `/api/v1/auth/**`, `/actuator/**`, 정적 이미지 서빙(`/images/**`), 스웨거(`/swagger-ui/**`, `/v3/api-docs/**`).
  이들은 `@AuthUser` 를 받지 않아 자연히 열린다.
- 실패: 토큰 없음·Bearer 형식 아님·서명/만료/형식 무효·username 클레임 없는 옛 토큰은 모두 401 `UNAUTHORIZED` "로그인이 필요해요." (옛 토큰은 재로그인 한 번으로 새 토큰을 받아 해소).
- 데모 사용자 시드: username `demo` 를 만들어 그 id 로 시드 인물·기록을 소유한다(고정 id 하드코딩 없음).

| 상황 | 입력 | 기대 결과 |
|---|---|---|
| 토큰 없이 보호 API | GET /api/v1/persons | 401 `UNAUTHORIZED` |
| 데모 로그인 | POST /api/v1/auth/token `{"username":"demo"}` | 200 `{ token, userId, username }` |
| 발급 토큰으로 조회 | GET /api/v1/persons + Bearer | 200, demo 소유 시드 인물 목록 |

## 검증 한도 (ValidationLimits) — §12.3 / §12.2 / §12.6

| 상수 | 값 | 대상 |
|---|---|---|
| `NAME_MAX` / `RELATION_TYPE_MAX` | 20 | 인물 이름 / 관계 유형 |
| `CHIP_NAME_MAX` | 10 | 칩·태그 이름 |
| `EVENT_TITLE_MAX` | 40 | 기록 제목 |
| `PREFERENCE_ITEM_MAX` | 30 | 좋아하는 것 / 조심할 것(각 항목) |
| `WHY_MAX` / `WHAT_MAX` | 100 | 왜 / 무엇을(각) |
| `CHIP_PER_KIND_MAX` | 30 | 개인 칩 종류별 개수 |
| `EMOTION_PER_EVENT_MAX` | 5 | 기록당 감정 |
| `RELATION_TAG_PER_PERSON_MAX` | 10 | 인물당 관계태그 |
| `PREFERENCE_LIST_MAX` | 20 | 좋아하는 것 / 조심할 것(각 목록) |
| `EVENT_PHOTO_MAX` | 5 | 기록 사진 |
| `PROFILE_PHOTO_MAX` | 1 | 프로필 사진 |

## 계약·엣지 (표로 상세)

| 상황 | 입력 | 기대 결과 |
|---|---|---|
| 이름 21자 | 인물 저장 | 400 `LENGTH_EXCEEDED` "최대 20자까지 쓸 수 있어요." |
| 처음 만난 날 = 내일 | 인물 저장 | 400 `FUTURE_DATE` |
| 마지막 만난 날 < 처음 만난 날 | 인물 저장 | 400 `DATE_ORDER` |
| 같은 종류 칩 이름 중복 | 칩 생성 | 409 `DUPLICATE` |
| 개인 칩 31번째 생성 | 칩 생성 | 400 `CHIP_LIMIT` |
| 감정 6개 선택 | 기록 저장 | 400 `SELECTION_LIMIT` |
| 12MB png 업로드 | POST /api/v1/images | 400 `IMAGE_TOO_LARGE` |
| gif 업로드 | POST /api/v1/images | 400 `UNSUPPORTED_IMAGE_TYPE` |
| jpg 업로드 | POST /api/v1/images | 201 `{ url }`, urlPath 로 정적 서빙됨 |
| 소프트삭제된 칩 참조 기록 조회 | GET 기록 | 라벨 값이 그대로 보인다 |

## 후속 에이전트 사용법 (재사용 진입점)

- 서비스 계층 검증: `com.mongle.common.Validators` (length/required/notFuture/dateOrder/selectionCount/chipKindCount).
- 글자수: 서비스에서 `Validators.maxLength(value, ValidationLimits.X)` — **DTO `@field:Size` 금지**(@Valid 실패가 INVALID_INPUT 으로 뭉개져 LENGTH_EXCEEDED 를 잃음).
- 현재 사용자: 컨트롤러 파라미터 `@AuthUser user: UserPrincipal` (id·username 자유 선택, JWT Bearer 토큰에서 해석 — 위 인증 절). 서비스에는 `user.id` 를 넘긴다.
- 이미지: `ImageStorageService.store(file): StoredImage(filename, url)` — 용도별 개수는 도메인이 강제.
- 소프트삭제 엔티티: `com.mongle.domain.SoftDeletableEntity` 상속 → `softDelete()` / `deleted`.
