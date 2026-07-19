# 배포

## 현재 운영 구조

현재 배포 source of truth는 Mac mini의 `~/mongle-deploy/`다.

- `~/mongle-deploy/docker-compose.bluegreen.yml`: MySQL DB와 blue/green 백엔드
- `~/mongle-deploy/deploy.sh`: inactive slot 배포·health 검증·전환
- `Tailscale Funnel -> nginx:18080 -> blue:18081 / green:18082`
- 앱 컨테이너 내부 포트 `8080`
- DB는 두 슬롯이 공유하는 MySQL이다.

배포 전에 호스트의 실제 compose service 이름과 active slot을 다시 확인한다. 레포지토리의 로컬 compose service 이름을 운영 호스트에 추정 적용하지 않는다.

```bash
cd ~/mongle-deploy
docker compose -f docker-compose.bluegreen.yml ps
cat active-slot
cat active-commit
```

## 필수 환경변수

| 변수 | 값 |
|---|---|
| `DATABASE_URL` | `mysql://USER:URL_ENCODED_PASSWORD@DB_HOST:3306/DATABASE` |
| `MONGLE_JWT_SECRET` | 기존 토큰을 계속 인증할 동일한 HS256 키 |
| `MONGLE_JWT_EXPIRATION` | 미지정 시 `30d` |
| `PORT` | slot 컨테이너 내부 `8080` |
| `TZ` | `Asia/Seoul` |

기존 JDBC 접속 변수는 `DATABASE_URL`로 전환한다.

```text
SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/mongle?...
SPRING_DATASOURCE_USERNAME=mongle
SPRING_DATASOURCE_PASSWORD=<password>

↓

DATABASE_URL=mysql://mongle:<URL_ENCODED_PASSWORD>@db:3306/mongle
```

기존 JWT 서명 키는 바꾸지 않는다. 바꾸면 기존 발급 토큰이 모두 401이 된다.

NestJS 런타임은 기존 DB 세 변수를 임시 fallback으로 변환하지만, 컨테이너는 NestJS보다 먼저 `prisma migrate deploy`를 실행한다. 따라서 Mac mini compose는 신규 이미지 기동 전에 `DATABASE_URL`을 반드시 주입해야 한다.

## 최초 Prisma 전환

이 절은 기존 Hibernate MySQL DB에 NestJS/Prisma 이미지를 처음 올릴 때만 수행한다.

### 1. 백업·preflight

1. 운영 compose의 DB service를 확인한다.
2. `mysqldump --single-transaction` 논리 백업을 받는다.
3. 백업 파일이 비어 있지 않은지 확인한다.
4. `users`, `chip`, `person`, `event`와 `_prisma_migrations` 존재 여부를 확인한다.

```sql
SHOW CREATE TABLE users;
SHOW INDEX FROM users WHERE Key_name = 'uk_user_username';
SHOW CREATE TABLE chip;
SHOW CREATE TABLE person;
SHOW CREATE TABLE event;
SELECT TABLE_NAME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;
```

기존 UUID는 `binary(16)`, ID는 signed `bigint`, Boolean은 `bit(1)`이어야 현재 Prisma mapping과 맞는다. 다르면 중단하고 별도 마이그레이션을 먼저 작성한다.

### 2. baseline resolve

기존 테이블에 baseline `CREATE TABLE`을 실행하지 않는다. 새 이미지와 운영 DB `DATABASE_URL`을 사용해 해당 migration을 이미 적용한 것으로 표시한다.

```bash
cd ~/mongle-deploy
COMPOSE_FILE=docker-compose.bluegreen.yml
docker compose -f "$COMPOSE_FILE" config --services

# 위 출력과 active-slot을 보고 실제 inactive backend service를 지정한다.
read -r -p 'inactive backend service: ' INACTIVE_SERVICE
test -n "$INACTIVE_SERVICE"

docker compose -f "$COMPOSE_FILE" run --rm --no-deps \
  --entrypoint ./node_modules/.bin/prisma "$INACTIVE_SERVICE" \
  migrate resolve --applied 000_hibernate_baseline

# preflight에서 uk_user_username이 이미 없었다면 이 migration도 적용된 것으로 표시한다.
# docker compose -f "$COMPOSE_FILE" run --rm --no-deps \
#   --entrypoint ./node_modules/.bin/prisma "$INACTIVE_SERVICE" \
#   migrate resolve --applied 001_drop_username_unique

docker compose -f "$COMPOSE_FILE" run --rm --no-deps \
  --entrypoint ./node_modules/.bin/prisma "$INACTIVE_SERVICE" migrate deploy
```

- 첫 명령은 DDL을 실행하지 않고 `_prisma_migrations`만 생성한다.
- `uk_user_username`이 있으면 deploy가 제거한다. 이미 없으면 주석의 `001` resolve 후 deploy한다.
- `prisma db push`와 `prisma migrate reset`으로 대체하지 않는다.

baseline resolve 전에 신규 slot을 시작하면 컨테이너 `CMD`의 `prisma migrate deploy`가 기존 테이블과 충돌한다. 따라서 resolve는 inactive slot 기동보다 먼저 해야 한다.

### 3. inactive slot 검증·전환

1. `deploy.sh`로 inactive slot에 새 이미지를 띄운다.
2. inactive slot의 `/actuator/health`가 `UP`인지 확인한다.
3. `/v3/api-docs`의 경로·`operationId`·schema가 기존 프론트 계약과 맞는지 확인한다.
4. 토큰 발급 → 인물 조회 → 기록 조회를 smoke test한다.
5. 검증 후 nginx upstream을 inactive slot으로 전환한다.
6. 기존 slot은 롤백 가능 상태로 두고 public health를 반복 확인한다.

```bash
BASE=https://macmini.tailc4f400.ts.net
curl -s "$BASE/actuator/health"

TOKEN=$(curl -s -X POST "$BASE/api/v1/auth/token" \
  -H 'Content-Type: application/json' \
  -d '{"userId":"8e0ca8f5-a713-4a90-9df1-15f0be0d843c","username":"smoke"}' \
  | jq -r .token)

curl -s -H "Authorization: Bearer $TOKEN" "$BASE/api/v1/persons"
```

## 일반 배포

최초 baseline 전환 후에는 각 이미지 시작 시 `prisma migrate deploy`만 실행한다. migration은 inactive slot 검증 전에 적용되므로 기존 slot과 하위 호환되는 변경만 배포한다.

## 롤백

- 앱 문제: nginx upstream을 직전 slot으로 돌린다.
- migration 문제: 앱 롤백과 DB 롤백을 분리한다. 백업을 확보하지 않고 파괴적 reverse SQL을 실행하지 않는다.
- baseline resolve는 DDL을 바꾸지 않으므로 자체로 DB rollback 대상이 아니다.

## 선택적 Render Blueprint

레포 루트의 `render.yaml`은 선택적 배포 계약만 유지한다. 현재 Mac mini MySQL은 private runtime이므로 Render가 그 DB에 접속할 수 있다고 가정하지 않는다.

Render를 쓸 때는:

1. Render에서 접근 가능한 외부 MySQL 8.4를 준비한다.
2. `DATABASE_URL`을 Render secret env로 입력한다.
3. 기존 DB면 첫 배포 전 baseline resolve를 별도로 실행한다.
4. `/actuator/health`와 위 smoke test를 수행한다.

외부 MySQL이 없으면 현재 `render.yaml`만으로는 배포할 수 없다.
