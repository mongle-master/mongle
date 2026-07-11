# stackflow 내비게이션

[daangn/stackflow](https://github.com/daangn/stackflow) v2 기반 스택 내비게이션.
앱의 모든 화면이 activity이며, TSR은 부트스트랩 셸(`routes/__root.tsx` + splat `routes/$.tsx`)로만 남는다.

## 왜 stackflow인가 (구 구조의 페인포인트)

- 구 `lib/record-navigation.ts`: `returnTo`·`detailReturnTo` 등 search param 4개로
  "어디서 왔는지"를 수동 직렬화 (record의 저장 후 분기만 7갈래). 스택에서는 `pop()` 하나다.
- 뒤로가기 버튼이 `history.back()`이 아닌 새 Link push → 브라우저 히스토리 오염.
- 인물 프로필↔타임라인 토글이 매번 push → 여기서는 step(`replaceStep`)이라 히스토리 불변.
- 탭 전환마다 화면 언마운트 → 상태 소실. 단일 Main activity가 탭을 품어(당근 공식 데모 패턴)
  검색어·필터·스크롤이 보존된다.
- 모바일 push/pop 전환·iOS 엣지 스와이프백이 공짜로 온다 (basic-ui cupertino).

## 구조

| activity      | URL                                     | 전환                                       |
| ------------- | --------------------------------------- | ------------------------------------------ |
| `Main`        | `/:tab` (home·timeline·people·settings) | 탭 셸. 탭 전환 = `replaceStep`(히스토리 X) |
| `Person`      | `/people/:personId` (`?view=timeline`)  | push. 프로필/타임라인 = step               |
| `PersonNew`   | `/people/new`                           | push. 등록 후 `replace('Person')`          |
| `PersonEdit`  | `/people/:personId/edit`                | push. 저장 pop / 삭제 pop(2)               |
| `EventDetail` | `/events/:eventId`                      | push. 뒤로가기 = pop, returnTo 불필요      |
| `Record`      | `/record` (`?personId=&eventId=`)       | fullScreen 모달 present, 아래 탭 유지      |
| `NotFound`    | `/404`                                  | history-sync fallback                      |

- **TSR과의 역할 분담**: splat(`routes/$.tsx`) 하나가 `<Stack/>`을 마운트하고 URL 해석은
  history-sync 소관. TSR에는 별칭 리다이렉트만 남는다 — `/` → `/home`(routes/index.tsx),
  구 `/people/:id/timeline` → `/people/:id?view=timeline`(routes/people.$personId.timeline.tsx).
  URL 생성(fill)이 activity의 가장 구체적인 라우트 하나만 쓰므로 **activity당 라우트는 1개**를
  유지하고 별칭은 TSR 리다이렉트로 처리한다.
- **딥링크**: 상세 URL 직접 진입 시 `defaultHistory`가 아래에 Main(해당 탭)을 깔아
  뒤로가기가 앱 이탈이 되지 않는다.
- **데스크톱**: `routes/$.tsx`가 스택 전체를 `mx-auto max-w-md`(448px) relative 컨테이너에
  가둔다. basic-ui 화면은 fixed가 아니라 positioned 조상 기준 absolute라 슬라이드도 그 안에서만 일어난다.
- history-sync가 **생성하는 URL에는 항상 trailing slash가 붙는다**(`/home/`, 라이브러리
  하드코딩). 인바운드 매칭은 슬래시 유무 모두 허용하므로 동작엔 영향 없다.
- 셸 컴포넌트: 탭 화면은 `components/tab-shell.tsx`, push 화면은
  `components/activity-shell.tsx` (구 AppShell의 대응물, dvh 대신 h-full 기준).
  데스크톱 컨테이너는 `components/stack-viewport.tsx` (앱·온보딩 스택 공용).

## 온보딩 퍼널 (`onboarding/`)

온보딩(이름 → 프로필)도 스택 내비게이션이지만 **별도 stackflow 인스턴스**다:

- 인증 전이라 앱 스택을 마운트하면 데이터 화면이 무토큰 쿼리를 쏘게 되고,
- history-sync 없이 URL을 안 건드려야 딥링크가 온보딩 완료 후 그대로 살아난다.

단계 전환은 push(슬라이드). 프로필→이름 뒤로가기(pop)를 허용하며, 이름을 고쳐 재제출하면
**새 identity(UUID)로 재인증**한다 — 백엔드가 기존 UUID의 이름 변경을 받지 않아서이고,
프로필 완료 전에는 시드가 없어 잃는 데이터도 없다(구 UUID 사용자는 서버에 잔류).
부트스트랩 상태 머신(main.tsx)과는 activity params가 아니라
`OnboardingContext`로 대화한다. stackflow의 components 타입이 Register 전체 키를 요구해서
두 인스턴스가 `activity-components.ts` 맵 하나를 공유한다.

## 남은 것 / 알려진 것

- dev 콘솔의 "Cannot update a component (Transitioner) while rendering (Stack)" 경고:
  초기 진입 시 history-sync의 동기 replaceState를 TSR 구독이 받아서 나는 개발용 경고로,
  동작엔 영향 없음. TSR 라우트를 완전히 제거하면 사라진다.
- basic-ui 셸이 디자인과 안 맞으면 `@stackflow/react-ui-core` 훅으로 커스텀 셸 교체 가능
  (스와이프백 유지).
- TSR(router-plugin·routeTree) 완전 제거 여부는 별도 결정 — 현재는 리다이렉트·devtools
  셸로만 사용.
