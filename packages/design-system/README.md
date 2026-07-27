# @mongle/design-system — 고요 (Goyo)

Mongle(일기·감정·주변인 기록)의 디자인 시스템. Linear의 시각 언어를 도메인에 맞게
번역했다. [design-systems-benchmark playbook](../../../../studyspaces/design-systems-benchmark/playbook.md)
절차(A~G)에 따라 구축.

## 문서 지도

| 파일 | playbook 단계 | 내용 |
|---|---|---|
| `docs/audit/linear.md` | A | 레퍼런스 6축 개요 감사 |
| `docs/audit/linear-tokens.md` | A | 토큰 3축(정의/소비/거버넌스) 감사 |
| `docs/audit/linear-audit.md` | A | 컴포넌트 토큰 의존율 감사 |
| `docs/skin-decision.md` | B | 스킨 후보 판정 (Linear 채택, amber 보존) |
| `docs/design.md` | C | 원칙 문서 (법적 경계 + DO/DON'T) |
| `src/styles/globals.css` | D | 토큰 정본 (2계층) |
| `src/components/*` | E | 소유형 React 컴포넌트 9종 |
| `design-qa.md` | F | 레퍼런스 대비 QA 로그 |
| `docs/design-system.html` | G | 자기 완결 시각 레퍼런스 (브라우저로 열 것) |

## 스택 (code-first)

- **Tailwind v4 CSS-first** — `@theme inline`, tailwind.config 없음. 토큰 정본이
  `globals.css` 한 파일로 수렴. `--color-*: var(--*)` 매핑으로 시맨틱 토큰이 곧
  유틸리티 이름(`bg-background`, `text-muted-foreground`).
- **소유형 컴포넌트** (shadcn 구조) — npm 의존이 아닌 소스로 소유. 스킨 실험·도메인
  확장이 자유로움.
- **CVA + data-attribute variant** — 열거형 variant는 CVA, 모든 요소에 `data-slot` 마킹.
- **class 기반 테마** — `.dark`/`.light` on `<html>`. 기본은 다크.
- **빌드 없이 소스 배포** — `exports`가 `.ts` 직접. 소비 앱의 Vite가 컴파일.

## 앱 통합 규칙

앱의 CSS는 디자인 시스템 globals.css **re-import 한 줄 + 자기 `@source`** 만 쓴다.
앱은 토큰을 하나도 정의하지 않는다. 이것이 "룩앤필을 토큰 교체만으로 갈아끼운다"는
목표의 물리적 보장이다.

```css
/* app/src/styles.css */
@import "@mongle/design-system/styles";
@source "./**/*.{ts,tsx}";
```

### FOUC 방지 (first-paint 인라인 스크립트)

테마 class는 첫 페인트 전에 적용되어야 한다. 앱 `index.html`의 `<head>`에:

```html
<script>
  (function () {
    var t = localStorage.getItem("theme") || "dark";
    document.documentElement.classList.add(t === "light" ? "light" : "dark");
  })();
</script>
```

class를 쓰는 이유: `dark` custom-variant가 모든 `dark:` 유틸리티를 `.dark` class에
게이팅하므로, 팔레트 변수와 유틸리티 변형이 **같은 스위치**로 전환되어야 한다.
media query로는 이 동기화가 불가능하다.

## 실행

```bash
pnpm install
pnpm storybook        # 컴포넌트 개발 (localhost:6006)
pnpm typecheck
open docs/design-system.html   # 시각 레퍼런스
```

## 법적 경계

Linear의 로고·상표·전용 서체·프로젝트 관리 IA는 복제하지 않는다.
가져온 것은 색 관계·밀도·위계·모션의 원리다. 자세한 것은 `docs/design.md` 참고.
