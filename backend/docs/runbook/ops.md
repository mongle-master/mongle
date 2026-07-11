# 운영 점검

프로덕션(Render+Supabase+Vercel)은 [아래 섹션](#프로덕션-render--supabase--vercel-장애-대응), 그 위 섹션들은 로컬(도커) 기준.

## 상태 확인

```bash
curl -s http://localhost:18080/actuator/health  # {"status":"UP"} (도커 호스트 노출 포트 18080)
docker compose ps                               # db·backend 둘 다 healthy 인지
docker compose logs -f backend                  # 앱 로그 (에러는 GlobalExceptionHandler가 남긴다)
docker compose logs -f db                       # MySQL 로그
```

## 데이터 백업·복구

전부 `backend/data/` 아래에 있다 (도커 기준):

| 경로                | 내용                            |
| ------------------- | ------------------------------- |
| `data/mysql/`       | MySQL 데이터 (도커 실행)        |
| `data/mongle.mv.db` | H2 파일 (비도커 `bootRun` 전용) |

```bash
docker compose stop backend && tar czf mongle-backup-$(date +%Y%m%d).tgz data/ && docker compose start backend
```

복구는 컨테이너 내린 상태에서 `data/`를 풀어 넣고 재기동.

## 자주 겪는 문제

| 증상                                | 원인 → 조치                                                                                                                                                     |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 모든 API가 401                      | 토큰 누락/만료 → `POST /api/v1/auth/token` 재발급 (local.md)                                                                                                    |
| 18080 이미 사용 중 (도커 기동 실패) | 다른 프로세스가 호스트 18080 점유 → 점유 프로세스 종료(`lsof -i :18080`) 또는 compose 포트 변경. bootRun(8080)과 도커(18080)는 포트가 달라 서로 충돌하지 않는다 |
| backend가 재시작 반복               | db 헬시 전 기동 실패가 아니라면 `docker compose logs backend`에서 datasource 접속 오류 확인 → `data/mysql` 손상 시 백업 복구 또는 초기화                        |
| 스키마 불일치 에러                  | `ddl-auto: update`는 가산만 한다. 컬럼 타입 변경 릴리스 후엔 데이터 초기화(`docker compose down && rm -rf data`) 또는 수동 ALTER                                |
| 시드가 안 보임                      | 같은 UUID로 토큰을 발급했는지 확인 → `POST /api/v1/seed`를 Bearer 토큰과 함께 다시 호출한다. `users.demo_seeded=true`면 다시 생성하지 않는다                    |

## 정기 점검 (데모 수준)

- 디스크: `du -sh data/` — 로컬 DB 사용량 확인
- 로그에 `INTERNAL_ERROR` 발생 여부: `docker compose logs backend | grep "Unexpected error"`

## 프로덕션 Render + Supabase + Vercel 장애 대응

배포 절차·아키텍처는 [deploy.md](./deploy.md). 현재 배포 구성(2026-07-10 기준):

| 구성    | 값                                                                                                                                                                                  |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 앱      | Render 웹 서비스 `mongle-backend` → https://mongle-backend.onrender.com                                                                                                             |
| DB      | Supabase 프로젝트 `mongle` (ref `daalrvcgpqdjqemiacrx`, 서울 `ap-northeast-2`)                                                                                                      |
| DB 접속 | **Session Pooler** `aws-1-ap-northeast-2.pooler.supabase.com:5432`, user `postgres.daalrvcgpqdjqemiacrx` — Direct 주소(`db.<ref>.supabase.co`)는 IPv6 전용이라 Render에서 접속 불가 |
| 이미지  | Vercel Public Blob Store                                                                                                                                                            |
| 비밀값  | Render env, Supabase 대시보드, Vercel env에만 보관                                                                                                                                  |

### 상태 확인

```bash
curl -s https://mongle-backend.onrender.com/actuator/health   # {"status":"UP"}
```

- Render 로그·이벤트: dashboard.render.com → mongle-backend → Logs / Events
- Supabase 상태: supabase.com/dashboard → mongle 프로젝트 (일시정지 여부가 홈에 표시됨)
- 플랫폼 자체 장애 여부: status.render.com / status.supabase.com / vercel-status.com

### 증상별 진단·조치

| 증상                                    | 원인 → 조치                                                                                                                                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 첫 요청만 ~50초 걸림                    | Render 무료 티어 슬립(15분 무요청) → 정상. 콜드스타트 후엔 빨라진다                                                                                                                                     |
| 502/타임아웃 지속                       | Render Events에서 crash loop 확인 → Logs에서 원인. 직전 배포가 원인이면 Rollback (deploy.md)                                                                                                            |
| health DOWN·기동 실패 + datasource 오류 | ① **Supabase 프로젝트 일시정지** 여부 확인 — 무료 티어는 **7일 무활동 시 자동 pause** → 대시보드에서 Restore 후 Render Manual Deploy. ② DB 비번 변경했다면 Render env `SPRING_DATASOURCE_PASSWORD` 갱신 |
| DB 접속 UnknownHost/timeout             | env가 Direct 주소를 쓰고 있는지 확인 → 위 Session Pooler 주소로 교체                                                                                                                                    |
| 이미지 업로드만 401                     | Vercel 함수가 전달한 JWT 만료 여부와 Render의 `/api/v1/images/upload-permission` 응답 확인                                                                                                              |
| 이미지 업로드만 400/500                 | Vercel 프로젝트의 Blob Store 연결과 `BLOB_READ_WRITE_TOKEN` 확인                                                                                                                                        |
| 업로드된 이미지 URL 404                 | Vercel Blob Store가 Public인지, 저장 URL이 `.public.blob.vercel-storage.com/images/`인지 확인                                                                                                           |
| 빌드 실패                               | Render 빌드 로그 확인. 로컬 재현: `docker build backend/`. main이 로컬에서 빌드되면 Render 캐시 문제 → Manual Deploy → "Clear build cache & deploy"                                                     |

### 키·비밀번호 로테이트

유출 의심 시(채팅·화면공유에 노출 등):

1. **Blob 토큰**: Vercel Storage에서 Blob Store 재연결 후 `BLOB_READ_WRITE_TOKEN` 갱신.
2. **DB 비밀번호**: Supabase Settings → Database → Reset database password → Render env `SPRING_DATASOURCE_PASSWORD` 갱신.
3. 각 플랫폼 env 저장 후 재배포하고 health와 이미지 업로드 재확인.

### 프로덕션 데이터 백업

무료 티어는 자동 백업(PITR) 없음. 필요 시 수동:

```bash
# DB (Session Pooler 경유, 비번은 Supabase 대시보드에서)
pg_dump "postgresql://postgres.daalrvcgpqdjqemiacrx:<PW>@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres" > mongle-$(date +%Y%m%d).sql
```

이미지는 Vercel Storage의 Blob Browser에서 확인·다운로드한다.

### 배포 검증 (배포·복구 후 항상)

deploy.md §3 스모크 테스트: health UP → 토큰 발급 → 업로드 권한 확인 → 프론트 이미지 업로드 → Blob URL과 최적화 URL 확인.
