# mongle-backend

관계도감(mongle) 백엔드 — Spring Boot + Kotlin, 레이어드 아키텍처(`controller → service → repository` + `domain`).

- **실행·운영·배포:** [docs/runbook](docs/runbook/) (도커 로컬 실행 = MySQL+backend compose)
- **도메인 불변식:** [docs/mustpass](docs/mustpass/) (테스트 코드 없음 — [테스트 정책](.claude/rules/testing.md))
- **코드 컨벤션:** [.claude/rules/conventions.md](.claude/rules/conventions.md) (id-only 참조·조인 엔티티·네이밍·JWT·스웨거 규칙)
- **제품 스펙(SSOT):** [../docs/prd](../docs/prd/)

## API 문서 (Swagger)

서버 기동 후 (→ [runbook/local.md](docs/runbook/local.md)):

| 경로 | 내용 |
|---|---|
| `/swagger-ui/index.html` | Swagger UI — 우상단 **Authorize**에 Bearer 토큰 입력 후 호출 |
| `/v3/api-docs` | OpenAPI 3 JSON |

- 두 경로는 무인증. 나머지 `/api/v1/**`는 JWT 필요 — 토큰 발급은 `POST /api/v1/auth/token` `{"username":"demo"}`.
- 로컬 기본 주소: http://localhost:8080/swagger-ui/index.html

### 화면 ↔ 엔드포인트 매핑

| PRD 화면(SSOT) | 주요 엔드포인트 |
|---|---|
| [01 홈·관계 대시보드](../docs/prd/01-home-dashboard.md) | `GET /api/v1/home/relation-map` · `GET /api/v1/home/throwback` |
| [02 사람(등록·프로필)](../docs/prd/02-person.md) | `POST·GET /api/v1/persons` · `GET·PUT·DELETE /api/v1/persons/{id}` · `PATCH /api/v1/persons/{id}/favorite` |
| [03 사람별 타임라인](../docs/prd/03-timeline.md) | `GET /api/v1/persons/{id}/timeline` · `GET /api/v1/persons/{id}/activity-flow` |
| [04 상황 기록 작성](../docs/prd/04-record.md) | `POST /api/v1/events` · `GET·PUT /api/v1/events/{id}` · `POST /api/v1/images` |
| [05 전체 타임라인](../docs/prd/05-my-timeline.md) | `GET /api/v1/timeline` |
| 공통(칩·인증) | `/api/v1/chips`(CRUD) · `POST /api/v1/auth/token` |

세부 파라미터·응답은 Swagger가 SSOT다.

## 스택

| 구분 | 버전 |
| --- | --- |
| Kotlin | 2.1.10 |
| Spring Boot | 3.5.0 |
| Java (toolchain) | 21 |
| Build | Gradle 9.4 (Kotlin DSL + Version Catalog) |
| DB | MySQL 8.4(도커) / H2 파일(비도커 bootRun) |
| Lint | ktlint |

의존성/플러그인 버전은 [`gradle/libs.versions.toml`](gradle/libs.versions.toml) 한 곳에서 관리한다.

## 프로젝트 구조

```
src/main/kotlin/com/mongle
├── Application.kt        # 진입점
├── config/               # JPA 감사, WebMvc(리졸버·정적 이미지), OpenAPI
├── controller/           # REST + dto/ (Auth·Chip·Event·Home·Person·Timeline)
├── service/              # 비즈니스 로직 (Validator·Seeder·Calculator 포함)
├── repository/           # Spring Data JPA
├── domain/               # 엔티티 — id-only 참조, 다대다는 조인 엔티티
└── common/               # 예외·검증 한도·JWT 컨텍스트(@AuthUser)·이미지 저장
```

## 자주 쓰는 명령

```bash
./gradlew bootRun        # 비도커 실행 (H2)
./gradlew ktlintFormat   # 린트 자동 수정 (커밋 전 필수)
./gradlew compileKotlin  # 컴파일 확인
```

도커 실행·중지·리셋은 [runbook/local.md](docs/runbook/local.md) 참조. 모노레포이므로 gradle 명령은 `backend/` 안에서 실행한다.
