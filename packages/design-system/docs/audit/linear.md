# Linear — 디자인 시스템 감사 (6축 개요)

> 기준일: 2026-07-28 · 소스: `design-systems-benchmark/getdesign-md/linear.app.md`
> (linear.app 마케팅 사이트 실측 명세) · 대상 페이지: home, /intake, /pricing,
> /contact/sales, /build
>
> **한계**: 이 감사는 getdesign.md 제3자 명세를 재분석한 것이다. DevTools computed
> style을 직접 뜬 실측이 아니며, 폰트 로드 여부·运行时 번들 CSS는 검증하지 못했다.
> 제품 UI(이슈 트래커) 내부 색채는 마케팅 명세에 포함되지 않았다.

## 1. 토큰 아키텍처

- **단일 다크 캔버스** `#010102` (blue tint가 도는 near-black)를 시스템 앵커로 사용.
- **4단계 표면 사다리**: canvas → surface-1(#0f1011) → surface-2(#141516) →
  surface-3(#18191a) → surface-4(#191a1b). 위계를 그림자가 아니라 표면 명도로 표현.
- **단일 색조 액센트**: lavender-blue `#5e6ad2`. hover `#828fff`, focus `#5e69d1`.
- 시맨틱 색은 success green `#27a644` 하나뿐. 두 번째 채도 액센트 없음.
- hairline border 3단계 (#23252a / #34343a / #3e3e44).
- 라이트 모드 마케팅 페이지는 존재하지 않음 (다크 전용).

## 2. 컴포넌트 인벤토리

명세에 문서화된 컴포넌트 17종:
button(primary/secondary/tertiary/inverse), pricing-tab(default/selected),
pricing-card(+featured), feature-card, product-screenshot-card, testimonial-card,
customer-logo-tile, cta-banner, text-input(+focused), changelog-row, status-badge,
top-nav, footer.

교차 비교 고정 10종(Button, Input, Card, Dialog, Checkbox, Badge, Alert, Tabs,
Table, Select) 중 명세에 있는 것: Button, Input, Card, Badge, Tabs(pricing-tab).
Dialog/Checkbox/Alert/Table/Select는 마케팅 페이지에 노출되지 않아 감사 불가.

## 3. 디자인↔코드 대응

- 명세가 CSS 변수명(`--color-bg-level-3`, `--color-line-tint` 등)을 직접 인용 —
  표면 사다리 값은 Linear의 정본 CSS 변수에서 추출되었음을 시사.
- 토큰 참조율 추정: 컴포넌트 정의가 전부 `{colors.*}` / `{typography.*}` 참조 형식 —
  명세 수준에서는 하드코딩 색이 관찰되지 않음 (의존율 ~100%, 명세 한정).

## 4. API 철학

- 마케팅 사이트이므로 컴포넌트 API는 공개되지 않음.
- 관찰 가능한 철학: **크롬 최소화, 콘텐츠(제품 스크린샷) 주인공**.
  카드·버튼은 조용한 프레임 역할만 하고, 시선은 제품 UI 캡처로 유도.
- 버튼 radius 8px 고정, pill은 탭/상태 배지 전용 — "CTA를 pill로 만들지 않는다" 규칙.

## 5. 접근성

- 명세에 ARIA·키보드·대비 수치 명시 없음 (감사 불가, 한계로 기록).
- 관찰 가능 사항: 포커스 링은 2px `#5e69d1` 50% opacity 아웃라인.
- 터치 타겟: CTA ≥40px, 탭 ≥36px(터치에서 44px), 입력 ≥44px — 명세 기재.

## 6. 거버넌스

- 전용 서체 3종(Display/Text/Mono) 비공개 배포 — SF Pro / Inter / JetBrains Mono로
  대체 권고. 커스텀 폰트의 폐쇄성이 브랜드 잠금(lock-in) 역할.
- 공식 Figma kit·오픈 컴포넌트 라이브러리 없음 → code-first 추출이 유일한 접근법.
  (이것이 본 저장소가 이 제품을 레퍼런스로 삼은 이유와 같다.)
