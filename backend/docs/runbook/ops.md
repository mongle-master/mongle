# 운영 점검

## 상태 확인

```bash
curl -s http://localhost:8080/actuator/health   # {"status":"UP"}
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
| 8080 이미 사용 중 | 비도커 `bootRun`과 도커 backend 동시 실행 → 하나 내리기 |
| backend가 재시작 반복 | db 헬시 전 기동 실패가 아니라면 `docker compose logs backend`에서 datasource 접속 오류 확인 → `data/mysql` 손상 시 백업 복구 또는 초기화 |
| 스키마 불일치 에러 | `ddl-auto: update`는 가산만 한다. 컬럼 타입 변경 릴리스 후엔 데이터 초기화(`docker compose down && rm -rf data`) 또는 수동 ALTER |
| 시드가 안 보임 | 시드는 빈 DB에서만 멱등 실행 → 초기화 후 재기동하면 다시 깔린다. demo 유저 소유이므로 `{"username":"demo"}` 토큰으로 조회해야 보인다 |
| 이미지 404 | `data/images/` 볼륨 마운트 누락 → compose 볼륨 설정 확인 |

## 정기 점검 (데모 수준)

- 디스크: `du -sh data/` — 이미지 업로드가 쌓이는 유일한 경로
- 로그에 `INTERNAL_ERROR` 발생 여부: `docker compose logs backend | grep "Unexpected error"`
