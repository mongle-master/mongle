# 고요 (Goyo) — Mongle Design Language

## 방향

Mongle의 화면은 [Linear DESIGN.md](../../getdesign-md/linear.app.md)의 시각 언어를
일기·감정 기록·주변인 기록 도구에 맞게 적용한다.
가장 깊은 어둠의 캔버스 위에서 기록이 조용히 떠오르고,
유일한 색조 액센트(lavender-violet)는 절제되어 기록 행위 자체에 집중하게 한다.

- 기본 캔버스: `#0c0a0f` (violet 기운이 도는 near-black — Linear `#010102`를 일기의 온기로 데움)
- 표면 사다리: `#16141a` → `#1c1a21` → `#222028` → `#28262e`
- 기본 글자: `#f4f2f7`, 보조: `#a8a3b0`, 희미: `#6e6a76`
- 유일한 브랜드 액센트: `#7c6fd4` (lavender-violet)
- 서체: Inter(영문 UI) + Pretendard(한글) + Noto Serif KR(편집 타이틀) + 손글씨(기록 본문)
- 버튼·입력: `8px` radius, 카드·패널: `12px`
- 콘텐츠 최대 폭: `680px` (일기 읽기 최적)
- 모바일: 하단 탭 내비게이션, 카드 기반 기록 목록

lavender는 주요 CTA, 활성 상태, 포커스 링에만 사용한다.
넓은 배경이나 장식에 사용하지 않는다.
Linear의 로고, 상표, 전용 서체와 프로젝트 관리 구조는 복제하지 않는다.

---

## 법적/윤리적 경계

> Linear의 로고, 상표, 전용 서체(Linear Display/Text/Mono)와 SaaS 프로젝트 관리
> 화면 구조(IA)는 복제하지 않는다. 가져가는 것은 색 관계, 밀도, 위계, 모션의 원리다.

---

## DO / DON'T 원칙

### 색

- DO: 캔버스(#0c0a0f)를 시스템 앵커로 유지. 미약한 violet undertone이 의도다.
- DO: lavender(#7c6fd4)는 브랜드 마크, 주요 CTA, 포커스 링, 활성 탭에만.
- DO: 표면 사다리(4단계)로 위계를 표현. 단계를 건너뛰지 않는다.
- DO: 감정 색(emotion palette)은 기록 콘텐츠 안에서만 사용. 크롬에는 쓰지 않는다.
- DON'T: lavender를 섹션 배경이나 카드 fill로 사용하지 않는다.
- DON'T: 두 번째 채도 높은 액센트를 도입하지 않는다 (주황, 분홍, 초록 등).
- DON'T: 대기 그라디언트, 스포트라이트 카드를 추가하지 않는다.
- DON'T: #000000 순수 검정을 캔버스로 사용하지 않는다.

### 타이포그래피

- DO: 디스플레이 600 + 본문 400 조합. 700 이상 디스플레이는 사용하지 않는다.
- DO: 디스플레이에서 음의 자간을 적용 (Noto Serif KR은 -0.01em).
- DO: 일기 본문은 손글씨 폰트로 감정적 질감을 준다.
- DO: 편집 타이틀(페이지 제목, 섹션 헤드)은 세리프 디스플레이로 기록의 무게를 준다.
- DO: eyebrow은 양의 자간(+0.08em)으로 분류 마커 역할.
- DON'T: 손글씨 폰트를 UI 크롬(버튼, 내비, 라벨)에 사용하지 않는다.
- DON'T: 세리프 디스플레이를 본문 길이의 글에 사용하지 않는다.

### 밀도와 간격

- DO: 4px 기본 단위. 카드 내부 24px, 섹션 간 64~96px.
- DO: 어두운 캔버스 자체가 여백. 섹션 분리는 표면 리프트로.
- DO: 카드 안에 카드를 반복하지 않는다.
- DO: 기록 목록 행 최소 높이 56px (터치 타겟).
- DON'T: 흰 배경 기반 레이아웃을 기본으로 만들지 않는다 (다크가 기본).
- DON'T: 그림자로 깊이를 표현하지 않는다 — 표면 사다리 + hairline border 사용.

### 모션

- DO: 상태 전이 120~200ms, 색/opacity/transform만.
- DO: 새 기록 저장 시 짧은 강조(300ms fade-up).
- DO: `prefers-reduced-motion`에서 이동 애니메이션 제거.
- DON'T: 반복 애니메이션(로딩 스피너 제외)을 사용하지 않는다.
- DON'T: 페이지 전환에 300ms 초과 애니메이션을 사용하지 않는다.

### 도메인 확장 (일기·감정 기록)

레퍼런스(Linear)에 없는 우리 도메인 요소를 Linear의 문법 안에서 정의한다.

- 감정 색 팔레트: 각 감정은 채도를 낮춰 어두운 표면 위에 얹는다.
  - 기쁨(joy): `#e8a84c` (따뜻한 amber)
  - 평온(calm): `#6b9ecf` (부드러운 blue)
  - 슬픔(sadness): `#8b7fc7` (muted indigo — lavender와 같은 족)
  - 분노(anger): `#cf6b6b` (muted red)
  - 감사(gratitude): `#6bcf8e` (soft green)
- 감정 배지는 항상 15% 투명 배경 + 해당 색 텍스트. 단색 fill로 사용하지 않는다.
- 일기 편지지(letter paper)는 괘선 패턴으로 질감을 주되, 저투명으로 조용하게.
- 세리프 디스플레이(Noto Serif KR)는 편집 순간 전용 — 기록이 '남는 글'이라는 무게.
- 인물 카드(PersonCard)는 surface-1 + hairline, 아바타는 원형.

---

## 토큰 정본

실제 값의 정본은 `src/styles/globals.css`다. Storybook과 쇼케이스 HTML이 이 파일을 직접 사용한다.

| 토큰군 | 용도 |
|---|---|
| `--background`, `--foreground` | near-black 캔버스와 밝은 기본 글자 |
| `--card`, `--popover` | 표면 사다리 카드와 오버레이 |
| `--primary` | 주요 CTA·활성의 lavender-violet |
| `--secondary`, `--muted`, `--accent` | 조작·hover·비활성 표면 |
| `--destructive` | 삭제·위험 액션 |
| `--emotion-joy/calm/sadness/anger/gratitude` | 감정 기록 도메인 색 |
| `--radius-*` | 카드·버튼 모서리 |
| `--shadow-overlay/pop` | 오버레이 깊이 (최소 사용) |

---

## 컴포넌트 원칙

1. shadcn 구조의 소유형 컴포넌트를 사용한다 (npm 의존 아님).
2. headless 프리미티브(Radix) 위에 우리 토큰으로 스타일.
3. CVA + data-attribute variant. 모든 요소에 `data-slot` 마킹.
4. 한 화면에서만 쓰는 조각은 공용화하지 않는다.
5. 모든 입력은 label, 오류 문구, 키보드 포커스를 제공한다.
6. 색만으로 상태를 구분하지 않는다 (이모지·텍스트 병행).

---

## Storybook과 검증

- 컴포넌트별 시각 variant + keyboard/focus 상태 story.
- 도메인 컴포넌트(EmotionPicker, DiaryEntry)는 정상, 빈 상태, 긴 텍스트, 모바일 폭 story.
- Story DOM 스냅샷과 비주얼 리그레션은 사용하지 않는다.
- 사람이 훑는 갤러리(HTML 쇼케이스)가 최종 검증 산출물.
