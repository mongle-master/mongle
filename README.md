# mongle

관계도감(mongle) 모노레포 — `frontend/`(TanStack Start + Vite) · `backend/`(Spring Boot + Kotlin).

> **이 문서만 따라 하면 프론트·백엔드를 로컬에서 전부 띄울 수 있다.** 상세는 각 하위 문서로 링크한다.

## 사전 준비물

| 도구 | 버전 | 용도 | 확인 |
|---|---|---|---|
| Node.js | 20+ | 프론트 실행 | `node -v` |
| pnpm | 10+ | 프론트 패키지 매니저 | `pnpm -v` (없으면 `npm i -g pnpm`) |
| 백엔드 실행기 (둘 중 하나) | — | — | — |
| ├ Docker (권장) | Compose v2 | MySQL+백엔드 컨테이너 | `docker compose version` |
| └ JDK 21 (도커 없이) | 21 | `bootRun`(H2 파일 DB) | `java -version` |

## 로컬 실행 (터미널 2개)

포트 규약: **백엔드 = 8080**, **프론트 = 3000**. 프론트는 `/api`·`/images` 요청을 8080으로 프록시한다(`frontend/vite.config.ts`). 백엔드를 다른 포트로 바꾸면 이 프록시도 같이 바꿔야 한다.

### 1) 백엔드 — 8080

**A. 도커 (권장, 상세 → [backend/docs/runbook/local.md](backend/docs/runbook/local.md))**

```bash
cd backend
docker compose up -d --build          # db(MySQL 8.4) + backend(8080). 첫 빌드는 수 분.
```

**B. 도커 없이 (JDK 21, H2 파일 DB)**

```bash
cd backend
./gradlew bootRun                     # 8080. DB는 backend/data/mongle.mv.db
```

> 기동 판단: `curl http://localhost:8080/actuator/health` → `{"status":"UP"}`
> 기동 시 공통 칩만 자동 생성. 사용자별 샘플 인물·기록은 프론트 최초 접속 후 시드 API가 멱등 생성한다.
> A·B는 DB가 분리되고 같은 8080을 쓰므로 **동시에 띄우지 말 것**.

### 2) 프론트 — 3000

```bash
cd frontend
pnpm install
pnpm dev                              # http://localhost:3000
```

### 3) 열기

- 앱: **http://localhost:3000**
- Swagger(무인증): http://localhost:8080/swagger-ui/index.html
- 최초 접속에서 이름을 입력하면 브라우저가 UUID를 생성·저장하고, 그 UUID가 사용자 id와 데이터 소유자가 된다.

## 동작 확인 (선택)

```bash
# 백엔드 단독
curl http://localhost:8080/actuator/health

# 프론트 → 프록시 → 백엔드 end-to-end (토큰 발급)
curl -s -X POST http://localhost:3000/api/v1/auth/token \
  -H 'Content-Type: application/json' \
  -d '{"userId":"8e0ca8f5-a713-4a90-9df1-15f0be0d843c","username":"성빈"}'
# → {"token":"...","userId":"8e0ca8f5-...","username":"성빈"} 면 프록시·백엔드 연결 정상
```

## 중지

```bash
# 백엔드(도커):  cd backend && docker compose down
# 백엔드(bootRun)/프론트: 각 터미널에서 Ctrl+C
```

## 더 보기

| 대상 | 문서 |
|---|---|
| 백엔드 실행·운영·배포·리셋 | [backend/docs/runbook/](backend/docs/runbook/) |
| 백엔드 API·화면↔엔드포인트 매핑 | [backend/README.md](backend/README.md) |
| 프론트 스크립트·라우팅·테스트 | [frontend/README.md](frontend/README.md) |
| 제품 스펙(SSOT) | [docs/prd/](docs/prd/) |
