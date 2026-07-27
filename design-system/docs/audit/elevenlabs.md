# ElevenLabs — 6축 개요 감사

> 기준일: 2026-07-27
> 소스: `design-systems-benchmark/getdesign-md/elevenlabs.md` (version alpha) —
> ElevenLabs 마케팅 서피스 실측을 제3자가 명세화한 문서. 공식 Figma kit·오픈
> 컴포넌트 라이브러리는 존재하지 않는다.
> 한계: DevTools computed style 실측을 이번에 직접 수행하지 않았다. 명세 수치를
> 정본으로 삼되, 명세가 스스로 밝힌 Known Gaps(애니메이션 타이밍, 제품 내부 서피스,
> 포커스 외 폼 상태)은 그대로 승계한다. 폰트 선언(Waldenburg)은 라이선스 서체라
> 실측 대체가 필요하다.

## 1. 토큰 아키텍처

- 단층 role 네이밍. `colors.*`(27) / `typography.*`(14) / `rounded.*`(9) / `spacing.*`(9).
- 원시 램프(primitive ramp)가 없다. `hairline` / `hairline-soft` / `hairline-strong`처럼
  역할별로 값이 직접 이름 붙어 있다 — shadcn식 semantic 단층과 같은 철학.
- fg/bg 쌍이 색상 레벨에는 없다 (`on-primary`, `on-dark`가 개별 정의). 타이포 토큰이
  size·weight·line-height·letter-spacing을 묶은 복합 토큰이라는 점이 특징.
- 색은 전부 hex. 다크 테마는 "따로 정의된 팔레트"가 아니라 `canvas-deep` /
  `surface-dark` / `surface-dark-elevated` 3개 토큰으로 드문 드문 반전된다.

## 2. 컴포넌트 인벤토리

마케팅 서피스 20개 정의: top-nav, button(primary/active/outline/tertiary), hero-band,
gradient-orb-card, feature-card, product-card-stack, voice-row, voice-icon-circular,
pricing-tier-card(+featured), text-input, badge-pill, cta-band, testimonial-card,
audio-waveform-card, footer(+link).

고정 10종 교차 비교 집합(벤치마크 공통: Button, Input, Card, Dialog, Checkbox, Badge,
Alert, Tabs, Table, Select) 대비 커버리지: **4/10** (Button, Input, Card, Badge).
제품 내부 서피스(에디터, 플레이그라운드)는 명세가 "부분 캡처"로 표시 — 앱 컴포넌트
감사가 아니라 랜딩 페이지 컴포넌트 감사다.

## 3. 디자인↔코드 대응

- 공식 Figma·코드 라이브러리 없음. 이 명세 자체가 유일한 대응 문서.
- `{token.refs}` 문법으로 토큰 참조를 표기하지만, 실제 제품 CSS와의 매핑은 검증 불가.
- 벤치마크 저장소 결론(comparison/summary §2.4)에 따르면 이 부재는 품질 문제가 아니라
  code-first 철학의 선택으로 취급한다.

## 4. API 철학

- 컴포넌트 API가 공개된 적 없으므로, 명세에서 읽히는 규칙만 추출:
  - CTA는 단 하나 — ink pill. secondary는 outline, tertiary는 텍스트 링크. 3단계 고정.
  - 카드는 `rounded.xl`(16px) 단일 반경, 패딩 24/32px 두 단계.
  - variant는 "별도 엔트리"로 정의 (button-primary / button-outline 분리). CVA식
    열거 variant와 같은 구조.
  - hover 상태는 문서화되지 않음 (Iteration Guide 5항).

## 5. 접근성

- ink(#0c0a09) on canvas(#f5f5f5) 대비 ≈ 17:1 — 본문 AAA.
- body(#4e4e4e) on canvas ≈ 7.4:1 — AAA.
- muted-soft(#a8a29e) on canvas ≈ 2.6:1 — 비활성 전용으로만 허용 가능.
- on-primary 흰색 on ink(#292524) ≈ 14:1 — AAA.
- 터치: pill 40px + 패딩으로 유효 48px, voice-icon 32px은 행 패딩이 48px 확보.
- 포커스 링 명세 부재 (Known Gap). 우리 시스템에서 `--ring`으로 보완해야 한다.
- gradient orb는 장식 전용 — 텍스트·버튼에 쓰지 않는 규칙이 대비 문제를 사전 차단.

## 6. 거버넌스

- 소유 조직·릴리스 프로세스 비공개. 명세 version "alpha"가 말하듯 제3자 문서도 미완.
- 동기화 파이프라인 없음 — 벤치마크 7개 시스템 공통 결론과 일치. 우리가 파이프라인을
  만들 이유가 없다.
- 가져올 것: 색 관계(따뜻한 근검정 ink + 오프화이트 캔버스), 타이포 규율(세리프
  디스플레이 weight 300 고정), 절제(유일 CTA 색, 장식 orb의 용도 제한), 96px 섹션 리듬.
- 가져오지 않을 것: Waldenburg 서체(라이선스), ElevenLabs 로고·상표, 음성 서비스 IA,
  "hover 미문서화" 관행(우리 도메인은 폼 상태가 핵심이라 포커스·오류 상태를 반드시 정의).
