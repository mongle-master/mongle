# ElevenLabs — 토큰 3축 감사 (정의 / 소비 / 거버넌스)

> 기준일: 2026-07-27 · 소스: `getdesign-md/elevenlabs.md` (alpha)
> 집계 기준: 명세 YAML 블록에 선언된 엔트리를 1건으로 센다. 실제 CSS 변수 수가
> 아니라 명세 문서 레벨 카운트다 (시스템 간 비교는 절대 수치가 아니라 패턴만 —
> playbook 함정 7).

## 1. 정의 (Definition)

### 색상 27건

| 군 | 토큰 | 수 | 값 성격 |
|---|---|---|---|
| 브랜드·액션 | primary, primary-active | 2 | 따뜻한 근검정 (#292524 / #0c0a09) — Tailwind stone-800/950과 동일 |
| 표면 | canvas, canvas-soft, canvas-deep, surface-card, surface-strong, surface-dark, surface-dark-elevated | 7 | 오프화이트 바닥 → 순백 카드 → 드문 다크 반전 |
| 헤어라인 | hairline, hairline-soft, hairline-strong | 3 | 1px 구분선 3단계 |
| 텍스트 | ink, body, body-strong, muted, muted-soft, on-primary, on-dark, on-dark-soft | 8 | ink→muted-soft 5단계 + 반전용 3 |
| 대기 그라디언트 | gradient-mint, gradient-peach, gradient-lavender, gradient-sky, gradient-rose | 5 | 파스텔 orb 전용 — 시그니처 |
| 시맨틱 | semantic-error, semantic-success | 2 | 최소 존재감 |

관찰:

- **무채색이 20/27 (74%)**. 브랜드 전압은 색상이 아니라 그라디언트 orb 5개가 전부다.
- stone 계열 웜 그레이 — 순수 중성(zinc)보다 종이 질감에 가깝다. 일기 도메인과 정합.
- 상태색 2개뿐. warning/info 없음 — 우리 도메인 확장 지점 (D-3/C-3).

### 타이포그래피 14건

복합 토큰(family + size + weight + line-height + letter-spacing) 14개.

- 디스플레이 5 (mega 64 / xl 48 / lg 36 / md 32 / sm 24) — 전부 Waldenburg **weight 300**,
  음수 letter-spacing (-1.92 ~ 0px).
- Inter 군 9 (title-md 20/500, title-sm 18/500, body-md 16/400, body-strong 16/500,
  body-sm 15/400, caption 14/400, caption-uppercase 12/600 uppercase, button 15/500,
  nav-link 15/500) — 양수 letter-spacing (+0.15~0.96px).

규율: 디스플레이는 절대 볼드하지 않는다. 본문은 400/500만. 이 두 문장이 타이포
시스템 전체다.

### 반경 9건 · 간격 9건

- rounded: 0/4/6/8/12/16/24/pill/full — CTA·배지는 pill, 카드 16, 입력 8로 용도 고정.
- spacing: 4px 기반 9단계 (4/8/12/16/20/24/32/48/96) — 96px이 "section"이라는 이름의
  토큰으로 격상돼 있다. 섹션 리듬이 토큰 레벨 규칙.

## 2. 소비 (Consumption)

명세 `components` 블록 20개 정의의 참조를 집계했다.

| 축 | 토큰 참조 | 하드코딩 | 의존율 |
|---|---|---|---|
| 색상 (배경·글자) | 55 | 4 (`transparent` 4건) | 93% |
| 타이포그래피 | 16 | 0 | 100% |
| 반경 | 17 | 0 | 100% |
| 크기·간격 (height/padding/size) | 0 | 21 | 0% |
| **합계** | **64** | **25** | **72%** |

패턴: **색·타이포·반경은 완전 토큰화, 간격·높이는 전부 하드코딩**. top-nav 64px,
pill 40px, input 44px 같은 제어 높이가 토큰에 없다. 우리가 가져올 때 간격 토큰
9단계와 제어 높이 규칙(40/44px)을 함께 명시해야 공백이 메워진다.

소비 규칙 (Iteration Guide):

- "`{token.refs}` everywhere — never inline hex"
- variant는 별도 엔트리 (합성 대신 나열)
- hover는 문서화하지 않음 ← 우리는 따르지 않음 (폼 중심 도메인)

## 3. 거버넌스 (Governance)

- 문서 버전 alpha, 소유자 불명. 변경 이력·기여 절차 없음.
- Figma↔code 동기화 없음 (업계 공통 — benchmark summary §2.2).
- 라이선스 제약: Waldenburg는 상용 서체. 명세가 대체를 명시 (EB Garamond / GT Sectra).
  → 우리 시스템은 대체 서체 결정을 design.md에 기록하고, 명세의 "Waldenburg 300"을
  "디스플레이 세리프 weight 300"이라는 **규칙**으로 번역해 승계한다.
- 재사용 가능 판정: 색상 관계·타이포 규율·반경/리듬 규칙은 라이선스·상표와 무관하게
  이식 가능. gradient orb 5색 값은 일반 파스텔 톤이라 그대로 써도 무방하나, 우리는
  도메인 의미(감정)를 부여해 확장한다.
