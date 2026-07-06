# 로컬 실행 (도커)

> 전제: Docker (Compose v2 포함). 그 외 아무것도 필요 없다 — **로컬 자바 불필요**(자바는 이미지 안에서만 쓴다).
> 맥 첫 세팅이면: `./scripts/setup-macos.sh` (Docker·jq 설치, 멱등. 비도커 실행까지 원하면 `--with-jdk`로 JDK 21 추가)

## 실행

```bash
cd backend
docker compose up -d --build   # 첫 빌드는 의존성 다운로드로 수 분 걸린다
```

- 컨테이너 2개가 뜬다: **db**(MySQL 8.4) + **backend**(8080). backend는 db 헬시 이후 기동된다.
- 서버: http://localhost:8080 (기동 완료 판단: `curl http://localhost:8080/actuator/health` → `{"status":"UP"}`)
- 데이터: `backend/data/mysql/`(DB)·`backend/data/images/`(업로드 이미지)에 영속화. 컨테이너를 지워도 남는다.
- DB 직접 접속(디버깅): `mysql -h127.0.0.1 -P13306 -umongle -pmongle mongle`
- 기동 시 자동 시드: 공통 칩(감정6·날씨5·카테고리4) + demo 유저 소유의 샘플 인물·기록. 이미 있으면 스킵(멱등).

## 첫 호출 (JWT 필수)

모든 `/api/v1/**`는 Bearer 토큰이 필요하다(무토큰 = 401). 데모 로그인은 username만 받는다:

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/token \
  -H 'Content-Type: application/json' -d '{"username":"demo"}' | jq -r .token)

curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/persons
```

- `demo` 유저가 시드 데이터의 소유자다. 다른 username을 주면 빈 데이터의 새 유저가 만들어진다.

## API 문서

- Swagger UI: http://localhost:8080/swagger-ui/index.html (무인증. 우상단 Authorize에 토큰 입력)
- OpenAPI JSON: http://localhost:8080/v3/api-docs

## 중지·리셋

```bash
docker compose down                              # 중지 (데이터 유지)
docker compose down && rm -rf data && docker compose up -d   # 데이터 초기화 후 재기동 (시드가 다시 깔린다)
docker compose up -d --build backend             # 코드 수정 반영 — --build 없이는 옛 이미지로 뜬다
```

## 도커 없이 (JDK 21 있을 때)

```bash
cd backend && ./gradlew bootRun
```

- 이때는 MySQL 없이 **H2 파일 DB**(`backend/data/mongle.mv.db`, application.yml 기본값)를 쓴다 — 도커 실행과 데이터가 분리된다.
- 같은 8080 포트를 쓰므로 도커 backend와 동시에 띄우지 말 것.

## 환경변수 (기본값은 application.yml / compose)

| 변수 | 용도 | 기본 |
|---|---|---|
| `MONGLE_JWT_SECRET` | JWT HS256 서명 키(32바이트↑) | 데모 키 (프로덕션 금지) |
| `MYSQL_PASSWORD` / `MYSQL_ROOT_PASSWORD` | compose MySQL 계정 | mongle / root |
| `SPRING_DATASOURCE_URL` 등 | DB 연결(compose가 MySQL로 주입, 미지정 시 H2) | H2 파일 |
| `SERVER_PORT` | 포트 | 8080 |
