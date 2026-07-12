# mongle-frontend

관계도감(mongle) 프론트엔드 — React + Vite.

> 전체 스택 실행 방법은 루트 [README.md](../README.md)를 따른다.

## 실행

전제:

- **Node 20.19+ 또는 22.12+ · pnpm 10+** (pnpm 없으면 `npm i -g pnpm`)
- **백엔드가 18080에서 떠 있어야** 데이터가 보인다. 프론트는 `/api`를 `localhost:18080`으로 프록시한다(`vite.config.ts`). 백엔드 기동은 루트 README 또는 [backend/docs/runbook/local.md](../backend/docs/runbook/local.md) 참조.

To run this application:

```bash
pnpm install
pnpm exec vercel link  # 최초 1회: Vercel의 mongle 프로젝트 선택
pnpm exec vercel pull  # 최초 1회 및 env 변경 시
pnpm dev            # http://localhost:3000
```

다른 백엔드에 연결할 때는 Vite 프록시 대상을 지정한다.

```bash
BACKEND_URL=https://mongle-backend.onrender.com pnpm dev
```

curl로 직접 확인:

```bash
BASE=https://mongle-backend.onrender.com
curl -s $BASE/actuator/health          # {"status":"UP"}
curl -s -X POST $BASE/api/v1/auth/token -H 'Content-Type: application/json' \
  -d '{"userId":"8e0ca8f5-a713-4a90-9df1-15f0be0d843c","username":"성빈"}'
# → {"token":"..."} 이후 요청에 Authorization: Bearer {token}
```

- Swagger: https://mongle-backend.onrender.com/swagger-ui/index.html
- ⚠️ 무료 티어라 15분 무요청 시 슬립 → 첫 요청이 ~50초 걸릴 수 있다(콜드스타트). 이후엔 정상 속도.
- 이미지는 브라우저에서 Vercel Blob으로 직접 업로드하고, 백엔드는 URL만 저장한다.
- 업로드는 JPEG·PNG·WebP 및 파일당 10MB 이하만 허용한다.

## 이미지 업로드

1. Vercel 프로젝트에 Public Blob Store를 연결한다.
2. Vercel이 생성한 `BLOB_READ_WRITE_TOKEN`을 Production·Preview·Development 환경에 둔다.
3. 로컬 `frontend/.env`에 토큰을 둔다. 배포 백엔드를 사용할 때만 `VITE_API_URL`도 추가한다.

```dotenv
BLOB_READ_WRITE_TOKEN=...
VITE_API_URL=https://mongle-backend.onrender.com/api
```

4. 의존성을 설치하고 실행한다.

```bash
pnpm install
pnpm dev
```

`pnpm dev`는 Vite와 `/api/blob-upload` Vercel 함수를 함께 실행한다. Vercel 내부에서는 `pnpm dev:vite`로 Vite만 실행해 재귀 호출을 막는다.
Vercel CLI를 처음 사용하는 PC에서는 로그인과 `mongle` 프로젝트 연결이 한 번 필요하다.

Blob 원본 URL은 백엔드의 프로필·기록 URL 필드에 저장된다. 화면에서는 `/_vercel/image`를 통해 허용된 너비로 리사이징하고 AVIF/WebP로 변환된 이미지를 받는다.

## 프로덕션 빌드

```bash
pnpm build
```

## API 생성

백엔드 OpenAPI 문서를 기준으로 API 함수와 모델을 생성한다. 기본 입력은 현재
macmini backend의 `https://macmini.tailc4f400.ts.net/v3/api-docs`이다.

```bash
pnpm generate-api
```

- `src/apis/generated/mongle-api.ts`: Orval 생성 API 함수, 직접 수정하지 않음
- `src/apis/generated/mongle-api.schemas.ts`: Orval 생성 모델 단일 파일, 직접 수정하지 않음
- `src/apis/queries`: 화면에서 사용하는 `queryOptions`와 query key
- `src/apis/mutations`: 화면에서 사용하는 mutation option
- `src/apis/http.ts`: 생성 API와 기존 ky client 연결

## 검증

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

## 내비게이션

화면과 브라우저 history는 Stackflow가 단독으로 관리한다. Activity·URL·딥링크 규칙은
[`src/stackflow/README.md`](src/stackflow/README.md)를 따른다.

## 주요 기술

- React
- Vite
- Stackflow
- TanStack Query
- Tailwind CSS
- Vitest
