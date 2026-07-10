# 운영 점검

프로덕션(Render+Supabase)은 [아래 섹션](#프로덕션-render--supabase-장애-대응), 그 위 섹션들은 로컬(도커) 기준.

## 상태 확인

```bash
curl -s http://localhost:18080/actuator/health  # {"status":"UP"} (도커 호스트 노출 포트 18080)
docker compose ps                               # db·backend 둘 다 healthy 인지
docker compose logs -f backend                  # 앱 로그 (에러는 GlobalExceptionHandler가 남긴다)
docker compose logs -f db                       # MySQL 로그
```

## 데이터 백업·복구

전부 `backend/data/` 아래에 있다 (도커 기준):

| 경로 | 내용 |
|---|---|
| `data/mysql/` | MySQL 데이터 (도커 실행) |
| `data/images/` | 업로드 이미지 원본 |
| `data/mongle.mv.db` | H2 파일 (비도커 `bootRun` 전용) |

```bash
docker compose stop backend && tar czf mongle-backup-$(date +%Y%m%d).tgz data/ && docker compose start backend
```

복구는 컨테이너 내린 상태에서 `data/`를 풀어 넣고 재기동.

## 자주 겪는 문제

| 증상 | 원인 → 조치 |
|---|---|
| 모든 API가 401 | 토큰 누락/만료 → `POST /api/v1/auth/token` 재발급 (local.md) |
| 18080 이미 사용 중 (도커 기동 실패) | 다른 프로세스가 호스트 18080 점유 → 점유 프로세스 종료(`lsof -i :18080`) 또는 compose 포트 변경. bootRun(8080)과 도커(18080)는 포트가 달라 서로 충돌하지 않는다 |
| backend가 재시작 반복 | db 헬시 전 기동 실패가 아니라면 `docker compose logs backend`에서 datasource 접속 오류 확인 → `data/mysql` 손상 시 백업 복구 또는 초기화 |
| 스키마 불일치 에러 | `ddl-auto: update`는 가산만 한다. 컬럼 타입 변경 릴리스 후엔 데이터 초기화(`docker compose down && rm -rf data`) 또는 수동 ALTER |
| 시드가 안 보임 | 시드는 빈 DB에서만 멱등 실행 → 초기화 후 재기동하면 다시 깔린다. demo 유저 소유이므로 `{"username":"demo"}` 토큰으로 조회해야 보인다 |
| 이미지 404 | `data/images/` 볼륨 마운트 누락 → compose 볼륨 설정 확인 |

## 정기 점검 (데모 수준)

- 디스크: `du -sh data/` — 이미지 업로드가 쌓이는 유일한 경로
- 로그에 `INTERNAL_ERROR` 발생 여부: `docker compose logs backend | grep "Unexpected error"`

## 프로덕션 (Render + Supabase) 장애 대응

배포 절차·아키텍처는 [deploy.md](./deploy.md). 현재 배포 구성(2026-07-10 기준):

| 구성 | 값 |
|---|---|
| 앱 | Render 웹 서비스 `mongle-backend` → https://mongle-backend.onrender.com |
| DB | Supabase 프로젝트 `mongle` (ref `daalrvcgpqdjqemiacrx`, 서울 `ap-northeast-2`) |
| DB 접속 | **Session Pooler** `aws-1-ap-northeast-2.pooler.supabase.com:5432`, user `postgres.daalrvcgpqdjqemiacrx` — Direct 주소(`db.<ref>.supabase.co`)는 IPv6 전용이라 Render에서 접속 불가 |
| 이미지 | Supabase Storage 버킷 `mongle-images` (Public) |
| 비밀값 | Render env(대시보드)와 Supabase 대시보드에만 — 문서·레포에 두지 않는다 |

### 상태 확인

```bash
curl -s https://mongle-backend.onrender.com/actuator/health   # {"status":"UP"}
```

- Render 로그·이벤트: dashboard.render.com → mongle-backend → Logs / Events
- Supabase 상태: supabase.com/dashboard → mongle 프로젝트 (일시정지 여부가 홈에 표시됨)
- 플랫폼 자체 장애 여부: status.render.com / status.supabase.com — 여기가 빨간불이면 기다리는 것 외 방법 없음

### 증상별 진단·조치

| 증상 | 원인 → 조치 |
|---|---|
| 첫 요청만 ~50초 걸림 | Render 무료 티어 슬립(15분 무요청) → 정상. 콜드스타트 후엔 빨라진다 |
| 502/타임아웃 지속 | Render Events에서 crash loop 확인 → Logs에서 원인. 직전 배포가 원인이면 Rollback (deploy.md) |
| health DOWN·기동 실패 + datasource 오류 | ① **Supabase 프로젝트 일시정지** 여부 확인 — 무료 티어는 **7일 무활동 시 자동 pause** → 대시보드에서 Restore 후 Render Manual Deploy. ② DB 비번 변경했다면 Render env `SPRING_DATASOURCE_PASSWORD` 갱신 |
| DB 접속 UnknownHost/timeout | env가 Direct 주소를 쓰고 있는지 확인 → 위 Session Pooler 주소로 교체 |
| 이미지 업로드만 401/403 | service_role 키가 로테이트/무효화됨 → Supabase Settings → API에서 새 키 확보 → Render env `SUPABASE_SERVICE_KEY` 갱신 (env 저장 시 자동 재배포) |
| 업로드된 이미지 URL 404 | 버킷 이름이 `mongle-images`인지, **Public**인지 확인 (Storage → 버킷 설정) |
| 빌드 실패 | Render 빌드 로그 확인. 로컬 재현: `docker build backend/`. main이 로컬에서 빌드되면 Render 캐시 문제 → Manual Deploy → "Clear build cache & deploy" |

### 키·비밀번호 로테이트

유출 의심 시(채팅·화면공유에 노출 등):

1. **service_role 키**: Supabase Settings → API → 키 재생성 → Render env `SUPABASE_SERVICE_KEY` 갱신.
2. **DB 비밀번호**: Supabase Settings → Database → Reset database password → Render env `SPRING_DATASOURCE_PASSWORD` 갱신.
3. Render는 env 저장 시 자동 재배포 → health UP 재확인.

### 프로덕션 데이터 백업

무료 티어는 자동 백업(PITR) 없음. 필요 시 수동:

```bash
# DB (Session Pooler 경유, 비번은 Supabase 대시보드에서)
pg_dump "postgresql://postgres.daalrvcgpqdjqemiacrx:<PW>@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres" > mongle-$(date +%Y%m%d).sql
```

이미지는 Supabase 대시보드 Storage에서 수동 다운로드(데모 수준에선 생략 가능).

### 배포 검증 (배포·복구 후 항상)

deploy.md §3 스모크 테스트: health UP → 토큰 발급 → 이미지 업로드 → 반환된 Supabase 공개 URL이 열리는지.
