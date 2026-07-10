# 배포 이어하기 — 핸드오프 프롬프트

> 개인 노트북에서 `git pull` 후, 아래 **"복사해서 붙여넣기"** 블록을 Claude Code 에 그대로 붙여넣으면 이어서 진행된다.
> 배포가 끝나면 이 파일은 지워도 된다.

---

## 복사해서 붙여넣기 ↓↓↓

```
mongle 백엔드를 Render + Supabase 로 무료 배포하는 작업을 이어서 해줘.
코드 작업은 이미 끝났고 main 에 푸시돼 있어(커밋: feat(backend): Render+Supabase 무료 배포 지원).
절차의 SSOT 는 backend/docs/runbook/deploy.md 다 — 먼저 그걸 읽어.

지금 내 개인 Chrome 프로필(순원, jsw5913@gmail.com)에서 작업 중이야.
브라우저 조작이 가능하면 네가 화면을 몰아주고, 로그인·OAuth 동의처럼 나만 넘을 수 있는
벽에서만 나한테 넘겨줘. 다음 순서로 진행해:

1. Supabase (supabase.com) — 개인 계정으로 로그인(회사 musinsa 계정 아님!).
   - New project: 이름 mongle, 리전 Singapore, Plan Free. DB 비밀번호는 내가 정하게 물어봐.
   - Storage → New bucket: 이름 mongle-images, Public 체크.
   - Settings → Database 에서 host/port/db/user/password 확보.
   - Settings → API 에서 Project URL 과 service_role 키 확보.
2. 위에서 얻은 값으로 Render env 조합을 만들어줘:
   - SPRING_DATASOURCE_URL = jdbc:postgresql://<host>:5432/postgres
   - SPRING_DATASOURCE_USERNAME = postgres
   - SPRING_DATASOURCE_PASSWORD = <DB 비번>
   - SUPABASE_URL = https://<project>.supabase.co
   - SUPABASE_SERVICE_KEY = <service_role 키>
3. Render (render.com) — 개인 계정 로그인 → New → Blueprint → mongle-master/mongle 레포 선택.
   레포 루트 render.yaml 이 서비스를 정의해뒀어. 위 5개 값을 sync:false env 로 입력.
   (SPRING_PROFILES_ACTIVE=prod, SUPABASE_BUCKET, MONGLE_JWT_SECRET 은 render.yaml 에 이미 있음)
4. 배포되면 https://<앱>.onrender.com/actuator/health 가 UP 인지,
   토큰 발급 → 이미지 업로드 → 반환된 Supabase URL 이 열리는지 검증해줘.

주의:
- service_role 키·DB 비번은 민감정보. 화면에서 마스킹되면 내가 직접 Render 에 붙여넣을게.
- 반드시 개인(jsw5913) 계정으로. 회사 musinsa 계정으로 만들지 마.
- 브라우저 확장이 개인 프로필에 없으면, 내가 클릭할 테니 너는 단계별로 정확히 짚어줘.
```

## ↑↑↑ 여기까지 복사

---

## 참고: 지금까지 된 것 (새 세션이 몰라도 되게 요약)

**아키텍처** — 카드 등록 없이 무료. 앱=Render(Docker, free), DB=Supabase Postgres, 이미지=Supabase Storage.
로컬 개발(H2 파일 + 로컬 FS)은 그대로, 배포만 `prod` 스프링 프로필로 분기.

**코드 변경 (커밋·푸시 완료)**
- 이미지 저장 추상화: `ImageStorage` 인터페이스 + `ImageValidator`(검증 공통).
  `LocalImageStorage`(`@Profile("!prod")`) ↔ `SupabaseImageStorage`(`@Profile("prod")`, Storage REST 업로드).
- `postgresql` 드라이버 추가 + `application-prod.yml`(Postgres/JWT/Supabase 전부 env 필수).
- 레포 루트 `render.yaml`(Blueprint, rootDir=backend, Docker, free, health=/actuator/health).
- `backend/docs/runbook/deploy.md` 를 Render+Supabase 절차로 갱신(= 배포 SSOT).
- 로컬 검증 완료: 기본 프로필 부팅 → health UP → 토큰 발급 → 이미지 업로드 OK.

**남은 것 (위 프롬프트가 시키는 것)** — Supabase 프로젝트/버킷/키 생성, Render Blueprint 배포, 검증.

**아직 안 한 것** — 프론트엔드가 배포된 `onrender.com` 주소를 API 베이스로 바라보게 하는 설정(별건).
