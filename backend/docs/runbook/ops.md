# 운영 점검

## 로컬 Docker Compose

### 상태·로그

```bash
curl -s http://localhost:18080/actuator/health
docker compose ps
docker compose logs -f backend
docker compose logs -f db
```

`backend` 컨테이너는 `prisma migrate deploy`가 성공한 후 NestJS를 시작한다. 앱 로그가 없이 종료되면 먼저 migration과 `DATABASE_URL` 오류를 확인한다.

### MySQL 백업

일관된 논리 백업을 생성한다.

```bash
cd backend
BACKUP_DIR="$HOME/mongle-backups"
mkdir -p "$BACKUP_DIR"
docker compose exec -T db sh -c \
  'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --set-gtid-purged=OFF mongle' \
  > "$BACKUP_DIR/mongle-$(date +%Y%m%d-%H%M%S).sql"
ls -lh "$BACKUP_DIR"
```

백업은 레포지토리 밖에 둔다. 물리 데이터는 `backend/data/mysql/`에 있지만, 실행 중인 MySQL 디렉터리를 그대로 복사하지 않는다.

### MySQL 복구

복구 대상 DB와 백업 파일을 다시 확인한 뒤 앱을 중지하고 복구한다.

```bash
docker compose stop backend
read -r -p 'restore backup file: ' BACKUP_FILE
test -s "$BACKUP_FILE"
docker compose exec -T db sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" mongle' \
  < "$BACKUP_FILE"
docker compose start backend
curl -s http://localhost:18080/actuator/health
```

### Prisma migration 상태

```bash
docker compose run --rm --no-deps \
  --entrypoint ./node_modules/.bin/prisma backend migrate status
```

| 증상 | 원인·조치 |
|---|---|
| `P1001` DB 접속 실패 | `DATABASE_URL`의 host·port·계정과 db health를 확인 |
| 기존 테이블 `already exists` | 신규 이미지 첫 기동 전 `000_hibernate_baseline` resolve 누락 → [deploy.md](./deploy.md) 절차 수행 |
| failed migration 기록 | 앱 재시작만 반복하지 말고 실패 SQL·DB 상태·백업을 확인한 뒤 `prisma migrate resolve` 여부를 판단 |
| 스키마 drift | `prisma db push`/`prisma migrate reset`으로 덮지 말고 실제 `SHOW CREATE TABLE`과 migration SQL을 비교 |

`_prisma_migrations`를 수동 `UPDATE`/삭제하지 않는다.

### 자주 겪는 문제

| 증상 | 원인·조치 |
|---|---|
| 모든 API가 401 | `POST /api/v1/auth/token`으로 재발급, `MONGLE_JWT_SECRET`이 이전 배포와 같은지 확인 |
| 18080 포트 충돌 | `lsof -i :18080`로 점유 프로세스 확인 |
| backend restart loop | `docker compose logs backend`에서 migration·DB 접속·JWT secret 오류 확인 |
| 시드가 안 보임 | 같은 UUID로 토큰을 발급했는지 확인. `users.demo_seeded=true`면 재생성하지 않음 |
| 날짜가 하루 밀림 | 앱·DB `TZ=Asia/Seoul`과 API의 `YYYY-MM-DD`/`HH:mm` 변환 확인 |

## Mac mini blue/green

운영 파일은 레포지토리가 아닌 `~/mongle-deploy/`에 있다.

```bash
cd ~/mongle-deploy
docker compose -f docker-compose.bluegreen.yml ps
cat active-slot
cat active-commit
```

확인된 경로는 `Tailscale Funnel -> nginx:18080 -> blue:18081 / green:18082`다. 포트나 service 이름이 바뀌었을 수 있으므로 운영 조치 전에 실제 compose와 nginx upstream을 읽는다.

### 배포 후 검증

```bash
curl -s https://macmini.tailc4f400.ts.net/actuator/health
curl -s https://macmini.tailc4f400.ts.net/v3/api-docs | jq '.openapi'
```

- inactive slot health를 먼저 확인한다.
- nginx 전환 후 public health를 반복 확인한다.
- 토큰 발급·인물 조회·기록 조회·OpenAPI를 확인한다.
- 기존 slot을 즉시 삭제하지 않고 롤백 가능 상태로 둔다.

### 운영 DB 백업

운영 compose의 실제 DB service 이름과 env를 확인한 뒤 위와 같은 `mysqldump --single-transaction`을 실행한다. 백업은 `~/mongle-deploy/` 밖의 접근 제한된 경로로 복사한다.

## 정기 점검

- `du -sh backend/data/mysql` 또는 운영 DB volume 사용량
- `prisma migrate status`
- `/actuator/health`
- 로그의 `INTERNAL_ERROR`, Prisma `P1xxx`/`P3xxx`
- 최근 MySQL 논리 백업 파일 크기와 생성 시각
