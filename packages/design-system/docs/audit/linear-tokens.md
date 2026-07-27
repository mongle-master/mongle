# Linear — 토큰 3축 감사 (정의 / 소비 / 거버넌스)

> 기준일: 2026-07-28 · 소스: `getdesign-md/linear.app.md` · 한계: 명세 재분석,
> 런타임 실측 아님. 집계 기준: 명세 frontmatter에 선언된 토큰을 전수 집계.

## 축 1 — 정의 (Definition)

| 군 | 개수 | 내용 |
|---|---|---|
| 색 | 23 | primary 3(hover/focus 포함), ink 4, canvas/surface 5, hairline 3, inverse 3, brand-secure, success, overlay |
| 타이포 | 13 | display-xl~mono (family·size·weight·lineHeight·letterSpacing 5속성 풀세트) |
| radius | 8 | xs 4 ~ xxl 24 + pill/full |
| 간격 | 8 | xxs 4 ~ section 96 (4px 기반) |
| 컴포넌트 토큰 | 17 | components: 블록에 컴포넌트별 bg/text/typography/rounded/padding 선언 |

계층 구조: **primitive(색 램프) → 컴포넌트 토큰** 2단. 시맨틱 역할 토큰
(`--primary` 같은 역할명)은 없고, 색은 용도명(ink/canvas/hairline)으로 직접 이름 붙임.
shadcn식 `role/role-foreground` 쌍과 다르다는 점이 핵심 관찰.

## 축 2 — 소비 (Consumption)

- 컴포넌트 정의는 100% `{colors.*}` / `{typography.*}` / `{rounded.*}` 참조 —
  인라인 하드코딩 없음 (명세 한정).
- 타이포 소비 규칙: display 군은 weight 500~600 + 음의 자간(-3.0px@80px ~ 0@body).
  body 군은 400. button/eyebrow만 500.
- 색 소비 규칙: lavender는 brand mark · primary CTA · focus ring · link emphasis
  4곳에만 등장. 명세가 "scarce(희소)"라고 명시.
- 표면 소비 규칙: 위계 = 표면 사다리 승격. 레벨 스킵 금지("Avoid skipping levels").

## 축 3 — 거버넌스 (Governance)

- 단일 소유자(Linear 내부)가 런타임 CSS 변수로 정본 관리. 명세는 그 변수명을 인용.
- 변경 시 명세 frontmatter가 단일 갱신 지점 — 컴포넌트 토큰이 색 토큰을 참조하므로
  색 변경이 전 컴포넌트에 전파되는 구조.
- 폰트는 비공개 → 대체재 정책(SF Pro/Inter/Geist/JetBrains Mono)을 명세가 함께 관리.
- 자동 동기화 파이프라인 부재 — 벤치마크 결론("업계 최상위도 Figma↔Code 자동 동기화
  못 푼다")과 일치. 코드+명세가 정본.

## 우리가 가져갈 것 / 버릴 것

- **가져갈 것**: 표면 사다리 사상, 단일 액센트 희소성 규칙, 음의 자간 디스플레이,
  그림자 최소화 깊이 철학, 4px 간격 기반.
- **버릴 것**: 시맨틱 역할 토큰 부재(우리는 shadcn식 role/-foreground 쌍 채택 —
  다크/라이트 리매핑에 유리), 마케팅 전용 컴포넌트(pricing/testimonial 등),
  비공개 폰트 의존.
