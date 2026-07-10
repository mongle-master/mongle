# 배포

> **대상: Render(앱) + Supabase(Postgres + Storage). 무료·카드 등록 불필요.**
> 로컬 개발(H2 파일 + 로컬 FS)은 이 문서와 무관 — [local.md](./local.md) 참조.
> 배포는 `prod` 스프링 프로필로만 분기한다(`SPRING_PROFILES_ACTIVE=prod`).

## 왜 이 구조

- 진짜 VM(Oracle/Fly/GCP)은 전부 카드 등록 필요 → 카드-프리는 PaaS + 외부 관리형 스토리지가 유일.
- Render 무료 웹서비스 디스크는 **휘발성** → 재배포·재시작에 파일이 날아간다. 그래서
  DB(Postgres)와 업로드 이미지(Storage)를 앱 밖 **Supabase** 에 둔다. 계정은 Render·Supabase 2개.
- 앱 코드는 매체만 프로필로 갈아끼운다: `LocalImageStorage`(로컬) ↔ `SupabaseImageStorage`(prod),
  DB 는 `application-prod.yml` 의 데이터소스 env. 네이티브 쿼리·마이그레이션이 없어 `ddl-auto: update` 로 스키마 자동 생성.

## 1. Supabase 준비 (한 번)

1. https://supabase.com → 프로젝트 생성(리전은 한국 대상이면 Seoul `ap-northeast-2`).
2. **DB 접속정보**: 대시보드 상단 **Connect** 버튼 → **Session pooler** 섹션.
   - ⚠️ **반드시 Session Pooler 주소**(`aws-X-<region>.pooler.supabase.com:5432`, user `postgres.<ref>`)를 쓴다.
     Direct 주소(`db.<ref>.supabase.co`)는 무료 티어에서 **IPv6 전용**이라 Render(IPv4만)에서 접속 불가.
   - JDBC URL 예: `jdbc:postgresql://aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`
3. **Storage 버킷**: Storage → New bucket → 이름 `mongle-images`, **Public 체크**(공개 URL 서빙).
4. **service_role 키**: Project Settings → API → `service_role` secret. (서버 전용, 절대 노출 금지)

## 2. Render 배포 (Blueprint)

레포 루트 `render.yaml` 이 서비스를 선언한다.

1. https://render.com → New → **Blueprint** → 이 레포 연결.
2. 배포 시 아래 env 를 입력한다(`render.yaml` 에 `sync:false` 로 표시된 값):

   | 키 | 값 |
   |---|---|
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<pooler-host>:5432/postgres` (Session Pooler — §1 참조) |
   | `SPRING_DATASOURCE_USERNAME` | `postgres.<project-ref>` (풀러는 유저명에 ref가 붙는다) |
   | `SPRING_DATASOURCE_PASSWORD` | Supabase DB 비밀번호 |
   | `SUPABASE_URL` | `https://<project>.supabase.co` (끝 슬래시 없이) |
   | `SUPABASE_SERVICE_KEY` | service_role 키 |

   - `SPRING_PROFILES_ACTIVE=prod`, `SUPABASE_BUCKET=mongle-images`, `MONGLE_JWT_SECRET`(자동 생성)은 `render.yaml` 에 이미 있음.
3. Apply → Docker 빌드(멀티스테이지, rootDir=backend) → 기동.

Health check: `GET /actuator/health` → `{"status":"UP"}`.

## 3. 배포 검증

> 사용자 id와 `owner_id`가 bigint에서 UUID로 바뀌는 릴리스다. 기존 DB에는 자동 적용되지 않으므로 배포 전에 DB를 초기화하거나 명시적 타입 변환 마이그레이션을 수행한다.

```bash
BASE=https://mongle-backend.onrender.com   # 현재 배포 주소
curl -s $BASE/actuator/health                    # {"status":"UP"}
TOKEN=$(curl -s -X POST $BASE/api/v1/auth/token \
  -H 'Content-Type: application/json' \
  -d '{"userId":"8e0ca8f5-a713-4a90-9df1-15f0be0d843c","username":"smoke"}' \
  | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
curl -s -X POST $BASE/api/v1/images \
  -H "Authorization: Bearer $TOKEN" -F "file=@some.png;type=image/png"
# → {"filename":"...","url":"https://<project>.supabase.co/storage/v1/object/public/mongle-images/..."}
# 반환 url 을 브라우저로 열어 이미지가 뜨는지 확인 → 재배포 후에도 유지되면 성공.
```

프론트엔드는 이 주소를 API 베이스로 물린다: `VITE_API_URL=https://mongle-backend.onrender.com/api` (→ [frontend/README.md](../../../frontend/README.md) "배포 백엔드로 붙기").

## 반드시 지킬 것

- `prod` 프로필은 `MONGLE_JWT_SECRET`·DB 접속·`SUPABASE_*` 를 **env 필수**로 요구 — 미주입 시 기동 실패(데모 기본값 사용 안 됨).
- `service_role` 키는 서버 env 에만. 클라이언트로 내려가면 스토리지 전체 쓰기 권한이 노출된다.
- 버킷은 **Public** 이어야 반환 URL 이 열린다(비공개면 서명 URL 로직 추가 필요).

## 참고: Render 무료 티어 한계

- 15분 무요청 시 슬립 → 다음 요청에 콜드스타트 ~50초. 데모용으로 수용.
- DB·이미지는 Supabase 에 있어 앱 재시작·재배포에도 보존됨.

## 롤백

- Render 대시보드 → 서비스 → Deploys → 이전 배포로 **Rollback**.
- 스키마는 `ddl-auto: update`(가산적)라 낮은 버전 코드로 돌아가도 대체로 안전. 컬럼 의미가 바뀐 릴리스는 Supabase DB 백업 후 진행.

## 대안: 단일 VM(도커 컴포즈)

카드 등록이 가능하면 Oracle Cloud Always Free 등 VM 에서 `docker-compose.yml`(MySQL+backend)을 그대로 띄우는 게
코드 변경 0 이다(로컬 FS 이미지·MySQL 그대로). `prod` 프로필/ Supabase 불필요.

```bash
MONGLE_JWT_SECRET='<32바이트+ 랜덤>' MYSQL_PASSWORD='<랜덤>' MYSQL_ROOT_PASSWORD='<랜덤>' \
  docker compose up -d   # DB(./data/mysql)·이미지(/app/data)를 영속 경로에 마운트
```
