# mongle-backend

관계도감(mongle) 백엔드. TypeScript + NestJS + Prisma로 API·인증·사람·기록·타임라인·칩을 제공한다.

- **실행·운영·배포:** [docs/runbook](docs/runbook/)
- **도메인 불변식:** [docs/mustpass](docs/mustpass/)
- **제품 스펙:** [../docs/prd](../docs/prd/)
- **DB:** MySQL 8.4. 기존 Hibernate 테이블을 Prisma mapping으로 그대로 사용한다.

## 로컬 실행

Docker Compose가 MySQL과 백엔드를 함께 띄우는 경로가 기본이다.

```bash
docker compose up -d --build
curl http://localhost:18080/actuator/health
```

호스트에서 개발할 때는 Node.js 22 이상과 pnpm을 사용한다.

```bash
docker compose up -d db
pnpm install --frozen-lockfile
export DATABASE_URL='mysql://mongle:mongle@127.0.0.1:13306/mongle'
pnpm prisma:generate
pnpm prisma:migrate:deploy
pnpm dev
```

기존 DB를 처음 연결할 때는 migration 전에 baseline resolve가 필요하다. [로컬 runbook](docs/runbook/local.md#기존-hibernate-mysql-db를-처음-연결할-때)을 따른다.

## API 문서

| 경로 | 내용 |
|---|---|
| `/swagger-ui/index.html` | Swagger UI. Authorize에 Bearer token 입력 |
| `/v3/api-docs` | OpenAPI 3 JSON |
| `/actuator/health` | health check |

무인증 경로는 토큰 발급, health, Swagger다. 나머지 `/api/v1/**`는 JWT를 요구한다.

```bash
curl -X POST http://localhost:18080/api/v1/auth/token \
  -H 'Content-Type: application/json' \
  -d '{"userId":"8e0ca8f5-a713-4a90-9df1-15f0be0d843c","username":"성빈"}'
```

## 화면 ↔ API

| 화면 | API |
|---|---|
| 앱 부트 | `POST /api/v1/auth/token`, `POST /api/v1/seed` |
| 홈 | `GET /api/v1/home/relation-map`, `GET /api/v1/home/throwback` |
| 사람 목록·등록 | `GET·POST /api/v1/persons` |
| 사람 상세·수정·삭제 | `GET·PUT·DELETE /api/v1/persons/{id}` |
| 즐겨찾기 | `PATCH /api/v1/persons/{id}/favorite` |
| 사람 타임라인·활동 흐름 | `GET /api/v1/persons/{id}/timeline`, `GET /api/v1/persons/{id}/activity-flow` |
| 기록 작성·상세·수정 | `POST /api/v1/events`, `GET·PUT /api/v1/events/{id}` |
| 전체 타임라인 | `GET /api/v1/timeline` |
| 칩 설정 | `GET·POST /api/v1/chips`, `PATCH·DELETE /api/v1/chips/{id}` |
| 사용자 프로필·탈퇴 | `PATCH /api/v1/users/me/profile`, `DELETE /api/v1/users/me` |
| 이미지 업로드 권한 | `POST /api/v1/images/upload-permission` |

세부 request·response·에러 계약은 `/v3/api-docs`가 SSOT다.

## 스택

| 구분 | 기준 |
|---|---|
| Runtime | Node.js 22+ |
| Language | TypeScript |
| Framework | NestJS |
| Database | MySQL 8.4 |
| ORM / migration | Prisma |
| Package manager | pnpm |
| API docs | Swagger / OpenAPI 3 |

## 구조

```text
backend/
├── prisma/              # MySQL mapping과 migration
├── src/
│   ├── auth/            # UUID 기반 JWT 발급·검증
│   ├── users/           # 프로필·탈퇴
│   ├── chips/           # 공통·개인 칩
│   ├── persons/         # 사람·관계태그·취향
│   ├── events/          # 기록·연결 인물·감정·사진
│   ├── home/            # 관계 지도·회고
│   ├── timeline/        # 전체·사람별 타임라인
│   ├── seed/            # 사용자별 데모 데이터
│   ├── images/          # 업로드 권한
│   ├── prisma/          # Prisma module·service
│   ├── common/          # 환경·인증·health·예외
│   └── shared/          # 공용 DTO·날짜·검증
├── docs/mustpass/       # 도메인 불변식
└── docs/runbook/        # 로컬·배포·운영 절차
```

## 명령

| 명령 | 용도 |
|---|---|
| `pnpm dev` | NestJS watch 모드 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start:prod` | migration 적용 후 `dist/main.js` 실행 |
| `pnpm prisma:generate` | Prisma Client 생성 |
| `pnpm prisma:migrate:deploy` | 커밋된 migration 적용 |
| `pnpm lint` | lint |
| `pnpm format` | format |
| `pnpm typecheck` | TypeScript 타입 검증 |

`prisma db push`와 `prisma migrate reset`은 기존 MySQL 데이터에 사용하지 않는다.
