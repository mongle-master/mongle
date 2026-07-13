# 로컬 실행

## 준비물

- Docker Desktop + Compose v2
- 호스트에서 백엔드를 개발할 때는 Node.js 22 이상과 pnpm
- macOS 최초 설정: `./scripts/setup-macos.sh`

## 새 DB에 Docker Compose로 실행

```bash
cd backend
docker compose up -d --build
```

- `db`: MySQL 8.4, 호스트 `13306` → 컨테이너 `3306`
- `backend`: NestJS, 호스트 `18080` → 컨테이너 `8080`
- 앱 시작 전 `prisma migrate deploy`가 실행되고, 그 다음 NestJS가 기동한다.
- MySQL 데이터는 `backend/data/mysql/`에 유지된다.

```bash
curl http://localhost:18080/actuator/health
# {"status":"UP"}

mysql -h127.0.0.1 -P13306 -umongle -pmongle mongle
```

## 기존 Hibernate MySQL DB를 처음 연결할 때

기존 테이블이 있고 `_prisma_migrations`는 없는 DB에 baseline DDL을 다시 실행하면 충돌한다. 신규 백엔드를 처음 띄우기 전에 baseline을 **실행한 것으로만 표시**한다.

```bash
cd backend
docker compose up -d db
docker compose build backend

# 1회만 실행: DDL은 실행하지 않고 migration 이력만 기록한다.
docker compose run --rm --no-deps \
  --entrypoint ./node_modules/.bin/prisma backend \
  migrate resolve --applied 000_hibernate_baseline

# SHOW INDEX FROM users WHERE Key_name = 'uk_user_username'; 결과가 이미 비어 있으면 1회 실행한다.
# docker compose run --rm --no-deps \
#   --entrypoint ./node_modules/.bin/prisma backend \
#   migrate resolve --applied 001_drop_username_unique

# baseline 이후 migration을 적용한다.
docker compose run --rm --no-deps \
  --entrypoint ./node_modules/.bin/prisma backend migrate deploy
docker compose up -d backend
```

- 실행 전 DB를 백업하고 [deploy.md](./deploy.md)의 preflight를 확인한다.
- `prisma db push`와 `prisma migrate reset`은 기존 데이터에 사용하지 않는다.
- baseline resolve는 DB당 한 번만 한다. 이후는 `pnpm prisma:migrate:deploy`만 실행한다.

## 호스트에서 NestJS 개발

DB는 Compose로 띄우고 앱만 Node.js로 실행한다.

```bash
cd backend
docker compose up -d db
pnpm install --frozen-lockfile

export DATABASE_URL='mysql://mongle:mongle@127.0.0.1:13306/mongle'
pnpm prisma:generate
pnpm prisma:migrate:deploy
pnpm dev
# http://localhost:8080
```

기존 DB라면 `prisma:migrate:deploy` 전에 위 baseline resolve를 호스트의 `DATABASE_URL`로 한 번 실행한다.

호스트 NestJS에 프론트를 연결할 때:

```bash
cd frontend
BACKEND_URL=http://localhost:8080 pnpm dev:vite
```

## 첫 호출

보호 API는 Bearer JWT가 필요하다.

```bash
TOKEN=$(curl -s -X POST http://localhost:18080/api/v1/auth/token \
  -H 'Content-Type: application/json' \
  -d '{"userId":"8e0ca8f5-a713-4a90-9df1-15f0be0d843c","username":"성빈"}' | jq -r .token)

curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:18080/api/v1/seed \
  -H "Authorization: Bearer $TOKEN"

curl -s -H "Authorization: Bearer $TOKEN" http://localhost:18080/api/v1/persons
```

기동 시 공통 칩(감정 11·날씨 5·카테고리 4)을 멱등 시드한다. `POST /api/v1/seed`는 사용자별 최초 1회만 샘플 데이터를 생성한다.

## API 문서

- Swagger UI: http://localhost:18080/swagger-ui/index.html
- OpenAPI JSON: http://localhost:18080/v3/api-docs

## 중지·재빌드

```bash
docker compose down
docker compose up -d --build backend
docker compose logs -f backend
```

`docker compose down`은 `data/mysql/`을 지우지 않는다.

## 환경변수

| 변수 | 용도 | 로컬 Compose 기본값 |
|---|---|---|
| `DATABASE_URL` | Prisma MySQL URL | `mysql://mongle:mongle@db:3306/mongle` |
| `MONGLE_JWT_SECRET` | JWT HS256 서명 키(32바이트 이상) | 데모 키 |
| `MONGLE_JWT_EXPIRATION` | access token 만료 | `30d` |
| `PORT` | 앱 포트 | `8080` |
| `TZ` | “오늘”·시드·날짜 기준 | `Asia/Seoul` |
| `MYSQL_PASSWORD` / `MYSQL_ROOT_PASSWORD` | Compose DB 계정 | `mongle` / `root` |

커스텀 `MYSQL_PASSWORD`를 지정하면 같은 비밀번호를 URL-encode한 `DATABASE_URL`도 함께 지정한다.

### 기존 환경변수 전환

기존 배포의 JDBC URL·계정·비밀번호 세 값은 Prisma URL 하나로 합친다.

```text
SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/mongle?...
SPRING_DATASOURCE_USERNAME=mongle
SPRING_DATASOURCE_PASSWORD=<password>

↓

DATABASE_URL=mysql://mongle:<URL_ENCODED_PASSWORD>@db:3306/mongle
```

NestJS를 직접 실행하는 경로는 기존 세 변수를 임시 호환 fallback으로 읽어 MySQL URL로 변환한다. 다만 Docker·production 시작은 NestJS보다 먼저 Prisma CLI를 실행하므로 `DATABASE_URL`이 반드시 필요하다. 두 형식을 모두 지정하면 `DATABASE_URL`을 우선한다.

DB 테이블과 데이터는 그대로 사용하고 배포 접속 변수만 `DATABASE_URL`로 전환한다. 기존 `SERVER_PORT`도 임시로 인식하지만 신규 설정은 `PORT`를 쓴다.
