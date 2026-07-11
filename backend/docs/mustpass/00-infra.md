# 00. 인프라 — mustpass

> 목적: 전 도메인이 공유하는 공통 기반(에러 포맷·소프트삭제·검증 한도·소유 컨텍스트·이미지)의 불변식을 확정.
> 근거: (PRD README §12) = SSOT, (#8~#12) = 백엔드 인프라 이슈.
> 후속 도메인 에이전트(chip/person/event/home/timeline)는 이 파일의 계약을 그대로 소비한다.

## 불변식 (must)

- 모든 에러 응답 바디는 `{ "code": string, "message": string }` (ErrorResponse) 형식이다.
- 성공 응답은 봉투로 감싸지 않는다 — 도메인 DTO를 그대로 반환한다(기존 Sample 컨벤션).
- `message` 는 사용자에게 그대로 보여줄 수 있는 §12.5 문구다(개발자 문구·스택트레이스 금지).
- 소프트삭제된 라벨(칩 등)은 **선택 목록에서만** 빠지고, 이미 그 라벨을 참조하는 과거 기록에는 값이 남는다.
- 소유 컨텍스트: 사용자 id 와 `ownerId` 는 UUID 다. `ownerId == null` 이면 공통(모든 사용자 공유), `ownerId == 그 사용자 id`면 개인.
  선택 목록 = 공통 + 그 사용자 개인.
- 사용자 식별은 **JWT Bearer 토큰**에서만 온다(고정 데모 사용자 하드코딩 없음). 아래 인증 절 참조.
- 글자수·개수 한도를 넘기면 저장하지 않고 §12.5 문구로 거절한다.
- 업로드 이미지는 각 10MB 이하, JPEG·PNG·WebP만 허용한다. Vercel Blob 클라이언트 토큰과 프론트 사전 검증에 같은 제한을 둔다.
- 배포(`prod` 프로필)는 `MONGLE_JWT_SECRET`·DB 접속(`SPRING_DATASOURCE_*`)을 환경변수로 필수 요구한다.
- CORS 는 전 오리진 허용이다 — 프론트는 어느 오리진(로컬 dev·배포 도메인)에서든 API 를 직접 호출할 수 있다. 인증이 쿠키가 아닌 Authorization 헤더 기반이라 크리덴셜 없는 와일드카드가 안전하다(`WebConfig`).

## 에러 코드 ↔ 상태 ↔ 문구 (§12.5 매핑)

| ErrorCode           | HTTP | 기본 message                                                                                                                                                                                                                                                          | 트리거                                                                                                                                    |
| ------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `INVALID_INPUT`     | 400  | 잘못된 입력입니다.                                                                                                                                                                                                                                                    | @Valid 실패·본문 파싱 실패·타입 불일치(쿼리/경로/필드)·필수 쿼리 파라미터·파트 누락 등 일반 — 클라이언트 입력 오류는 500 으로 새지 않는다 |
| `REQUIRED_FIELD`    | 400  | (필드별 override) "이름을 입력해 주세요." / "칩 이름을 입력해 주세요."                                                                                                                                                                                                | 필수 누락(본문 필수 필드 `name`·`label`·`username` 파싱 누락 포함 — 필드별 문구 매핑)                                                     |
| `LENGTH_EXCEEDED`   | 400  | 최대 {N}자까지 쓸 수 있어요.                                                                                                                                                                                                                                          | 글자수 초과                                                                                                                               |
| `DUPLICATE`         | 409  | 이미 있는 항목이에요.                                                                                                                                                                                                                                                 | 같은 종류 내 중복                                                                                                                         |
| `FUTURE_DATE`       | 400  | 오늘보다 미래일 수는 없어요.                                                                                                                                                                                                                                          | 미래 날짜                                                                                                                                 |
| `DATE_ORDER`        | 400  | 마지막 만난 날은 처음 만난 날 이후여야 해요.                                                                                                                                                                                                                          | 날짜 순서 오류                                                                                                                            |
| `SELECTION_LIMIT`   | 400  | (상황별 override, PRD 02 §7·04 §6) 감정 "감정은 최대 5개까지 고를 수 있어요." / 사진 "사진은 최대 5장까지 넣을 수 있어요." / 관계태그 "관계 태그는 최대 10개까지 담을 수 있어요." / 취향 "최대 20개까지 담을 수 있어요." (기본: 선택할 수 있는 최대 개수를 넘었어요.) | 감정 5 / 사진 5 / 관계태그 10 / 취향 20 등 선택 상한                                                                                      |
| `CHIP_LIMIT`        | 400  | 칩은 종류별로 최대 30개까지 만들 수 있어요.                                                                                                                                                                                                                           | 개인 칩 종류별 상한                                                                                                                       |
| `CATEGORY_REQUIRED` | 400  | 카테고리는 최소 1개가 필요해요.                                                                                                                                                                                                                                       | 카테고리 마지막 1개 삭제 시                                                                                                               |
| `UNAUTHORIZED`      | 401  | 로그인이 필요해요.                                                                                                                                                                                                                                                    | 토큰 없음·형식 오류·서명/만료 무효                                                                                                        |
| `NOT_FOUND`         | 404  | 리소스를 찾을 수 없습니다.                                                                                                                                                                                                                                            | 없는 리소스 조회                                                                                                                          |
| `INTERNAL_ERROR`    | 500  | 서버 오류가 발생했습니다.                                                                                                                                                                                                                                             | 예기치 못한 예외                                                                                                                          |

## 인증 (JWT)

- 발급: `POST /api/v1/auth/token` body `{ "userId": UUID, "username": string }` → `{ token, userId, username, profileSetupCompleted }`.
  비밀번호가 없는 데모 인증이다. 없는 `userId`면 요청의 UUID와 이름으로 사용자를 만들고, 이후에는 같은 UUID로 토큰을 재발급한다.
  사용자 식별자는 UUID이며 username은 중복 가능한 표시 이름이다.
- 사용: 이후 모든 보호 API 는 `Authorization: Bearer {token}` 를 보낸다. HS256, claim `sub` = userId 문자열, claim `username` = 로그인 이름.
- 주입: 컨트롤러가 `@AuthUser user: UserPrincipal` 을 받으면 리졸버가 헤더의 토큰을 파싱·검증해 채운다.
  `UserPrincipal(id, username)` 은 토큰 클레임만으로 구성 — 요청당 DB 조회 없음. 컨트롤러는 id·username 중 필요한 것만 골라 쓴다.
  이 파라미터를 쓰는 엔드포인트만 토큰을 요구한다(별도 보안 필터 없음).
- 무인증 경로(토큰 불요): `/api/v1/auth/**`, `/actuator/**`, 스웨거(`/swagger-ui/**`, `/v3/api-docs/**`).
  `POST /api/v1/images/upload-permission`은 Vercel Blob 함수가 업로드 토큰 발급 전에 호출하는 보호 API다.
- 실패: 토큰 없음·Bearer 형식 아님·서명/만료/형식 무효·username 클레임 없는 옛 토큰은 모두 401 `UNAUTHORIZED` "로그인이 필요해요." (옛 토큰은 재로그인 한 번으로 새 토큰을 받아 해소).
- refresh token 은 사용하지 않는다. 프론트는 로컬에 저장한 UUID로 앱 시작마다 access token 을 재발급한다.
- 최초 프로필: `PATCH /api/v1/users/me/profile` + Bearer 토큰. `{ profileImageUrl, gender }`를 사용자에 저장하고 `profileSetupCompleted`를 완료 처리한다. 빈 요청은 건너뛰기로 처리한다.
  기존 사용자 행의 `profileSetupCompleted == null`은 완료 상태로 해석해 온보딩을 다시 노출하지 않는다.
- 사용자 시드: `POST /api/v1/seed` + Bearer 토큰. `User.demoSeeded`가 false인 사용자에게만 데모 데이터를 만들고 완료 후 true로 바꾼다.
  사용자가 인물을 모두 삭제해도 다시 시드하지 않으며, 생성 도중 실패하면 전체 트랜잭션과 완료 표시를 함께 롤백한다.
  같은 사용자의 동시 요청은 사용자 행 잠금으로 직렬화해 중복 생성을 막는다.

| 상황                 | 입력                                                                                                              | 기대 결과                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 토큰 없이 보호 API   | GET /api/v1/persons                                                                                               | 401 `UNAUTHORIZED`                                              |
| 최초 인증            | POST /api/v1/auth/token `{"userId":"UUID","username":"성빈"}`                                                     | 200 `{ token, userId, username, profileSetupCompleted: false }` |
| 최초 프로필 설정     | PATCH /api/v1/users/me/profile `{"profileImageUrl":"/default-people/person-male-1.png","gender":"MALE"}` + Bearer | 200, 프로필 저장 및 설정 완료                                   |
| 최초 프로필 건너뛰기 | PATCH /api/v1/users/me/profile `{}` + Bearer                                                                      | 200, 빈 프로필로 설정 완료                                      |
| 사용자 시드          | POST /api/v1/seed + Bearer                                                                                        | 204, 사용자별 최초 1회만 데모 데이터 생성                       |
| 발급 토큰으로 조회   | GET /api/v1/persons + Bearer                                                                                      | 200, 현재 사용자 소유 인물 목록                                 |

## 검증 한도 (ValidationLimits) — §12.3 / §12.2 / §12.6

| 상수                             | 값  | 대상                             |
| -------------------------------- | --- | -------------------------------- |
| `NAME_MAX` / `RELATION_TYPE_MAX` | 20  | 인물 이름 / 관계 유형            |
| `CHIP_NAME_MAX`                  | 10  | 칩·태그 이름                     |
| `EVENT_TITLE_MAX`                | 40  | 기록 제목                        |
| `PREFERENCE_ITEM_MAX`            | 30  | 좋아하는 것 / 조심할 것(각 항목) |
| `MEMO_MAX`                       | 200 | 메모                             |
| `CHIP_PER_KIND_MAX`              | 30  | 개인 칩 종류별 개수              |
| `EMOTION_PER_EVENT_MAX`          | 5   | 기록당 감정                      |
| `RELATION_TAG_PER_PERSON_MAX`    | 10  | 인물당 관계태그                  |
| `PREFERENCE_LIST_MAX`            | 20  | 좋아하는 것 / 조심할 것(각 목록) |
| `EVENT_PHOTO_MAX`                | 5   | 기록 사진                        |
| `PROFILE_PHOTO_MAX`              | 1   | 프로필 사진                      |

## 계약·엣지 (표로 상세)

| 상황                           | 입력                                  | 기대 결과                                                   |
| ------------------------------ | ------------------------------------- | ----------------------------------------------------------- |
| 이름 21자                      | 인물 저장                             | 400 `LENGTH_EXCEEDED` "최대 20자까지 쓸 수 있어요."         |
| 처음 만난 날 = 내일            | 인물 저장                             | 400 `FUTURE_DATE`                                           |
| 마지막 만난 날 < 처음 만난 날  | 인물 저장                             | 400 `DATE_ORDER`                                            |
| 같은 종류 칩 이름 중복         | 칩 생성                               | 409 `DUPLICATE`                                             |
| 개인 칩 31번째 생성            | 칩 생성                               | 400 `CHIP_LIMIT`                                            |
| 감정 6개 선택                  | 기록 저장                             | 400 `SELECTION_LIMIT` "감정은 최대 5개까지 고를 수 있어요." |
| 토큰 없이 업로드 권한 확인     | POST /api/v1/images/upload-permission | 401 `UNAUTHORIZED`                                          |
| 발급 토큰으로 업로드 권한 확인 | POST /api/v1/images/upload-permission | 200                                                         |
| 소프트삭제된 칩 참조 기록 조회 | GET 기록                              | 라벨 값이 그대로 보인다                                     |

## 후속 에이전트 사용법 (재사용 진입점)

- 서비스 계층 검증: `com.mongle.common.Validators` (length/required/notFuture/dateOrder/selectionCount/chipKindCount).
- 글자수: 서비스에서 `Validators.maxLength(value, ValidationLimits.X)` — **DTO `@field:Size` 금지**(@Valid 실패가 INVALID_INPUT 으로 뭉개져 LENGTH_EXCEEDED 를 잃음).
- 현재 사용자: 컨트롤러 파라미터 `@AuthUser user: UserPrincipal` (id·username 자유 선택, JWT Bearer 토큰에서 해석 — 위 인증 절). 서비스에는 `user.id` 를 넘긴다.
- 이미지: 브라우저가 Vercel Blob으로 직접 업로드하고 반환된 절대 URL을 프로필·기록 API에 전달한다. 백엔드는 URL과 용도별 개수만 관리한다.
- 소프트삭제 엔티티: `com.mongle.domain.SoftDeletableEntity` 상속 → `softDelete()` / `deleted`.
