# Mongle Frontend

Mongle의 모바일 우선 웹·PWA 프런트엔드입니다. React 19와 Vite 위에서 동작합니다. 모바일 웹에서는 Stackflow가 화면과 브라우저 history를 관리하고, RN WebView에서는 activity 이동을 Expo Router 네이티브 스택에 위임합니다.

전체 서비스 소개와 백엔드를 포함한 빠른 실행은 루트 [README.md](../README.md)를 참고합니다.

## 기술 구성

| 영역        | 기술                                           |
| ----------- | ---------------------------------------------- |
| UI          | React 19, TypeScript, Tailwind CSS 4, Radix UI |
| 내비게이션  | Stackflow 2, Expo Router WebView bridge        |
| 서버 상태   | TanStack Query 5                               |
| API         | Orval 생성 함수, ky adapter                    |
| 테스트      | Vitest, Testing Library, Playwright            |
| 배포·이미지 | Vercel, Vercel Blob, Vercel Image Optimization |

## 실행 환경

- Node.js `20.19+` 또는 `22.12+`
- pnpm `10+`
- API를 제공할 Mongle 백엔드

```bash
pnpm install
```

### 화면과 API 기능 실행

```bash
pnpm dev:vite
# http://localhost:3000
```

Vite는 `/api` 요청을 기본적으로 `http://localhost:18080`에 프록시합니다. 이는 `backend/docker-compose.yml`의 호스트 포트와 같습니다.

다른 백엔드에 연결할 때는 브라우저용 API URL이 아니라 프록시 대상인 `BACKEND_URL`을 지정합니다.

```bash
BACKEND_URL=http://localhost:8080 pnpm dev:vite
BACKEND_URL=https://mongle-backend.onrender.com pnpm dev:vite
```

### 사진 업로드

사진은 브라우저에서 Vercel Blob으로 직접 업로드하고 백엔드에는 URL만 저장합니다. JPEG·PNG·WebP, 파일당 10MB 이하를 지원합니다.

최초 한 번 Vercel 프로젝트를 연결하고 환경변수를 내려받습니다.

```bash
pnpm exec vercel link
pnpm exec vercel pull
```

`frontend/.env`에는 다음 값을 둡니다.

```dotenv
BLOB_READ_WRITE_TOKEN=...
VITE_AMPLITUDE_API_KEY=...
```

이후 Vite와 `/api/blob-upload` Vercel 함수를 함께 실행합니다.

```bash
pnpm dev
```

`pnpm dev`는 내부적으로 `vercel dev`를 실행합니다. Vercel 내부의 개발 명령은 `pnpm dev:vite`로 분리해 재귀 실행을 막습니다.

## 화면과 URL

| 화면           | URL                                     | 설명                                                |
| -------------- | --------------------------------------- | --------------------------------------------------- |
| 홈             | `/home`                                 | 기간별 관계 지도와 1년 전 오늘 회고                 |
| 몽글라인       | `/timeline`                             | 전체 기록, 활동 흐름, 사람·카테고리 필터            |
| 사람           | `/people`                               | 검색·정렬·즐겨찾기와 사람 추가                      |
| 설정           | `/settings`                             | 홈 기본 기간, 태그, 다크 모드, 테스트 사용자 초기화 |
| 사람 상세      | `/people/:personId`                     | 프로필과 사람별 타임라인                            |
| 사람 등록·수정 | `/people/new`, `/people/:personId/edit` | 인물 정보와 관계 태그 관리                          |
| 기록 상세      | `/events/:eventId`                      | 기록 내용·사진 조회와 수정 진입                     |
| 기록 작성·수정 | `/record`                               | 단계형 작성, `personId`·`eventId` 파라미터 지원     |

하단의 홈·몽글라인·사람·설정은 하나의 `Main` activity 안에서 전환됩니다. 방문한 탭은 마운트된 상태로 남아 검색어, 필터, 스크롤을 보존합니다. 상세 규칙은 [`src/stackflow/README.md`](src/stackflow/README.md)에 있습니다.

RN 앱 안에서는 `Main`과 인물 내부 step만 현재 WebView에서 유지합니다. activity push·replace·pop은 브리지 메시지로 전달되어 Expo Router가 WebView 단위로 처리합니다. 앱 실행 방법은 [앱 README](../app/README.md)에 있습니다.

## 코드 구조

```text
src/
├── apis/
│   ├── generated/       # Orval 생성 함수·모델
│   ├── mutations/       # mutation option
│   ├── queries/         # query option과 query key
│   └── http.ts          # 생성 API와 ky client 연결
├── components/          # 도메인·공통 UI
├── lib/                 # 인증, identity, validation, format 등
└── stackflow/
    ├── activities/      # push·modal 화면
    ├── onboarding/      # 이름→프로필 전용 스택
    ├── tabs/            # 홈·몽글라인·사람·설정
    └── stackflow.config.ts
```

앱 시작 시 브라우저에 저장된 UUID로 토큰을 발급받습니다. 프로필 설정을 마친 사용자는 샘플 데이터를 멱등 시드한 뒤 앱 스택에 진입합니다. 별도의 계정이나 비밀번호는 사용하지 않습니다.

## API 코드 생성

백엔드 OpenAPI 문서에서 API 함수와 타입을 생성합니다. `VITE_API_URL`의 host에 `/v3/api-docs`를 붙여 스키마를 읽습니다.

```bash
VITE_API_URL=http://localhost:8080/api pnpm generate-api
```

- `src/apis/generated/mongle-api.ts`: 생성 API 함수
- `src/apis/generated/mongle-api.schemas.ts`: 생성 모델
- 생성 파일은 직접 수정하지 않습니다.

## 명령어

| 명령                  | 용도                                           |
| --------------------- | ---------------------------------------------- |
| `pnpm dev:vite`       | Vite 개발 서버                                 |
| `pnpm dev`            | Vite와 Vercel Blob 함수 통합 실행              |
| `pnpm build`          | 프로덕션 빌드                                  |
| `pnpm test`           | Vitest 단위·컴포넌트 테스트                    |
| `pnpm test:storybook` | Storybook 테스트                               |
| `pnpm lint`           | ESLint 검사                                    |
| `pnpm typecheck`      | TypeScript 검사                                |
| `pnpm generate-api`   | OpenAPI 기반 API·타입 생성                     |
| `pnpm storybook`      | Storybook 개발 서버                            |
| `pnpm ci`             | lint, format, typecheck, test, build 전체 검사 |

## 배포

Vercel 배포 설정은 `vercel.json`에 있습니다. 모든 앱 URL은 `index.html`로 rewrite되어 직접 진입과 새로고침을 지원합니다. 설치형 PWA 메타데이터와 아이콘은 `public/manifest.json`, `public/logo192.png`, `public/logo512.png`에서 관리합니다.
