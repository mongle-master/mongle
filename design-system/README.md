# @mongle/design-system — 결 (Gyeol)

몽글의 일기·관계 기록 도메인을 위한 디자인 시스템.
[design-systems-benchmark](https://github.com/) 플레이북(단계 A~H)을 따라
ElevenLabs 마케팅 서피스에서 **값이 아니라 규칙**을 추출해 세웠다.

> 이 패키지는 앱에 아직 적용되지 않은 **독립 산출물**이다. 앱 styles.css를
> 건드리지 않는다. 채택은 나중에 `globals.css` re-import 한 줄로 한다
> (docs/design.md "다음에 할 것" 참조).

## 무엇부터 보나

| 파일 | 내용 |
|---|---|
| [`docs/design-system.html`](docs/design-system.html) | **시각 레퍼런스 — 브라우저로 열 것.** 토큰 정본의 컴파일 CSS가 인라인된 자기 완결 단일 파일 (단계 G) |
| [`docs/design.md`](docs/design.md) | 디자인 언어 원칙 — 법적 경계, DO/DON'T, 도메인 확장 (단계 C). 코드리뷰 판정 기준 |
| [`docs/skin-decision.md`](docs/skin-decision.md) | Paper/Night 스킨 판정 기록 (단계 B) |
| [`docs/audit/`](docs/audit/) | ElevenLabs 감사 3종 — 개요·토큰·의존율 (단계 A) |
| [`docs/design-qa.md`](docs/design-qa.md) | 실측 QA 로그 — 대비율 발견 2건 수정, 최종 passed (단계 F) |
| [`docs/changelog.md`](docs/changelog.md) | A~H 구축 이력 (단계 H) |
| [`src/styles/globals.css`](src/styles/globals.css) | **토큰 정본** — 3계층 (primitive → semantic), Paper/Night |

## 실행

Node `^20.19.0 || >=22.12.0` 필요 (`.node-version` = 22.15.1. rolldown 바인딩이
이 하한을 요구한다 — 20.18 이하에서는 네이티브 바인딩이 말없이 설치되지 않는다).

```bash
pnpm install
pnpm storybook          # http://localhost:6007 — 앱 Storybook(6006)과 별도 포트
pnpm test               # vitest 9 tests
pnpm typecheck
pnpm build:showcase     # storybook-static + docs/design-system.html 재생성
```

## 구조

```
design-system/
├── src/
│   ├── styles/globals.css      # 토큰 정본 (D)
│   ├── components/             # Core 12 + Domain 6, story·test 동반 (E)
│   │   ├── button.tsx … empty.tsx
│   │   ├── orb.tsx, emotion-picker.tsx, diary-entry-card.tsx,
│   │   │   person-chip.tsx, gratitude-list.tsx, on-this-day-card.tsx
│   │   └── emotions.ts         # 감정 5가족 상수 — 색 추가는 여기서만
│   ├── lib/utils.ts            # cn()
│   └── index.ts                # 배럴 — 소비자는 소스를 직접 컴파일 (빌드 없음)
├── showcase/template.html      # 시각 레퍼런스 템플릿 (G)
├── scripts/build-showcase.mjs  # 컴파일 CSS 인라인 + 커버리지 점검
├── .storybook/                 # 앱과 독립된 Storybook (F)
└── docs/                       # 감사·원칙·QA·이력 문서 (A/B/C/F/H)
```

## 소비자 규칙 (채택 시)

- 앱 CSS = 이 패키지 `globals.css` re-import 한 줄 + 앱 자기 `@source`. 앱은
  토큰을 하나도 정의하지 않는다. 이것이 "토큰 교체만으로 룩을 갈아끼운다"의
  물리적 보장이다.
- 손글씨 서체(`font-hand`) 자산은 앱이 제공한다 — 패키지에는 폴백만 있다.
- `--brand` 훅: 전역 토큰을 덮지 말고 서브트리에서 `--brand`만 재할당한다.
