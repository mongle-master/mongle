# backend/docs/runbook

AI(와 사람)가 **이 폴더만 보고** 운영·배포·로컬 실행(도커)을 전부 수행할 수 있게 하는 것이 목표다.
절차 문서는 여기에만 둔다 — 코드 주석·PRD·mustpass에 흩어놓지 않는다. 절차가 바뀌면 코드보다 먼저 고친다.

| 문서 | 내용 |
|---|---|
| [local.md](./local.md) | Docker Compose MySQL+NestJS 실행, 호스트 개발, 첫 토큰 발급 |
| [deploy.md](./deploy.md) | Mac mini blue/green, 기존 DB Prisma baseline, 검증·롤백, 선택적 Render |
| [ops.md](./ops.md) | 상태·로그, MySQL 백업·복구, Prisma migration 장애 대응 |
