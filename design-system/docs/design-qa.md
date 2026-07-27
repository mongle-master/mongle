# Design QA 로그 — 결 (Gyeol) 0.1.0

> 기준일: 2026-07-27
> 방법: Storybook 정적 빌드 산출물(`storybook-static/assets/iframe-*.css`)을
> 토큰 정본의 실측 아티팩트로 삼아 값·셀렉터 존재를 grep 검증 + WCAG 2.1 상대
> 휘도 공식으로 대비율 계산. 브라우저 렌더 픽셀 대조가 아니라 **컴파일된 CSS
> 실측**이다 (한계 참조).
> 레퍼런스: `getdesign-md/elevenlabs.md` 선언값.

## 1. 토큰 정본 검증 (globals.css → 컴파일 CSS)

| 검증 항목 | 기대 | 실측 | 결과 |
|---|---|---|---|
| primitive neutral-800 | #292524 | #292524 | passed |
| primitive orb-mint | #a7e5d3 | #a7e5d3 | passed |
| primitive orb-rose-night | #c4849a | #c4849a | passed |
| semantic light primary | var(--neutral-800) | var(--neutral-800) | passed |
| semantic light body | var(--neutral-750) | var(--neutral-750) | passed |
| semantic dark background | var(--neutral-950) | var(--neutral-950) | passed |
| `.dark` 시맨틱 블록 | 1개 | 1개 | passed |
| orb 감정 셀렉터 | 5개 | 5개 | passed |
| radius-pill | 9999px | 9999px | passed |
| shadow-card | 0 4px 16px | 0 4px 16px | passed |
| 디스플레이 폰트 스택 | Cormorant Garamond 선행 | Cormorant+Garamond 로드 | passed |
| Pretendard 번들 | @fontsource 로드 | 확인 | passed |

타이포 스케일은 `@theme inline` 정책대로 유틸리티에 값이 인라인된다 — 전역 변수로
발행되지 않는 것이 정상 (사용처: `text-display-lg` 등 유틸리티로 확인).

## 2. 대비율 실측 (WCAG 2.1)

### 1차 측정 — 발견

| 쌍 | 비율 | 판정 | 조치 |
|---|---|---|---|
| ink #0c0a09 / canvas #f5f5f5 | 18.12:1 | AAA | — |
| body #4e4e4e / canvas | 7.63:1 | AAA | — |
| **muted #777169 / canvas** | **4.43:1** | **AA 미만** | **수정 → #706a63** |
| muted-soft #a8a29e / canvas | 2.31:1 | FAIL | 비활성 전용 유지 (면제 조항) |
| on-primary #fff / ink pill #292524 | 15.17:1 | AAA | — |
| Night fg #fafafa / bg #0c0a09 | 18.93:1 | AAA | — |
| Night body #d6d3d1 / bg | 13.26:1 | AAA | — |
| Night muted-fg #a8a29e / bg | 7.83:1 | AAA | — |
| destructive #dc2626 / card #fff | 4.83:1 | AA | — |
| warning #b45309 / card | 5.02:1 | AA | — |
| **success #16a34a / card** | **3.30:1** | **AA-large** | **수정 → #15803d (라이트)** |

### 발견 1 — muted가 AA 경계 아래

레퍼런스 실측값 `#777169`는 캔버스 위에서 4.43:1 — 일반 본문 AA(4.5:1)에 0.07
부족하다. 레퍼런스를 그대로 베켰으면 조용히 미달이었다 (playbook 함정 4: "레퍼런스의
숫자를 그대로 옮기지 말 것").

- 수정: `--neutral-500` #777169 → **#706a63** (4.90:1, AA). 따뜻한 색상은 유지.
- 재검증: 컴파일 CSS에서 `--neutral-500:#706a63` 확인. passed.

### 발견 2 — success가 작은 글자 기준 미달

레퍼런스의 `semantic-success #16a34a`는 흰 카드 위 3.30:1 — 큰 글자/아이콘만
통과한다. 우리 success 배지는 12px 텍스트에 이 색을 쓴다.

- 수정: 라이트 `--success`를 green-600 → **green-700 #15803d** (5.02:1, AA).
  다크는 green-400(#4ade80) 유지 — 어두운 카드 위에서 이미 충분.
- 재검증: 컴파일 CSS에서 `--success:var(--green-700)` 확인. passed.

### 허용된 미달 — muted-soft

`#a8a29e`(2.31:1)는 **비활성 텍스트 전용**이다. WCAG 1.4.3은 비활성 컨트롤을
적용 제외한다. 이 용도 제한은 design.md DON'T로 강제한다 (비활성 외 사용 금지).

## 3. 포커스·상태

- 레퍼런스 명세에 포커스 링 정의가 없다 (Known Gap). 우리는 `--ring`(라이트: ink /
  다크: paper-white) + `focus-visible:ring-2 ring-ring/60 ring-offset-2`를 전
  인터랙티브 컴포넌트에 적용. ink 링 on canvas = 18:1.
- 입력 포커스는 레퍼런스 규칙("focus 시 2px ink border")을 그대로: `focus-visible:border-2 border-foreground` + 패딩 보상으로 레이아웃 흔들림 없음.

## 4. 회귀 점검

- `pnpm typecheck` passed
- `pnpm test` 9/9 passed (5 파일)
- `pnpm build-storybook` passed
- 토큰 수정 후 컴파일 CSS 재실측 — 위 표의 재검증 행 참조.

## 5. 한계

1. 브라우저 렌더링 픽셀 대조가 아니다 — jsdom은 계산 스타일을 해결하지 못하고,
   이 패키지에는 Playwright가 없다. 폰트 로드 후 실제 행간·자간 렌더는 Storybook
   수동 확인에 의존한다.
2. `prefers-reduced-motion`, iOS Safari 뒤로가기 제스처 같은 환경 특이 동작은
   실기기 미검증.
3. 손글씨 서체(Onglip Eunbyeol)는 패키지에 번들하지 않는다 — 소비 앱이 폰트
   자산을 제공할 때만 `font-hand`가 의도대로 렌더된다 (없으면 Pretendard 폴백).

## 최종 결과: passed (발견 2건 수정·재검증 완료)
