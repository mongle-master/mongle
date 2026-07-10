# stackflow 내비게이션 기반

[daangn/stackflow](https://github.com/daangn/stackflow) v2 기반 스택 내비게이션. 현재는 기존
TSR 라우트를 건드리지 않는 `/stack` 샌드박스로 목표 아키텍처를 실물 검증하는 단계다.

## 왜 stackflow인가 (origin/main의 페인포인트)

- `lib/record-navigation.ts`: `returnTo`·`returnPersonId`·`detailReturnTo`·`detailReturnPersonId`
  4개 search param으로 "어디서 왔는지"를 수동 직렬화 (record.tsx의 저장 후 분기만 7갈래).
  스택에서는 뒤로가기 = `pop()` 하나다.
- 뒤로가기 버튼이 `history.back()`이 아닌 새 Link push → 브라우저 히스토리 오염.
- 인물 프로필↔타임라인 토글이 매번 push → 같은 문제. 여기서는 step(replaceStep)이다.
- 탭 전환마다 화면 언마운트 → 필터·스크롤 등 상태 소실. 여기서는 Main activity 하나가
  탭을 품어(당근 공식 데모 패턴) 상태가 보존된다.
- 모바일 push/pop 전환·iOS 엣지 스와이프백이 공짜로 온다 (basic-ui cupertino).

## 구조

| activity      | URL                                                   | 역할                                  |
| ------------- | ----------------------------------------------------- | ------------------------------------- |
| `Main`        | `/stack/:tab` (home·timeline·people·settings)         | 하단 탭 셸. 탭 전환 = `replaceStep`   |
| `Person`      | `/stack/people/:personId` (`?view=profile\|timeline`) | 프로필/타임라인 = step                |
| `EventDetail` | `/stack/events/:eventId`                              | 뒤로가기 = pop, returnTo 불필요       |
| `Record`      | `/stack/record` (`?personId=&eventId=`)               | fullScreen 모달 present, 아래 탭 유지 |
| `NotFound`    | `/stack/404`                                          | history-sync fallback                 |

- 딥링크(`defaultHistory`): 상세 URL로 새로고침해도 아래에 Main이 깔려 뒤로가기가 앱 이탈이 아니다.
- history-sync가 **생성하는 URL에는 항상 trailing slash가 붙는다**(`/stack/home/`, 라이브러리
  하드코딩). 인바운드 매칭은 슬래시 유무 모두 허용하므로 동작엔 영향 없지만, 컷오버 시
  기존 URL 문자열과의 정확한 일치가 필요하면 이 차이를 감안해야 한다.
- TSR 공존: `routes/stack.$.tsx` splat 하나가 `<Stack/>`을 마운트. `/stack/**`의 URL 해석은
  history-sync 소관. splat 밖으로 나가는 URL 변경(기존 화면 이동)은 TSR 소관 그대로.

## 컷오버 계획 (이후 PR)

1. 화면별 이전: 기존 route 컴포넌트를 activity로 옮기고 `Link`/`useNavigate` →
   `useFlow`/`useStepFlow`, `Route.useParams/useSearch` → `params`로 치환.
2. `record-navigation.ts` 삭제 (returnTo 계열 전부).
3. `STACK_PREFIX` 제거 + 기존 URL로 라우트 매핑(`/`, `/timeline`, `/people`, `/settings`는
   Main 멀티 라우트 + encode/decode), TSR 라우트·router-plugin 제거 여부 결정.
4. 필요 시 basic-ui 셸을 `@stackflow/react-ui-core` 훅 기반 커스텀 셸로 교체(스와이프백 유지 가능).
