# 최초 접속·인증 — mustpass

- 최초 접속에서 이름을 입력받고 `crypto.randomUUID()`로 사용자 UUID를 만든다.
- `{ userId, username }`은 localStorage에 저장한다. 사용자 식별자는 이름이 아니라 UUID다.
- 앱을 시작할 때마다 저장된 UUID와 이름으로 `POST /api/v1/auth/token`을 호출해 JWT를 발급받는다.
- refresh token은 사용하지 않는다.
- 최초 사용자는 인증 후 프로필 설정 화면을 표시한다. 남/여 기본 아바타를 순환 선택하거나 이미지를 직접 업로드할 수 있고, 설정을 건너뛸 수도 있다.
- 프로필 설정을 완료하거나 건너뛴 뒤 `PATCH /api/v1/users/me/profile`을 호출하고, 그 다음 `POST /api/v1/seed`를 호출한다.
- 이미 프로필 설정을 완료한 사용자는 인증 후 바로 `POST /api/v1/seed`를 호출한다. 서버가 `User.demoSeeded`로 사용자별 최초 1회만 생성하므로 매번 호출해도 데이터가 중복되지 않는다.
- UUID가 없으면 라우터를 열지 않고 이름 입력 화면을 표시한다.
- 인증·프로필 저장·시드 호출이 실패하면 오류와 재시도 동작을 제공한다.
