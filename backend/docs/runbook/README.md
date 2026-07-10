# backend/docs/runbook

AI(와 사람)가 **이 폴더만 보고** 운영·배포·로컬 실행(도커)을 전부 수행할 수 있게 하는 것이 목표다.
절차 문서는 여기에만 둔다 — 코드 주석·PRD·mustpass에 흩어놓지 않는다. 절차가 바뀌면 코드보다 먼저 고친다.

| 문서 | 내용 |
|---|---|
| [local.md](./local.md) | 도커 로컬 실행(MySQL+backend), 첫 토큰 발급, 리셋, 비도커 H2 실행 |
| [deploy.md](./deploy.md) | Render(앱) + Supabase(DB·이미지) 무료 배포 절차, 검증, 롤백 |
| [ops.md](./ops.md) | 상태 확인, 로그, 백업·복구, 자주 겪는 문제 (로컬 + 프로덕션 장애 대응) |
