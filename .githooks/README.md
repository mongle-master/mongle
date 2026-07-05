# .githooks

버전관리되는 git 훅 모음. 클론 후 **한 번** 아래를 실행해 활성화한다.

```bash
git config core.hooksPath .githooks
```

## commit-msg

커밋 메시지를 **Angular(Conventional Commits)** 규칙으로 검증한다.

- 형식: `<type>(<scope>): <제목>` — scope 선택, **제목은 한국어**
- type: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`
- 예시
  - `feat(backend): 인물 등록 API 추가`
  - `fix(frontend): 타임라인 정렬 오류 수정`
  - `docs(prd): 기록 작성 화면 상세 스펙 보강`

형식이 맞지 않으면 커밋이 거부되고, 올바른 형식 안내가 출력된다.
