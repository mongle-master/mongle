# Linear — 컴포넌트 토큰 의존율 감사

> 기준일: 2026-07-28 · 소스: `getdesign-md/linear.app.md` components: 블록
> 집계 기준: 컴포넌트별 스타일 속성 중 토큰 참조(`{...}`) 수 / (토큰 참조 + 하드코딩) 수
>
> **한계**: 명세에 기재된 속성만 집계 대상. 런타임 실제 DOM의 computed style이
> 아니라 명세 선언 기준이므로 실사용 의존율과 다를 수 있다. padding의 px 값은
> 간격 토큰이 아닌 리터럴로 선언되어 하드코딩으로 집계했다.

## 컴포넌트별 의존율

| 컴포넌트 | 토큰 참조 | 하드코딩 | 의존율 |
|---|---|---|---|
| button-primary (+hover/pressed) | bg·text·typography·rounded = 4 | padding(8px 14px) = 1 | 80% |
| button-secondary/tertiary/inverse | 4 | 1 | 80% |
| pricing-tab (default/selected) | bg·text·typography·rounded = 4 | padding(6px 14px) = 1 | 80% |
| pricing-card (+featured) | bg·text·typography·rounded = 4 | padding(24px) = 1 | 80% |
| feature-card | 4 | 1 | 80% |
| product-screenshot-card | 4 | 1 | 80% |
| testimonial-card | 4 | 1 | 80% |
| customer-logo-tile | 4 | 1 | 80% |
| cta-banner | 4 | 1 | 80% |
| text-input (+focused) | 4 | 1 | 80% |
| changelog-row | 4 | 1 | 80% |
| status-badge | 4 | 1 | 80% |
| top-nav | bg·text·typography·rounded = 4 | height(56px) = 1 | 80% |
| footer | bg·text·typography·rounded = 4 | padding(64px 32px) = 1 | 80% |

**전체 집계**: 토큰 참조 56 / 하드코딩 14 → **의존율 80%**

## 관찰

- 색·타이포·radius는 100% 토큰화. 하드코딩은 전부 **간격(padding/height)**에서 발생.
  Linear는 간격을 토큰 참조가 아니라 리터럴 px로 선언한다 — 간격 토큰(8종)을
  정의해두고도 컴포넌트에서는 직접 px을 쓰는 불일치.
- 포커스 링(2px #5e69d1 50%)은 컴포넌트 토큰이 아니라 전역 규칙으로 처리 —
  ring 토큰의 부재.
- 우리의 설계에 주는 교훈: 간격까지 토큰 참조하면 의존율을 95%+로 올릴 수 있으나,
  간격 리터럴은 가독성과 직결되므로 **색/타이포/radius만 토큰 강제, 간격은 리뷰로
  관리**하는 절충이 실용적이다 (matchday의 결론과 동일).
