# @mongle/design-system

**고요 (Goyo)** — Mongle의 디자인 시스템.

Apple DESIGN.md의 시각 언어를 일기·감정 기록·주변인 기록 도메인에 적용.
[design-systems-benchmark/playbook.md](https://github.com/sbkim/design-systems-benchmark) 절차를 따름.

## 구조

```
src/
  styles/globals.css     ← 토큰 정본 (2계층: primitive + semantic)
  components/            ← 소유형 React 컴포넌트 (CVA + data-slot)
  lib/utils.ts           ← cn()
docs/
  design.md              ← DO/DON'T 원칙 문서 (Phase C)
  audit-apple.md         ← Apple 실측 감사 (Phase A)
  design-system.html     ← 자기 완결 시각 레퍼런스 (Phase G) — 브라우저로 열 것
.storybook/              ← Storybook 설정
```

## 사용

```bash
pnpm install
pnpm storybook        # 컴포넌트 개발
pnpm typecheck        # 타입 검증
```

쇼케이스: `docs/design-system.html`을 브라우저에서 직접 연다.

## 컴포넌트 인벤토리

| 구분 | 컴포넌트 |
|---|---|
| 액션 | Button (pill, 5 variant, 4 size) |
| 폼 | Input, Textarea, SearchField, Switch (iOS) |
| 데이터 | Card, Badge (감정 5색 포함), Tabs, GroupedList, ListRow |
| 내비게이션 | NavigationBar (frosted), TabBar (bottom) |
| 오버레이 | Dialog |
| 레이아웃 | SectionHeader (eyebrow + display) |
| 도메인 | DiaryEntry, EmotionPicker, PersonCard |

토큰: 색(amber ramp, neutral ramp, 감정 5색, semantic 역할), 타이포 스케일
(hero/display/tagline/body/caption/micro), 간격 스케일, radius(pill/lg/sm),
elevation(overlay 전용).

## 원칙 요약

- 단일 액센트 (amber) — 아낄수록 강해진다
- 면으로 구분 — 그림자보다 표면 색 변화
- Pill 버튼 — Apple 시그니처
- 44px 터치 타겟
- scale(0.95) active — 유일한 micro-interaction
- 손글씨 폰트는 기록 본문 전용, UI 크롬 금지

## 레퍼런스

- Apple DESIGN.md (design-systems-benchmark/getdesign-md/apple.md)
- playbook.md (design-systems-benchmark/playbook.md)
- matchday 사례 (design-systems-benchmark/cases/matchday/)
