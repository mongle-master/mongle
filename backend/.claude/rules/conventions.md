# 코드 컨벤션 (backend)

> **어느 코드를 보든 같은 패턴이어야 한다.** AI·사람 모두 근접 코드를 하네스 삼아 다음 코드를 쓰기 때문에,
> 컨벤션 통일이 곧 품질의 재생산이다. 새 코드는 반드시 이 문서와 근접 코드의 패턴을 따른다.

## 1. Prisma 모델·연관관계

- **모델 간 참조는 id 컬럼이 기본**이다. 단일 참조는 `xxxId: BigInt`로 유지한다(예: `Event.categoryChipId`).
- **다대다는 명시적 조인 모델**로 표현한다.
  - `PersonRelationTag(personId, chipId)` / `EventPerson(eventId, personId)` / `EventEmotion(eventId, chipId)`
  - 조인 모델 이름 = `{주모델}{연결대상}`, 순서 의미가 있으면 `displayOrder` 컬럼.
- 문자열 값 목록도 기존 물리 테이블을 그대로 매핑한다: `PersonLike`·`PersonCaution`·`EventPhoto`. 순서는 `itemOrder`·`photoOrder`로 보존한다.
- Prisma relation은 기존 DB에 실제 FK가 있는 모델에만 선언한다. 아직 없는 FK·cascade를 편의를 위해 추가하지 않는다.
- `createdAt`·`updatedAt`은 기존 nullable `datetime(6)`을 그대로 매핑하고 서비스가 쓰기 시점에 KST 벽시각을 넣는다.
- 조인 행은 하드삭제가 기본이다. 소프트삭제(`deletedAt`)는 사용자가 "지워도 과거 기록 유지"를 기대하는 칩·인물·기록에만 적용한다.

## 2. 네이밍

| 대상 | 규칙 | 예 |
|---|---|---|
| 요청 DTO | `{도메인}{동작}Request` (동작 없으면 생략) | `PersonRequest`, `ChipCreateRequest` |
| 응답 DTO | `{자원}Response` | `PersonResponse`, `RelationMapResponse` |
| 응답 내부 조각 | 접미사 **`Dto` 금지**, 의미 있는 명사 | `Birthday`, `PersonStats`, `Intimacy` |
| 다른 도메인 요약 참조 | `{도메인}Ref` 하나로 공용화 (id+label / id+name) | `ChipRef`, `PersonRef` |
| Boolean | **is- 접두 없이** 서술 형용사/명사. 엔티티·DTO·JSON 동일 | `favorite`, `common`, `personal`, `distant`, `deleted` |
| enum | 클래스 `{의미}` + 값 UPPER_SNAKE | `ChipType.RELATION_TAG` |
| 서비스 레이어 | 역할 접미사 필수: `Service` / `Seeder` | `PersonService`, `ChipSeeder` |
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
- 보호 컨트롤러는 `JwtAuthGuard`를 적용하고 `@CurrentUser() user: UserPrincipal`로 주입받는다. `UserPrincipal(id, username)` 은 토큰 클레임만으로 구성 — 요청당 DB 조회 없음. 서비스에는 UUID를 `binary(16)` bytes로 바꿔 넘긴다.
- 토큰 없음/무효/username 클레임 누락 = 401 `UNAUTHORIZED`. 발급은 `POST /api/v1/auth/token` (데모: username만으로 발급).
- 고정 데모 유저 하드코딩 금지.

## 5. Swagger (`@nestjs/swagger`)

- **모든** 컨트롤러: 클래스 `@ApiTags`, 메서드 `@ApiOperation({ operationId, summary, description })`.
- **모든** DTO 필드: `@ApiProperty` 또는 `@ApiPropertyOptional`로 description·example·nullable·format을 명시한다. 에러 케이스는 상태별 response decorator와 `ErrorResponse`로 문서화한다.
- 기존 프론트 생성 코드를 유지하도록 경로·HTTP method·operationId·성공 상태·schema의 필수/선택/null 타입을 바꾸지 않는다.
- 설명은 한국어, PRD 용어 그대로(칩·기록·관계태그…). 문서 안 단 API는 리뷰에서 반려 대상.
- 접근 경로(무인증 고정): Swagger UI `/swagger-ui/index.html`, OpenAPI JSON `/v3/api-docs`.

## 6. 기타

- 주석: 코드로 표현 못 하는 암묵지·의도만(왜 이 임계값인지 등). PRD 중복 금지. (CLAUDE.md)
- 테스트 코드 금지 — mustpass 문서로 대체 ([testing.md](./testing.md)).
- 커밋: Conventional Commits, 헤더 `type(backend): 한국어 요약`, 이슈 연결 시 `(#N)` + 본문 `Closes #N`.
  훅 활성화(클론 후 1회): `git config core.hooksPath .githooks` (→ [.githooks/README](../../../.githooks/README.md), setup-macos.sh가 자동 설정).
- 커밋 전 `pnpm format:check`, `pnpm typecheck`, `pnpm lint`, `pnpm build` 통과 필수.
