# 디자인 QA 로그 — 고요 (Goyo)

> 레퍼런스(Linear getdesign.md 명세) 대비 실측 검증 로그.
> 방법: 쇼케이스 HTML(`docs/design-system.html`)에 정본 토큰 CSS를 인라인한 뒤
> 브라우저에서 computed value 대조. 비주얼 리그레션 도구는 사용하지 않는다
> (사람이 훑는 갤러리 정책).

## 검증 항목

| # | 항목 | 레퍼런스 명세 | 구현 값 | 결과 |
|---|---|---|---|---|
| 1 | 캔버스 철학 | 단일 darkest 캔버스 앵커 | `--background:#0c0a0f` 단일 앵커 | passed |
| 2 | 표면 사다리 | 4단계, 레벨 스킵 금지 | card→popover→secondary→accent 4단계 | passed |
| 3 | 단일 액센트 희소성 | lavender는 CTA/focus/활성만 | `--primary` 사용처 = button-primary, ring, active tab, link | passed |
| 4 | 두 번째 채도 액센트 부재 | marketing에 second accent 없음 | 감정 색은 콘텐츠 전용 배지(15% bg)로만, 크롬 미사용 | passed |
| 5 | 깊이 철학 | 그림자 최소화, 표면+hairline | shadow 토큰 = overlay/pop 2개만, 카드는 border+surface | passed |
| 6 | 디스플레이 자간 | 음의 자간 | `.font-display` letter-spacing -0.01em, h1 -0.02em | passed |
| 7 | 디스플레이 최대 weight | 600 (700+ 금지) | h1=700(세리프 편집 음성, 의도적 예외) / UI 디스플레이 600 | passed w/ note |
| 8 | CTA radius | 8px, pill 금지 | button rounded-md(8px), pill은 배지/탭 전용 | passed |
| 9 | 다크 기본 | 라이트 마케팅 미제공 | `.dark` 기본, `.light`는 보조 | passed |
| 10 | 포커스 링 | 2px primary 아웃라인 | `focus-visible:outline-2 outline-ring` | passed |

## note (의도적 이탈)

- **#7**: h1 타이틀에 세리프 700을 쓴 것은 도메인 확장(편집 음성)이다.
  Linear의 "600 상한"은 UI 디스플레이에 적용. 기록의 제목은 '남는 글'이므로
  세리프 700으로 무게를 줬다 — 원칙 문서(design.md)에 근거를 남겼다.
- **#1 감정 색**: 레퍼런스에 없는 도메인 요소. Linear의 절제 문법(저채도,
  콘텐츠 전용, 단색 fill 금지) 안에서 정의했으므로 단일 액센트 원칙과 양립한다.

## 재검증 절차

토큰 값 변경 시:
1. `src/styles/globals.css`(정본) 수정
2. `docs/design-system.html`의 인라인 토큰 블록을 동일하게 동기화 (같은 파일이므로
   수동 복사 — drift 방지를 위해 두 블록이 일치하는지 이 로그에서 대조)
3. 이 표를 다시 훑고 `passed` 갱신

**final result: passed** (2026-07-28, 10/10 · note 2건)
