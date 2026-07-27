# Apple 실측 감사 — 도메인 적용 관점

> 감사 기준일: 2026-07-28
> 소스: design-systems-benchmark/getdesign-md/apple.md (5개 화면 분석 결과)
> 한계: 실제 DevTools 실측이 아닌 getdesign.md 명세 기반. 픽셀 QA는 추후 수행.

---

## 6축 개요

### 1. 토큰 아키텍처
- 공식 토큰 시스템 없음 (Figma kit 없음, 오픈 라이브러리 없음)
- getdesign.md에서 추출한 구조: colors / typography / rounded / spacing / components
- 색은 단일 액센트(#0066cc) + 중성 표면 사다리. 그라디언트 토큰 0개.
- 타이포는 SF Pro Display(≥19px) + SF Pro Text(<19px) 2종. Weight 300/400/600/700 (500 부재).

### 2. 컴포넌트 인벤토리
- button-primary (pill), button-secondary-pill, button-dark-utility, button-pearl-capsule
- global-nav (44px black), sub-nav-frosted (52px, backdrop-blur)
- product-tile (full-bleed, light/dark/parchment 3종)
- store-utility-card (18px radius, hairline border)
- search-input (pill, 44px height)
- floating-sticky-bar (parchment, blur)
- footer (parchment, dense links)

### 3. 디자인↔코드 대응
- 공식 문서 없음. getdesign.md가 서드파티 명세 역할.
- 실제 computed style과 명세 간 차이 가능성 있음 (playbook §10.1 경고).

### 4. API 철학
- 해당 없음 (오픈 라이브러리 없음)
- 우리가 차용하는 것은 "code-first, 소유형 컴포넌트" 노선 (shadcn 철학)

### 5. 접근성
- 포커스 링: 2px solid #0071e3 (primary-focus)
- 터치 타겟: 44px (HIG 기준)
- 색 대비: ink(#1d1d1f) on white = 16.75:1, muted(#86868b) on white = 4.02:1 (AA 통과)
- active 피드백: scale(0.95) — 시각 + 촉각(모바일)

### 6. 거버넌스
- Apple 내부 팀 관리. 외부 기여 불가.
- 버전 관리 없음. 우리는 git + playbook 절차로 대체.

---

## 도메인 적용 판정 (Phase B)

### Apple 시각 언어 × 일기/감정 기록 도메인 정합성

| Apple 원칙 | 일기 도메인 적용 | 정합 |
|---|---|---|
| 콘텐츠가 주인공, 크롬은 조용 | 기억·감정이 주인공, UI는 물러남 | ✓ 높음 |
| 단일 액센트 (blue) | 단일 warm amber — 감정적 따뜻함 | ✓ 높음 |
| Photography-first | 사진·편지지 질감 중심 | ✓ 높음 |
| Surface alternation (white/parchment) | 섹션 구분, "1년 전 오늘" 카드 | ✓ 높음 |
| Pill button | 모바일 일기 액션에 적합 | ✓ 높음 |
| Low density, generous whitespace | 일기 읽기 최적 (680px) | ✓ 높음 |
| One shadow philosophy | 조용한 일기장에 적합 | ✓ 높음 |
| Museum gallery metaphor | 기억을 소중히 전시 | ✓ 높음 |

**판정**: Apple의 "조용한 전시장" 시각 언어는 일기/감정 기록 도메인과 높은 정합.
콘텐츠(기억)가 벽(크롬)보다 중요하다는 철학이 정확히 일치.

### 차용하지 않는 것
- 제품 판매 구조 (스토어, 카탈로그 IA)
- SF Pro 전용 서체 (Inter/Pretendard로 대체)
- 56px hero (모바일 일기 앱에 과잉)
- Edge-to-edge product tile (일기 카드에 부적합)

---

## 원시 팔레트 (이름 붙이기 전)

### 색
- Accent: #0066cc → 도메인 변환: #b45309 (warm amber, light) / #e8a84c (dark)
- Canvas: #ffffff / #f5f5f7 (parchment)
- Ink: #1d1d1f
- Muted: #86868b / #6e6e73
- Surface dark: #272729 / #2a2a2c / #252527 → 도메인: #1c1c1e / #242426 / #161618
- Hairline: #e0e0e0 → rgb(0 0 0 / 8%)

### 타이포
- Display: 56/40/34/28px, weight 600, -0.28~0px tracking
- Body: 17px/1.47 → 도메인: 15px/1.6 (모바일)
- Caption: 14/12px
- Weight ladder: 300/400/600 (500 부재)

### Radius
- pill: 9999px (버튼, 검색)
- lg: 18px (카드) → 도메인: 12px
- sm: 8px (유틸 버튼)
- none: 0px (full-bleed)

### 간격
- 8px 기본. 섹션 80px. 카드 24px. 버튼 11-22px.
