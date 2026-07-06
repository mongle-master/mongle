# 코드 컨벤션 (backend)

> **어느 코드를 보든 같은 패턴이어야 한다.** AI·사람 모두 근접 코드를 하네스 삼아 다음 코드를 쓰기 때문에,
> 컨벤션 통일이 곧 품질의 재생산이다. 새 코드는 반드시 이 문서와 근접 코드의 패턴을 따른다.

## 1. 엔티티·연관관계

- **엔티티 간 참조는 id만.** JPA 연관관계 어노테이션(`@ManyToOne`·`@OneToMany`·`@ManyToMany`) 금지.
  단일 참조는 `xxxId: Long` 컬럼(예: `Event.categoryChipId`).
- **엔티티↔엔티티 다대다는 명시적 조인 엔티티**로 별도 테이블을 둔다. `@ElementCollection` 금지.
  - `PersonRelationTag(personId, chipId)` / `EventPerson(eventId, personId)` / `EventEmotion(eventId, chipId)`
  - 조인 엔티티 이름 = `{주엔티티}{연결대상}`, 순서 의미가 있으면 `displayOrder` 컬럼.
- **값 목록**(엔티티를 참조하지 않는 문자열 등: 취향·사진 URL)만 `@ElementCollection` 허용. `@OrderColumn`으로 순서 보존.
- 공통 규약: `BaseEntity`(auditing) / `SoftDeletableEntity`(deletedAt). 조인 엔티티는 하드삭제(행 삭제)가 기본 —
  소프트삭제는 사용자가 "지워도 과거 기록 유지"를 기대하는 대상(칩·인물·기록)에만.

## 2. 네이밍

| 대상 | 규칙 | 예 |
|---|---|---|
| 요청 DTO | `{도메인}{동작}Request` (동작 없으면 생략) | `PersonRequest`, `ChipCreateRequest` |
| 응답 DTO | `{자원}Response` | `PersonResponse`, `RelationMapResponse` |
| 응답 내부 조각 | 접미사 **`Dto` 금지**, 의미 있는 명사 | `Birthday`, `PersonStats`, `Intimacy` |
| 다른 도메인 요약 참조 | `{도메인}Ref` 하나로 공용화 (id+label / id+name) | `ChipRef`, `PersonRef` |
| Boolean | **is- 접두 없이** 서술 형용사/명사. 엔티티·DTO·JSON 동일 | `favorite`, `common`, `personal`, `distant`, `deleted` |
| enum | 클래스 `{의미}` + 값 UPPER_SNAKE | `ChipType.RELATION_TAG` |
| 서비스 레이어 | 역할 접미사 필수: `Service` / `Validator` / `Seeder` / `Calculator` | `IntimacyCalculator` |
| 순서 컬럼 | `displayOrder` | |
| 발생 시각 | `occurredDate` + `occurredTime?` | |

## 3. API

- 경로: **`/api/v1/{복수 자원}`** — 버전 프리픽스 필수 + kebab-case (`/api/v1/home/relation-map`). 하위 자원은 중첩(`/api/v1/persons/{id}/timeline`).
- 쿼리 파라미터: camelCase, 칩 id 필터는 `{종류}ChipIds`(예: `relationTagChipIds`, `categoryChipIds`), 검색어는 `query`, 정렬은 `sort`(enum UPPER).
- 다중 필터는 축 안 OR, 축 간 AND.
- 성공 응답은 봉투 없이 DTO 그대로, 에러는 `{code, message}` (§12.5 문구). 생성 201, 빈 단건 204.
- 컨트롤러는 위임만: 검증·조립은 서비스에.

## 4. 인증 (JWT)

- 유저 식별은 **JWT Bearer 토큰**에서만 얻는다: `Authorization: Bearer {token}`, HS256, claim `sub` = userId, claim `username` = 로그인 이름.
- 컨트롤러에서는 `@AuthUser user: UserPrincipal` 파라미터로 주입받는다(리졸버가 토큰 파싱·검증). `UserPrincipal(id, username)` 은 토큰 클레임만으로 구성 — 요청당 DB 조회 없음. 컨트롤러는 필요한 것(id·username)만 골라 쓰고, 서비스에는 `user.id` 를 넘긴다(서비스 시그니처는 id 기준).
- 토큰 없음/무효/username 클레임 누락 = 401 `UNAUTHORIZED`. 발급은 `POST /api/v1/auth/token` (데모: username만으로 발급).
- 고정 데모 유저 하드코딩 금지.

## 5. Swagger (springdoc)

- **모든** 컨트롤러: 클래스 `@Tag(name, description)`, 메서드 `@Operation(summary, description)`.
- **모든** DTO 필드: `@Schema(description, example)`. 에러 케이스는 `@ApiResponse`로 code·상황 명시.
- 설명은 한국어, PRD 용어 그대로(칩·기록·관계태그…). 문서 안 단 API는 리뷰에서 반려 대상.
- 접근 경로(무인증 고정): Swagger UI `/swagger-ui/index.html`, OpenAPI JSON `/v3/api-docs`.

## 6. 기타

- 주석: 코드로 표현 못 하는 암묵지·의도만(왜 이 임계값인지 등). PRD 중복 금지. (CLAUDE.md)
- 테스트 코드 금지 — mustpass 문서로 대체 ([testing.md](./testing.md)).
- 커밋: Conventional Commits, 헤더 `type(backend): 한국어 요약`, 이슈 연결 시 `(#N)` + 본문 `Closes #N`.
- 커밋 전 `./gradlew ktlintFormat compileKotlin` 통과 필수.
