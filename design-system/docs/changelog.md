# 결 (Gyeol) 구축 이력

> 단계 H (playbook §8). design-systems-benchmark 플레이북으로 0에서 디자인 시스템을
> 세운 과정의 기록. matchday-saas의 9단계 이력 문서 형식을 따른다.
> 기간: 2026-07-27 단일 세션 · 브랜치: `worktree-gyeol-design-system` (앱 미적용).

## 0. 착수 조건

- 레퍼런스: ElevenLabs (공식 Figma kit·오픈 라이브러리 없음 — code-first 정당).
- 입력: benchmark 저장소의 `getdesign-md/elevenlabs.md` (alpha) + mongle 기존 자산
  (ui-audit 11건, 다이어리 앱 벤치마크 리포트, 앱 styles.css의 편지지·감정 팔레트).
- 제약: 앱에 직접 적용하지 않는다. 독립 패키지 + React 구현 + HTML·Storybook 쇼케이스.

## A. 실측 감사 (문서 3종)

- DevTools 실측을 직접 돌리는 대신, 제3자 명세(getdesign.md)를 정본으로 삼고
  한계를 문서에 명시했다 — matchday가 Spotify 시각 레퍼런스를 getdesign.md +
  픽셀 실측으로 대체한 전례와 같다.
- 컴포넌트별 의존율 집계: 색·타이포·반경 93~100%, **간격·크기 0%**라는 패턴을
  발견. 레퍼런스가 토큰 9단계를 정의해두고 참조를 안 한 상태 — 이식 시 메우기로.
- 고정 10종 교차 비교 4/10 — 마케팅 서피스 캡처의 한계. 제품 내부 폼 언어는
  우리가 정의해야 한다.

## B. 스킨 판정

- 후보: Paper(editorial light) vs Night(dark-first).
- 판정 문장은 도메인 핵심 순간(긴 글 기록·감정 회고)으로: **Paper 채택**.
- matchday의 "진 브랜치 origin 보존"은 **Night를 .dark 역할 반전으로 보존**으로
  번역했다. 프리미티브에 `--*-night` orb 5개를 남겨 재료도 보존.

## C. 규칙 번역

- 법적 경계를 문서 첫 줄에: 로고·상표·Waldenburg·IA 복제 금지.
- Waldenburg 300 → "디스플레이 세리프 weight 300" 규칙으로 승계, 대체 서체
  결정(Cormorant Garamond + Noto Serif KR 300)을 문서화.
- 도메인 확장 7종(감정 orb 5가족, 감정 스케일, 편지지, 손글씨 slot, On This Day,
  사람 chip, Year in Pixels)을 레퍼런스 문법 안에 정의.

## D. 토큰

- 새 패키지라 소비 앱이 없으므로 2계층 시운전 없이 바로 3계층으로 시작 —
  "전수 대조로 계산값 보존" 계약은 재편이 없으므로 생략 가능했다 (성장 후
  재편 시 그 계약을 적용한다).
- shadcn 역할 네이밍 차용 + 레퍼런스의 ink/body 이원 글자 구조(`--body`) 추가.
- `--brand` 주입 훅, warning 상태색 추가(레퍼런스에는 error/success뿐).

## E. 스택

- Tailwind v4 CSS-first (`@theme inline`, 설정 파일 없음) + 소유형 shadcn 구조 +
  Radix headless + CVA + data-slot. 앱과 동일한 스택으로 골라 채택 비용을 0으로.
- Core 12 + Domain 6 = 컴포넌트 18, 전부 story 동반, 인터랙티브/도메인 5종은
  Testing Library 테스트 (role/label 기반).
- 빌드 없이 소스 배포 (`exports`가 `.ts` 직접) — 소비 앱의 Vite가 컴파일.

## F. 검증

- `pnpm typecheck` / `pnpm test` 9/9 / `pnpm build-storybook` passed.
- 실측 QA: 컴파일 CSS 산출물 grep + WCAG 대비 계산으로 **2건 발견·수정**:
  - muted #777169 → #706a63 (4.43 → 4.90:1, AA) — 레퍼런스 값을 그대로 베꼈으면
    조용히 미달이었음 (함정 4 실전).
  - light success #16a34a → #15803d (3.30 → 5.02:1).
- 픽셀 렌더 QA는 패키지 내 Playwright 부재로 미수행 — 한계를 design-qa.md에
  기록하고 "다음에 할 것"으로 이월.

## G. 시각 레퍼런스

- `docs/design-system.html` — 12섹션, 적용 화면 5개(전화기 프레임), Paper/Night
  나란히, 거버넌스. 93KB.
- 생성 방식: Storybook이 출력한 **컴파일 CSS를 인라인** — 사본 CSS를 만들지 않아
  명세·구현 어긋남이 구조적으로 불가. 빌드 스크립트가 클래스 커버리지를 점검한다.
- 자기 완결화 과정 기록: 처음 @fontsource를 base64 인라인했더니 7.5MB → Pretendard
  공식 CDN import로 교체해 93KB. 외부 의존은 폰트 CDN만 (playbook G-2 준수).

## H. 도메인 확장 (이번 릴리스에 포함)

- 도메인 컴포넌트 6종을 첫 버전에 포함 — 앱의 기존 하드코딩(감정 팔레트, 편지지
  괘선, 즐겨찾기 앰버)을 토큰 문법으로 재정의한 것이다.
- 사용처 카운트 기반 variant 승격은 아직 불가 (소비처 0) — 앱 채택 후의 일.

## 밟은 함정 (빌드 인프라)

1. **node 엔진 하한**: rolldown(vite 8)의 네이티브 바인딩이 node 20.18에서
   engines 미충족으로 말없이 스킵됨 → "Cannot find native binding". node 22로
   해결하고 `.node-version` + engines 명시.
2. **corepack 강등**: node 전환 시 corepack이 pnpm 9.15를 주입 → `packageManager`
   필드(pnpm@10.30.1, 앱과 동일)로 고정.
3. **radix-ui 통합 패키지 타입명**: `Dialog.RootProps`가 아니라 `Dialog.DialogProps`
   (프리픽스 있음). 앱 코드보다 타입 오류가 먼저 알려줬다.
4. **Storybook 10 스토리 타입**: 필수 props가 있는 컴포넌트의 render-only 스토리는
   `args`를 요구한다 — 더미 args가 아니라 실제 값으로 채웠다.

## 0.2.0 — 앱 채택 (같은 PR)

독립 산출물로 세운 시스템을 앱이 소비하기 시작했다. 앱 ui/를 패키지 컴포넌트로
교체하지는 않는다 — 앱은 최신 shadcn 소유 소스(앱 고유 variant·접근성 로직 보유)라
**토큰만 패키지에서 import**하고 컴포넌트는 디자인 언어에 맞춰 정렬했다.

### 패키지 쪽 정비

- elevation 4단계를 정본으로: `--shadow-card/float/overlay` 폐기, 앱에서 검증된
  `--elevation-1..4`(라이트/다크) + `shadow-e1..e4` 유틸리티로 통합.
- 감정 "읽기" 계층 `--emotion-*-text` 신설 (라이트 AA 전면 변형 / 다크 파스텔) —
  파스텔을 글자에 그대로 쓰면 대비 1.3~1.9:1이라 design-qa 발견 3으로 조치.
- `--favorite` 토큰 신설 — 즐겨찾기 별을 경고색에서 역할 분리 (ui-audit 8-4).
- globals.css에서 bare @import(폰트·tailwind) 제거 — 소비자가 자기 node_modules에서
  선행 import한다. 상대 경로 직접 소비가 Vercel/CI에서 패키지 node_modules를
  요구하지 않게 하는 조치.

### 앱 쪽 채택

- `frontend/src/styles.css` = tailwind + tw-animate + 패키지 globals.css(상대 경로)
  + 앱 폰트(@fontsource + 디스플레이 세리프 2종 추가) + 앱 전용 층. 팔레트 정의 0.
  앱 타이포 스케일(11/13/15, #117 계약)은 import 이후 재선언으로 보전.
- 일관성 정렬: Button(primary-hover·destructive-foreground 토큰화), Badge, Card 반경
  16px, PageTitle·기록 상세 제목을 디스플레이 세리프 300으로, DialogShell 잉크
  오버레이·카드 표면, MonogramAvatar/ListField/PersonForm의 앰버·dark: 쌍을 토큰으로.
- 신규 공통 컴포넌트: `ui/orb`(대기 orb), `person/person-chip`(2곳 치환 — 카드·상세의
  사람 pill 드리프트 수렴), `home/throwback-card`(home-tab 인라인 60줄 추출). 전부
  스토리 동반(mustpass).
- 전역 적용: record-activity 감정 6색 리터럴 → 감정 텍스트 토큰 5색, 온보딩 앰버
  blob → Orb, 온보딩·이벤트 상세 헤드라인 디스플레이 세리프화, text-[10px] 9곳 →
  text-micro 토큰(신설), tag-color-picker ring 토큰화.
- 검증: 앱 CI(lint·prettier·typecheck·test·build) + build-storybook + 스토리 테스트
  217건 통과. 컴파일 CSS에서 새 토큰·유틸리티 실측 확인.

### 의도적으로 안 한 것

- relation-force-map 그래프 내부(zinc 잔여·stroke·CATEGORY_COLORS) — 데이터 시각화
  팔레트라 개별 시각 확인 필요. 별도 PR.
- 12/14/17px 잔여 임의 타이포 — 토큰 사이 값이라 렌더 변동 위험. text-micro(10px)만
  등록.
- EmotionPicker(5가족 단일 선택)·GratitudeList 앱 이식 보류 — 앱의 감정은 서버 칩
  다중 선택 모델이라 5가족 피커와 맞지 않고, 감사 일기 기능은 아직 없다. 패키지에는
  남아 있고 기능 추가 시 재검토.
- Playwright 픽셀 QA — 패키지·앱 모두 미설치. design-qa는 컴파일 CSS 실측 수준.

## 0.3.0 — 컴포넌트 언어 완전 적용 (같은 PR)

0.2.0이 토큰 중심 채택이라 앱 화면이 레퍼런스 언어와 동떨어져 보인다는 리뷰를
받고, 컴포넌트 언어를 앱에 완전 적용했다.

- Button: 전 형태 pill(기본 40px), 무게 500. 32px 사각 기본 버튼 폐지.
  아이콘 버튼은 원형. button-group 문맥만 예외 반경.
- Input/Textarea: 44px, 반경 8px, 포커스 2px 잉크 보더(패딩 보정).
- 무게 감량: 앱 전역 `font-extrabold`/`font-black`(800/900)을 제목 500,
  라벨 600으로 (약 70곳). 레퍼런스 언어에 800/900은 없다.
- 디스플레이 세리프 300 확대: PageTitle 외 인물 이름, 온보딩, 인증 화면,
  기록 상세 제목.
- eyebrow: ListGroupLabel, 인물 프로필 섹션 라벨, 기록 상세 메타.
- orb 분위기: 기록 감정 단계(아바타 뒤 warm), 홈 헤더(calm), 온보딩(warm).
- 예외: 몽글 로고 워드마크는 브랜드 마크라 extrabold 유지.

## 다음 단계

1. relation-force-map 그래프 내부 토큰화 (시각 확인 동반).
2. Playwright 픽셀 QA로 design-qa를 렌더 실측으로 승격.
3. 사용처 카운트가 쌓이면 variant 승격 + 모바일 프리미티브 (playbook H).
