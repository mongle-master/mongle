# 고요 (Goyo) — Mongle Design Language

## 방향

Mongle의 화면은 [Apple DESIGN.md](../../getdesign-md/apple.md)의 시각 언어를
일기·감정 기록·주변인 기록 도구에 맞게 적용한다.
콘텐츠(기억, 사진, 감정)가 먼저 보이고 UI 크롬은 조용히 물러난다.
유일한 색조 액센트(warm amber)는 절제되어 기록 행위 자체에 집중하게 한다.

Apple이 제품을 박물관 전시품처럼 다루듯, 우리는 사용자의 기억을 그렇게 다룬다.
벽(크롬)은 사라지고 유물(기록)이 주인공이 된다.

- 기본 캔버스: `#ffffff` (순백) / 보조 캔버스: `#f5f5f7` (parchment)
- 표면: `#fafafc` (pearl) — 카드, 입력 필드
- 기본 글자: `#1d1d1f` (near-black ink), 보조: `#6e6e73`, 희미: `#86868b`
- 유일한 브랜드 액센트: `#b45309` (warm amber — light) / `#e8a84c` (dark)
- 서체: Inter(영문) + Pretendard(한글) + 손글씨 폰트(기록 본문)
- 버튼: pill (9999px radius) — Apple의 시그니처
- 카드·패널: `12px` radius
- 콘텐츠 최대 폭: `680px` (일기 읽기 최적)
- 모바일: 하단 탭 내비게이션, 전체 폭 카드

amber는 주요 CTA, 활성 상태, 포커스 링에만 사용한다.
넓은 배경이나 장식에 사용하지 않는다.
Apple의 로고, 상표, 전용 서체(SF Pro)와 제품 판매 구조는 복제하지 않는다.

---

## 법적/윤리적 경계

> Apple의 로고, 상표, 전용 서체(SF Pro Display/Text)와 제품 카탈로그·스토어
> 화면 구조(IA)는 복제하지 않는다. 가져가는 것은 색 관계, 밀도, 위계, 모션의 원리다.

---

## DO / DON'T 원칙

### 색

- DO: 흰 캔버스(#ffffff)를 시스템 앵커로 유지. parchment(#f5f5f7)로 리듬을 만든다.
- DO: amber(#b45309)는 주요 CTA, 활성 탭, 포커스 링에만. 아낄수록 강해진다.
- DO: 표면 색 변화(white ↔ parchment)로 섹션을 구분. 선(shadow)보다 면(color).
- DO: 감정 색(emotion palette)은 기록 콘텐츠 안에서만 사용. 크롬에는 쓰지 않는다.
- DO: 다크 모드에서 amber는 밝게(#e8a84c), 캔버스는 near-black(#121212)으로.
- DON'T: amber를 섹션 배경이나 카드 fill로 사용하지 않는다.
- DON'T: 두 번째 채도 높은 액센트를 도입하지 않는다.
- DON'T: 장식 그라디언트를 사용하지 않는다. Apple에 그라디언트 토큰은 0개다.
- DON'T: 순수 검정(#000000)을 텍스트에 사용하지 않는다 — #1d1d1f가 ink.

### 타이포그래피

- DO: 디스플레이 600 + 본문 400. Apple의 "weight 500은 의도적으로 부재" 규칙 유지.
- DO: 디스플레이에서 음의 자간(-0.02em)을 적용 — "Apple tight" 느낌.
- DO: 일기 본문은 손글씨 폰트(Onglip Eunbyeol)로 감정적 질감을 준다.
- DO: 본문 15px, 행간 1.6. Apple의 17px/1.47을 모바일에 맞게 조정.
- DON'T: 손글씨 폰트를 UI 크롬(버튼, 내비, 라벨)에 사용하지 않는다.
- DON'T: 700 이상 weight를 사용하지 않는다. 600이 최대.

### 밀도와 간격

- DO: 8px 기본 단위. 카드 내부 24px, 섹션 간 48~80px.
- DO: 여백이 콘텐츠의 받침대. 기록 카드 위아래로 충분한 공기.
- DO: 카드 안에 카드를 반복하지 않는다.
- DO: 터치 타겟 최소 44px (Apple HIG).
- DON'T: 그림자로 깊이를 표현하지 않는다 — 표면 색 변화 + hairline border.
- DON'T: 한 화면에 Card를 5개 이상 쌓지 않는다.

### 모션

- DO: 상태 전이 120~200ms, 색/opacity/transform만.
- DO: Apple의 `scale(0.95)` active micro-interaction 차용.
- DO: 새 기록 저장 시 짧은 강조(300ms fade-up).
- DO: `prefers-reduced-motion`에서 이동 애니메이션 제거.
- DON'T: 반복 애니메이션을 사용하지 않는다.
- DON'T: 300ms 초과 전환 애니메이션 금지.

### elevation

- DO: Apple의 "그림자는 정확히 하나" 철학. 제품 사진(→ 우리: 기억 사진)에만.
- DO: UI 깊이는 표면 색 변화(white → parchment → pearl)로 표현.
- DO: 오버레이(dialog, sheet)에만 backdrop-blur + 최소 그림자.
- DON'T: 카드에 box-shadow를 기본으로 붙이지 않는다.

### 도메인 확장 (일기·감정 기록·주변인)

- 감정 색 팔레트는 레퍼런스에 없는 우리 도메인 요소.
  Apple의 절제 문법 안에서 정의: 채도를 낮추고 콘텐츠 영역 안에서만.
  - 기쁨(joy): `#d97706` (warm amber — 브랜드와 같은 족)
  - 평온(calm): `#4a90b8` (quiet blue)
  - 슬픔(sadness): `#7c7fc7` (muted indigo)
  - 분노(anger): `#c05050` (muted red)
  - 감사(gratitude): `#4a9e6e` (soft green)
- 감정 배지는 항상 카드 위에 얹고, 배경으로 사용하지 않는다.
- 일기 편지지(letter paper)는 괘선 패턴으로 질감을 주되, 저투명.
- 인물 카드(PersonCard)는 pearl surface + hairline, 아바타는 원형.
- "1년 전 오늘" 카드는 parchment 배경으로 시간적 거리감.

---

## 토큰 정본

실제 값의 정본은 `src/styles/globals.css`다. Storybook과 쇼케이스 HTML이 이 파일을 직접 사용한다.

| 토큰군 | 용도 |
|---|---|
| `--background`, `--foreground` | 순백 캔버스와 near-black ink |
| `--card`, `--popover` | pearl 카드 표면과 오버레이 |
| `--primary` | 주요 CTA·활성의 warm amber |
| `--secondary`, `--muted`, `--accent` | 조작·hover·비활성 표면 |
| `--destructive` | 삭제·위험 액션 |
| `--emotion-*` | 감정 기록 도메인 색 (5종) |
| `--radius-*` | pill(버튼) / lg(카드) / sm(입력) |
| `--shadow-*` | 오버레이 전용 (최소 사용) |

---

## 컴포넌트 원칙

1. shadcn 구조의 소유형 컴포넌트를 사용한다 (npm 의존 아님).
2. headless 프리미티브(Radix) 위에 우리 토큰으로 스타일.
3. CVA + data-attribute variant. 모든 요소에 `data-slot` 마킹.
4. 한 화면에서만 쓰는 조각은 공용화하지 않는다.
5. 모든 입력은 label, 오류 문구, 키보드 포커스를 제공한다.
6. 색만으로 상태를 구분하지 않는다 (아이콘·텍스트 병행).
7. 버튼은 pill (radius-pill) — Apple의 시그니처. 유틸 버튼만 8px.
8. active 상태: `transform: scale(0.95)` — Apple의 유일한 micro-interaction.

---

## Storybook과 검증

- 컴포넌트별 시각 variant + keyboard/focus 상태 story.
- 도메인 컴포넌트(EmotionPicker, DiaryEntry, PersonCard)는 정상, 빈 상태, 긴 텍스트, 모바일 폭 story.
- Story DOM 스냅샷과 비주얼 리그레션은 사용하지 않는다.
- 사람이 훑는 갤러리(HTML 쇼케이스)가 최종 검증 산출물.
