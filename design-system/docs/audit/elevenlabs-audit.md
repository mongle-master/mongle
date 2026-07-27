# ElevenLabs — 컴포넌트별 토큰 의존율 감사

> 기준일: 2026-07-27 · 소스: `getdesign-md/elevenlabs.md` (alpha) `components` 블록
> 집계 기준: 컴포넌트 정의의 속성 1개를 1건으로 센다. 값이 `{token.*}` 참조면
> "토큰", 리터럴(px, transparent, 0)이면 "하드코딩"으로 분류한다. 타이포 속성은
> 복합 토큰 참조 1건으로 친다. border 두께(1px)·그림자는 명세에 거의 등장하지 않아
> 집계에서 제외했다 (못 센 항목 — 한계 참조).

## 컴포넌트별 의존율

| 컴포넌트 | 토큰 | 하드코딩 | 의존율 | 비고 |
|---|---|---|---|---|
| top-nav | 3 | 1 | 75% | height 64 하드코딩 |
| button-primary | 4 | 2 | 67% | padding·height 하드코딩 |
| button-primary-active | 3 | 0 | 100% | |
| button-outline | 3 | 3 | 50% | transparent + padding·height |
| button-tertiary-text | 2 | 1 | 67% | transparent |
| hero-band | 3 | 1 | 75% | padding 96 — spacing.section과 같은 값이나 참조 안 함 |
| gradient-orb-card | 3 | 1 | 75% | padding 32 |
| feature-card | 4 | 1 | 80% | padding 24 |
| product-card-stack | 4 | 1 | 80% | padding 0 (의도된 0도 리터럴로 집계) |
| voice-row | 2 | 2 | 50% | transparent + padding |
| voice-icon-circular | 2 | 1 | 67% | size 32 |
| pricing-tier-card | 4 | 1 | 80% | padding 32 |
| pricing-tier-featured | 4 | 1 | 80% | padding 32 |
| text-input | 4 | 2 | 67% | padding·height 44 |
| badge-pill | 4 | 1 | 80% | padding 4×10 |
| cta-band | 3 | 1 | 75% | padding 96 |
| testimonial-card | 4 | 1 | 80% | padding 32 |
| audio-waveform-card | 3 | 1 | 75% | padding 24 |
| footer | 3 | 1 | 75% | padding 64×48 |
| footer-link | 2 | 1 | 67% | transparent |
| **합계** | **64** | **25** | **72%** | |

## 축별 판독

- 색·타이포·반경 의존율 93~100% — 시각 정체성 축은 완전히 토큰화돼 있다.
- 간격·크기 의존율 0% — 전량 리터럴. 그런데 리터럴 값들이 spacing 토큰 9단계
  (4/8/12/16/20/24/32/48/96)에 거의 정확히 들어맞는다. **토큰이 있는데 참조를
  안 한 상태** — 우리가 이식할 때 간격 참조로 교체하면 의존율 90%+로 올라간다.
- `transparent` 4건은 토큰화 대상이 아니다 (의도된 무배경). 실질 미참조는 21건.

## 고정 10종 교차 비교

벤치마크 공통 집합(Button, Input, Card, Dialog, Checkbox, Badge, Alert, Tabs,
Table, Select)으로 보면:

| 컴포넌트 | 존재 | 변형 수 |
|---|---|---|
| Button | ✓ | 4 (primary/active/outline/tertiary) |
| Input | ✓ | 1 (text-input, focus 시 2px ink border) |
| Card | ✓ | 5 (feature/product-stack/testimonial/pricing×2/orb) |
| Badge | ✓ | 1 (badge-pill, uppercase caption) |
| Dialog | ✗ | 마케팅 서피스에 없음 |
| Checkbox | ✗ | |
| Alert | ✗ | |
| Tabs | ✗ | |
| Table | ✗ | |
| Select | ✗ | |

**4/10.** 부재의 원인은 설계 누락이 아니라 캡처 범위(마케팅 사이트)다. 제품 내부의
폼·다이얼로그·테이블 언어는 이 명세에서 알 수 없다.

## 한계 (못 센 것)

1. 실제 제품 CSS를 분해한 실측이 아니다 — 명세 문서의 선언값 카운트다.
2. hover/active/disabled/focus 상태 표본이 button-active 1건뿐. 상태 의존율은
   계산 불가.
3. 다크 테마는 독립 팔레트가 아니라 surface-dark 3토큰 반전이라 테마별 의존율
   비교가 성립하지 않는다.
4. 그림자·border-width·z-index·모션 값은 명세 범위가 아니라 전수 누락.
5. "실제 로드된 폰트" 검증 불가 — Waldenburg 선언만 있고 웹폰트 URL·자중 분포
   실측 없음.

→ 결론: 이 감사는 **규칙 감사**다 (값의 출처 분포와 용도 규율). 픽셀 감사로
승격하려면 제품 서피스 캡처가 필요하며, 그 공백은 design-qa.md에서 우리 구현
자체의 실측으로 메운다.
