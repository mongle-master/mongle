# mustpass — 스택 내비게이션 기반 (src/stackflow/)

> 기준: PRD README §12.1(하단 내비), 각 화면 PRD의 진입/복귀 흐름. 이 목록이 깨지면 회귀다.

## 기반 (이번 단계, /stack 샌드박스)

- [ ] `/stack` 진입 시 홈 탭으로 리다이렉트되고 `/stack/home`이 뜬다.
- [ ] 탭 전환(홈↔몽글라인↔사람↔설정)은 URL을 바꾸되 **히스토리 엔트리를 만들지 않는다**
      (탭 4번 전환 후 브라우저 뒤로가기 = /stack 이전 화면으로 이탈).
- [ ] 탭 전환 후 돌아와도 탭 내부 상태(입력값)가 남아 있다 (Main activity 미언마운트).
- [ ] 인물 push 후 프로필↔타임라인 토글은 URL(`?view=`)만 바뀌고 히스토리가 늘지 않는다.
- [ ] 이벤트 상세는 홈·몽글라인·인물 어디서 push해도 **뒤로가기 한 번**으로 원래 화면·상태로
      돌아온다 (returnTo 류 param 없음).
- [ ] 기록(＋)은 어느 탭에서 열어도 아래 탭 화면이 유지된 채 위로 덮이고, 닫으면 탭
      선택·상태가 그대로다. (PRD 12.1 "탭 선택을 바꾸지 않는다")
- [ ] 상세 URL(`/stack/people/1`)로 **새로고침·직접 진입** 시 화면이 뜨고, 뒤로가기가 앱
      이탈이 아니라 Main으로 떨어진다 (defaultHistory).
- [ ] 브라우저 뒤로/앞으로가 스택 pop/push와 항상 일치한다.
- [ ] 매칭 안 되는 `/stack/**` URL은 NotFound activity로 떨어진다.
- [ ] iOS 엣지 스와이프백으로 pop된다 (cupertino 테마).
- [ ] `/stack` 밖 기존 화면(`/`, `/people` 등)은 동작 변화가 전혀 없다.

## 컷오버 시 (이후 PR, 프리픽스 제거 단계)

- [ ] 기존 URL 전부 보존: `/`, `/timeline`, `/record`, `/people`, `/people/new`,
      `/people/:id`, `/people/:id/timeline`, `/people/:id/edit`, `/settings`, `/events/:id`.
- [ ] 북마크·공유된 기존 URL 딥링크가 전부 살아 있다.
- [ ] `record-navigation.ts`(returnTo 계열)가 삭제되고 동일 UX가 pop/replace로 재현된다.
- [ ] 기록 저장 후 "첫 연결된 사람의 타임라인" 랜딩이 유지된다 (replace로).
- [ ] vercel.json SPA rewrite가 스택 URL에도 그대로 적용된다.
