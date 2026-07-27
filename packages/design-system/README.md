# @mongle/design-system

Mongle의 디자인 시스템. Lovable의 따뜻하고 절제된 시각 언어를
일기·다이어리·감정 기록 도구에 맞게 적용한 "Mongle" 디자인 언어를 구현한다.

시각 레퍼런스는 [`docs/design-system.html`](../../docs/design-system.html)을 브라우저로 열어 본다.

## 아키텍처 — 3계층 토큰

```
src/styles/globals.css (정본)
├── Tier 1 · Primitives (:root)     테마 불변 원시 팔레트
│   cream ramp (17단계), terra ramp (8단계), emotion (6종), status
├── Tier 2 · Semantic (:root/.light, .dark)  역할 토큰
│   --background, --primary, --muted … + --emotion-* (도메인 확장)
│   다크/라이트 재매핑은 이 계층에서만
└── Tier 3 · Component  CVA variants + @layer components
    Tier 2를 직접 소비
```

## 사용

```tsx
import '@mongle/design-system/styles'
import { Button, Card, EmotionBadge } from '@mongle/design-system'
```

앱의 CSS는 디자인 시스템 globals.css re-import 한 줄 + 자기 `@source`만.
앱은 토큰을 하나도 정의하지 않는다.

## 개발

```bash
pnpm storybook        # Storybook dev server (6006)
pnpm build-storybook  # 정적 빌드
pnpm typecheck        # tsc --noEmit
```

## 컴포넌트 (18종)

| 분류 | 컴포넌트 |
|---|---|
| 액션 | Button, Checkbox, Switch |
| 입력 | Input, Textarea |
| 표시 | Badge, Avatar, Card, Separator, Skeleton |
| 탐색 | Tabs |
| 오버레이 | Dialog |
| 레이아웃 | Empty |
| 도메인 | EmotionBadge, DiaryEntry, PersonCard |
| 테마 | ThemeProvider, ThemeToggle |

## 설계 결정

- **왜 Lovable인가**: 크림 캔버스, 테두리 구획, 인간적 따뜻함이 일기 도메인과 일치
- **왜 테라코타인가**: 크림과 보색 관계, 따뜻하지만 절제된 액센트
- **왜 3계층인가**: primitive 교체만으로 재스킨 가능, 테마 분기 지점 단일화
- **왜 class 기반 테마인가**: tailwind `dark:` variant와 팔레트 변수가 함께 전환
