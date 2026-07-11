# 로컬 실행 (도커)

> 전제: Docker (Compose v2 포함). 그 외 아무것도 필요 없다 — **로컬 자바 불필요**(자바는 이미지 안에서만 쓴다).
> 맥 첫 세팅이면: `./scripts/setup-macos.sh` (Docker·jq 설치, 멱등. 비도커 실행까지 원하면 `--with-jdk`로 JDK 21 추가)

## 실행

```bash
cd backend
docker compose up -d --build   # 첫 빌드는 의존성 다운로드로 수 분 걸린다
```

- 컨테이너 2개가 뜬다: **db**(MySQL 8.4) + **backend**(호스트 18080 → 컨테이너 8080). backend는 db 헬시 이후 기동된다.
- 서버: http://localhost:18080 (기동 완료 판단: `curl http://localhost:18080/actuator/health` → `{"status":"UP"}`)
    - 호스트 노출은 18080, 컨테이너 내부 앱 포트는 8080. 프론트 dev 프록시(`frontend/vite.config.ts`)는 기본으로 로컬 도커 백엔드를 가리킨다.
- 데이터: `backend/data/mysql/`의 DB에 영속화. 이미지는 프론트의 Vercel Blob 직접 업로드가 담당한다.
- DB 직접 접속(디버깅): `mysql -h127.0.0.1 -P13306 -umongle -pmongle mongle`
- 기동 시 자동 시드: 공통 칩(감정11·날씨5·카테고리4). 사용자 샘플 데이터는 인증 후 `POST /api/v1/seed`가 사용자별 최초 1회 생성한다.

## 첫 호출 (JWT 필수)

보호 API는 Bearer 토큰이 필요하다(무토큰 = 401). 브라우저가 생성·보관할 UUID를 사용자 id로 보낸다:

```bash
TOKEN=$(curl -s -X POST http://localhost:18080/api/v1/auth/token \
  -H 'Content-Type: application/json' \
  -d '{"userId":"8e0ca8f5-a713-4a90-9df1-15f0be0d843c","username":"성빈"}' | jq -r .token)

curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:18080/api/v1/seed \
  -H "Authorization: Bearer $TOKEN"  # 204

curl -s -H "Authorization: Bearer $TOKEN" http://localhost:18080/api/v1/persons
```

## API 문서

- Swagger UI: http://localhost:18080/swagger-ui/index.html (무인증. 우상단 Authorize에 토큰 입력)
- OpenAPI JSON: http://localhost:18080/v3/api-docs

## 중지·리셋

```bash
docker compose down                              # 중지 (데이터 유지)
docker compose down && rm -rf data && docker compose up -d   # 데이터 초기화 후 재기동
docker compose up -d --build backend             # 코드 수정 반영 — --build 없이는 옛 이미지로 뜬다
```

## 도커 없이 (JDK 21 있을 때)

```bash
cd backend && ./gradlew bootRun
```

- 이때는 MySQL 없이 **H2 파일 DB**(`backend/data/mongle.mv.db`, application.yml 기본값)를 쓴다 — 도커 실행과 데이터가 분리된다.
- bootRun은 호스트 **8080**에 뜨고 도커 backend는 호스트 **18080**이라 포트는 충돌하지 않는다. bootRun으로 띄운 서버에 프론트를 붙이려면 `BACKEND_URL=http://localhost:8080 pnpm dev`.

## 환경변수 (기본값은 application.yml / compose)

| 변수                                     | 용도                                          | 기본                    |
| ---------------------------------------- | --------------------------------------------- | ----------------------- |
| `MONGLE_JWT_SECRET`                      | JWT HS256 서명 키(32바이트↑)                  | 데모 키 (프로덕션 금지) |
| `MYSQL_PASSWORD` / `MYSQL_ROOT_PASSWORD` | compose MySQL 계정                            | mongle / root           |
| `SPRING_DATASOURCE_URL` 등               | DB 연결(compose가 MySQL로 주입, 미지정 시 H2) | H2 파일                 |
| `SERVER_PORT`                            | 포트                                          | 8080                    |
