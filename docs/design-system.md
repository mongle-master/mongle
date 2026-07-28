# 결 (Gyeol) — Mongle 디자인 시스템

> 종이의 결, 관계의 결, 감정의 결.
> Airtable의 편집적 절제(흰 종이 · 먹색 타입 · 여백 · 따뜻한 시그니처 표면)를
> 일기 · 감정 기록 도메인으로 번역한 Mongle의 디자인 언어.

시각 레퍼런스(스와치 · 타이포 · 컴포넌트 · 도메인 패턴 · 적용 화면 · 거버넌스)는
**[`design-system.html`](./design-system.html)** 을 브라우저로 열어 본다(자기 완결 단일 파일).

## 법적 · 윤리적 경계

**Airtable의 로고 · 상표 · 전용 서체(Haas Grotesk) · 웹사이트 화면 구조(IA)는 복제하지 않는다.**
가져간 것은 색 관계 · 밀도 · 위계 · 여백의 원리. 서체는 Pretendard + 손글씨(Onglip Eunbyeol)로 대체.

## 한 문장 원칙

> 색은 감정에 살고, 크롬은 조용하다. 여백은 비어 있는 게 아니라 사색의 공간이다.
> 강조는 크기와 색으로 하지 굵기로 하지 않는다(display 는 500 초과 금지).

## 토 정본

`frontend/src/styles.css` 가 정본이다. 3계층:

- **Tier 1 · Primitives** (`:root`) — ink 램프(편집적 먹색) · warm 시그니처 램프(칩/감정의 원색) · status · warm dark 램프. 테마 불변.
- **Tier 2 · Semantic** (`:root, .light` / `.dark`) — 역할 토큰, 전부 `var(--tier1)`. dark/light 재매핑의 유일 소유지.
- **Tier 3 · Component** — 별도 계층 없음. CVA variant + `@layer components` 가 Tier 2 소비.

앱은 토큰을 하나도 정의하지 않는다. 이 규칙이 "룩앤필을 토큰 교체만으로 갈아끼운다"의 물리적 보장.

## 색 규율

- 잉크-종이 무채가 토대. 따뜻한 시그니처 팔레트는 **칩/감정의 원색**.
- 구획은 hairline 테두리(`--border`)와 명도 차이로 — 무거운 box-shadow 금지(color-block first).
- DO — 한 화면에 근검정 주요 버튼 하나, 칩의 부드러운 색점, 편지지 괘선, 넉넉한 여백.
- DON'T — 장식 그라디언트, 감정/칩마다 새 색을 칠한 넓은 배경, 순수 차가운 흰 배경 남용.

## 칩과 감정 (데이터 모델)

Mongle의 감정 · 카테고리 · 날씨 · 관계태그는 모두 **per-chip hex color 를 가진 칩**이다(고정 enum 아님).
따라서 색은 토큰이 아니라 칩 데이터에서 오며, 렌더는 `TagChip`/`ChipBadge` 가 `coloredTagStyle`로
"표면 위 색 염색"(휴식 12% 틴트 + 잉크 색, Gyeol 의 fg/bg 규칙)을 그린다.

- `ChipBadge` — 칩 표시 전용 배지 (타임라인 카테고리·감정 등).
- `ChipPicker` — 칩 단일/다중 선택 (감정·카테고리·관계태그 선택 통합).
- `GYEOL_CHIP_PALETTE`(`lib/relation-tag-colors.ts`) — 디자인 언어 권장 시드 팔레트.
  피커에 연결하지 않는다(칩 색은 저장 데이터라 선택지 변경은 기존 데이터와 어긋남).

## 도메인 확장 (Airtable 문법 안에서)

- `OnThisDayCard` — 1년 전 오늘 회고. 따뜻한 표면(`--surface-warm`) + 손글씨 발췌 + 감정 배지.
- `EmotionStatBar` — 감정 분포 막대 + 범례.
- 손글씨(`--font-hand`)는 기록 본문·감성 화면에만 — UI 크롬(버튼·내비·라벨) 금지.
- 편지지(`--letter-paper`, 28px 고정)는 기록 화면 손글씨 `leading-7` 과 정렬.

## 컴포넌트 원칙

1. `frontend/src/components/ui` 의 부품을 우선 사용; 이미 있는 것을 다시 만들지 않는다.
2. 공용 부품은 도메인 · Router · API 를 모르도록 구조적 타입만 받는다(ChipRef 가 구조 호환).
3. 여러 하위 영역을 선택적으로 조합할 때만 compound; 역할이 드러나는 이름(Root/Header/…).
4. 모든 입력은 label · 오류 문구 · 키보드 focus. 색만으로 상태 구분 금지.
5. 예상 사용처만으로 공용화하지 않는다 — 승격 근거는 사용처 카운트.

## 밀도 · 상태 · 모션

- 간격 4-베이스. 반경 위계(xs 2 · sm 6 · md 10 · lg 12 · pill). 목록 행 48px+, 모바일 주요 버튼 44px+.
- 로딩은 layout 유지 `Skeleton`, 없음은 원인+다음 행동의 `Empty`/`EmptyState`.
- 전이 120~200ms 의 색 · opacity · transform만. `prefers-reduced-motion` 에서 이동 제거.

## 검증 · 강제

- 자동: `pnpm ci`(lint · prettier · typecheck · test · build) + `pnpm build-storybook`.
- 원칙 방어선: 하드코딩 컬러 금지 · 감정/칩 색 규율은 이 문서가 판정 기준
  (`no-unknown-classes` lint 는 미구성 — 의도적 예외는 주석으로 남긴다).
- Story DOM 스냅샷 · 비주얼 리그레션은 사용하지 않는다.
