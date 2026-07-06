# 배포

> **현재 상태: 배포 대상(호스트/클라우드) 미확정.** 데모 제품이라 상시 배포 환경이 없다.
> 아래는 대상이 정해지면 그대로 쓰는 표준 절차이며, 확정되는 즉시 이 문서를 실측값으로 갱신한다.

## 이미지 빌드·푸시

```bash
cd backend
docker build -t ghcr.io/mongle-master/mongle-backend:$(git rev-parse --short HEAD) .
docker push ghcr.io/mongle-master/mongle-backend:$(git rev-parse --short HEAD)
```

- 레지스트리는 GHCR 기준(레포와 같은 org). `docker login ghcr.io`에 GitHub PAT(write:packages) 필요.

## 대상 호스트에서 실행

가장 간단한 방법은 backend/의 `docker-compose.yml`(db+backend)을 그대로 쓰는 것:

```bash
MONGLE_JWT_SECRET='<32바이트 이상 랜덤>' MYSQL_PASSWORD='<랜덤>' MYSQL_ROOT_PASSWORD='<랜덤>' \
  docker compose up -d
```

관리형 MySQL(RDS 등)을 쓸 때는 backend 단독 실행 + 데이터소스 주입:

```bash
docker run -d --name mongle-backend \
  -p 8080:8080 \
  -v /srv/mongle/data:/app/data \
  -e SPRING_DATASOURCE_URL='jdbc:mysql://<host>:3306/mongle?serverTimezone=Asia/Seoul&characterEncoding=UTF-8' \
  -e SPRING_DATASOURCE_USERNAME='...' -e SPRING_DATASOURCE_PASSWORD='...' \
  -e SPRING_DATASOURCE_DRIVER_CLASS_NAME='com.mysql.cj.jdbc.Driver' \
  -e MONGLE_JWT_SECRET='<32바이트 이상 랜덤 시크릿>' \
  ghcr.io/mongle-master/mongle-backend:<tag>
```

**반드시 지킬 것:**
- `MONGLE_JWT_SECRET`·DB 비밀번호를 데모 기본값에서 교체한다 (기본값은 레포에 공개돼 있다).
- DB 데이터(compose면 `./data/mysql`)와 `/app/data`(업로드 이미지)를 영속 경로에 마운트한다.

## 롤백

이미지 태그가 커밋 해시이므로 이전 태그로 `docker run`을 다시 하면 된다.
DB 스키마는 `ddl-auto: update`(가산적)라 낮은 버전 코드로 돌아가도 대체로 안전하지만, 컬럼 의미가 바뀐 릴리스는 `data/` 백업 후 진행한다(→ [ops.md](./ops.md) 백업).

## 미결 (확정 시 갱신)

- [ ] 배포 대상 호스트/클라우드
- [ ] CI에 백엔드 빌드·이미지 푸시 잡 추가 (현재 ci.yml은 프론트만)
- [ ] 프로덕션 DB 선택(compose MySQL vs 관리형) — 도커 로컬은 이미 MySQL, 비도커 개발만 H2
