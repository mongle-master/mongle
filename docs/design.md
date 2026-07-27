# Mongle 디자인 시스템

## 방향

Mongle의 화면은 [Lovable](https://lovable.dev)의 따뜻하고 절제된 시각 언어를
일기·다이어리·감정 기록 도구에 맞게 적용한다.
종이처럼 따뜻한 크림 캔버스, 테두리로 구획하는 절제된 깊이,
감정에만 색을 주는 규율로 매일 열고 싶은 기록 공간을 만든다.

- 기본 캔버스: `#f7f4ed` (크림), 카드: `#fdfcfa`
- 기본 글자: `#1c1a14` (웜 차콜), 보조 글자: `#8a8474`
- 기능 액센트: `#b85c38` (테라코타)
- 기본 서체: Pretendard (본문), Onglip Eunbyeol (손글씨·일기 본문)
- 버튼: `8px` radius, CTA·pill: `9999px`
- 카드·컨테이너: `12px` radius, 테두리 `1px solid #eceae4`
- 콘텐츠 최대 폭: 모바일 우선 (stackflow 기반)

테라코타는 주요 CTA, 선택·활성, 포커스 링에만 사용한다.
넓은 배경이나 장식에는 사용하지 않는다.
Lovable의 로고, 상표, 전용 서체(Camera Plain)와 웹사이트 구조는 복제하지 않는다.

## 토큰 정본

실제 값의 정본은 `packages/design-system/src/styles/globals.css`다.
앱과 Storybook은 이 파일을 직접 import한다.

### 3계층 아키텍처

```
Tier 1 · Primitives (:root)     테마 불변 원시 팔레트
  cream ramp   --cream-0 ~ --cream-1000 (17단계, 웜 뉴트럴)
  terra ramp   --terra-100 ~ --terra-800 (테라코타)
  emotion      --joy/calm/sadness/anger/anxiety/gratitude-400/500
  status       --red/amber/green

Tier 2 · Semantic (:root/.light, .dark)  역할 토큰, var()로 Tier 1 참조
  --background, --foreground, --card, --primary, --muted …
  --emotion-{name}, --emotion-{name}-bg (도메인 확장)
  --elevation-1~4, --letter-paper
  다크/라이트 재매핑은 이 계층에서만

Tier 3 · Component  CVA variants + @layer components
  Tier 2를 직접 소비, 별도 파일 없음
```

| 토큰군 | 용도 |
|---|---|
| `--background`, `--foreground` | 크림 캔버스와 웜 차콜 기본 글자 |
| `--card`, `--popover` | 종이 카드와 오버레이 표면 |
| `--primary` | 주요 CTA·선택·활성의 테라코타 |
| `--secondary`, `--muted`, `--accent` | 조작·hover·비활성 표면 |
| `--destructive`, `--warning`, `--success` | 오류·경고·성공 상태 |
| `--emotion-*` | 감정 일기의 6가지 감정 색 (도메인 확장) |
| `--elevation-*` | 따뜻한 저깊이 그림자 (4단계) |
| `--letter-paper` | 편지지 괘선 텍스처 (SVG data URI) |
| `--radius-*` | 카드·버튼 모서리, pill은 9999px |

## 컴포넌트 원칙

1. `packages/design-system/src/components`의 컴포넌트를 우선 사용한다.
2. 공용 컴포넌트는 도메인, Router, API를 알지 못한다.
3. 이미 있는 Button, Card, Input, Badge, Dialog, Tabs를 다시 만들지 않는다.
4. 여러 하위 영역을 선택적으로 조합해야 할 때만 compound component를 만든다.
5. compound component는 `Root`, `Header`, `Content`, `Footer`처럼 역할이 드러나는 이름을 쓴다.
6. 모든 입력은 label, 오류 문구, 키보드 focus를 제공한다. 색만으로 상태를 구분하지 않는다.

## 화면 밀도

- 기본 간격은 `4px` 단위를 사용하고, 카드 사이 여백보다 테두리 명도 차이로 영역을 구분한다.
- 카드 안에 카드를 반복하지 않는다.
- 그림자보다 테두리(`1px solid var(--border)`)로 구획한다 — Lovable의 절제.
- 목록 행의 기본 높이는 48px 이상, 모바일 주요 버튼은 44px 이상.
- 로딩은 layout이 유지되는 `Skeleton`, 데이터 없음은 원인과 다음 행동이 있는 `Empty`.

## 색은 감정에 살고, 크롬은 조용하다

테라코타는 오직 **주요 액션 · 선택 · 활성 · 포커스**에만.
나머지는 크림-차콜 회색조가 책임진다.

- DO — 한 화면에 테라코타 버튼 하나, 감정 배지의 부드러운 색점, 편지지 괘선
- DO — 감정 색은 배경 14% 혼합 + 텍스트 색으로만 (배지, 차트 점)
- DON'T — 장식 그라디언트, 감정마다 새 색을 칠한 넓은 배경
- DON'T — 테라코타 본문/제목, 순수 흰(#ffffff) 페이지 배경
- DON'T — 무거운 box-shadow로 카드 띄우기 — 테두리가 구획의 수단

## 상태와 애니메이션

- 상태 전이는 120~200ms 범위의 색, opacity, transform만 사용.
- `prefers-reduced-motion`에서는 이동 애니메이션을 제거.
- 일기 작성 화면의 손글씨 폰트(Onglip Eunbyeol)는 기록의 친밀감을 위한 것 —
  UI 크롬(버튼, 내비, 라벨)에는 사용하지 않는다.

## Storybook과 테스트

- 디자인 시스템 Storybook은 앱 경로를 읽지 않는다.
- shadcn primitive는 시각 variant와 keyboard/focus 상태를 Storybook에 둔다.
- custom compound component는 정상, 빈 상태, 긴 텍스트, 모바일 폭 story를 둔다.
- Story DOM 스냅샷과 비주얼 리그레션은 사용하지 않는다.

## 벤치마크 출처

`~/studyspaces/design-systems-benchmark` (Spectrum · Material · Fluent 2 · Carbon ·
Polaris · shadcn · Ant, 7개 시스템 분석)의 처방을 적용했다.

| 교훈 | 출처 | 적용 |
|---|---|---|
| primitive → semantic → component 3계층 | Spectrum · Material · Carbon | globals.css 3계층 분리 |
| fg/bg 쌍 | Polaris · shadcn | 감정 배지(--emotion-X ↔ --emotion-X-bg) |
| 테마 = 앨리어스 계층에서만 | 전 시스템 | Tier 2에서만 dark/light 매핑 |
| "토큰 수 ≠ 품질" | Material (1,700개) | ~80개로 절제 |
| code-first, 소유형 컴포넌트 | shadcn | 소스 배포, CVA variants |
