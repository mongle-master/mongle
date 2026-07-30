# 몽글 UI/UX 실험실 (플레이그라운드)

제품에 바로 넣기엔 확신이 부족한 UI/UX 아이디어를 **동작하는 HTML 프로토타입**으로 만들어
호스팅해 두는 곳입니다. 앱 코드와 완전히 분리된 정적 사이트로 운영됩니다.

- **허브**: https://mongle-master.github.io/mongle/
- **배포 소스**: `mongle-master/mongle` 저장소의 **`gh-pages` 고아 브랜치** (푸시 = 자동 재배포)
- **작성 소스**: 작업 브랜치/워크트리의 **`docs/experiments/`** 폴더 → 완성분을 `gh-pages`에 동기화

## 현재 실험 목록

| # | 폴더 | 내용 | URL |
|---|------|------|-----|
| 01 | `2026-07-29-ux-directions/` | 인터페이스 개선 4가지 방향성 (A 궤도 · B 터치 일기 · C 세 가지 방법 · D 리듬) | [열기](https://mongle-master.github.io/mongle/2026-07-29-ux-directions/) |

## 구조

```
gh-pages 브랜치 (= 사이트 루트)
├── index.html                      ← 실험실 허브 (실험 목록)
├── README.md                       ← 이 파일
├── .nojekyll                       ← Jekyll 처리 비활성화 (필수 유지)
├── _shared/                        ← 공용 스니펫·스크립트 (서빙돼도 무해)
│   ├── draft-nav.snippet.html      ← 시안 간 이동 내비게이션 스니펫
│   └── inject-draft-nav.js         ← 스니펫 주입 스크립트 (멱등)
└── YYYY-MM-DD-이름/                ← 실험 1개 = 날짜 폴더 1개
    ├── index.html                  ← 그 실험의 개요 페이지
    └── *.html                      ← 개별 시안 (자족 파일)
```

`docs/experiments/` (작성 소스)는 이 구조를 그대로 미러링합니다.
동기화는 **작성 소스 → gh-pages 단방향**입니다. gh-pages에서 직접 고치지 마세요.

### 절대 하지 말 것

- `gh-pages`를 `main`에 머지하지 않기 (고아 브랜치 유지)
- `gh-pages`에 앱 코드·빌드 결과물·의존성 올리지 않기 (순수 정적 HTML만)
- `.nojekyll` 지우지 않기
- 시안 프로토타입에 외부 리소스(CDN, 웹폰트, 외부 이미지) 넣지 않기

## 새 실험 추가하기

### 1. 폴더 생성

작성 소스에 `docs/experiments/YYYY-MM-DD-kebab-이름/` 폴더를 만듭니다.
날짜는 작업 시작일, 이름은 영어 kebab-case 권장 (URL에 그대로 노출됩니다).

### 2. 시안 작성

각 시안은 **자족 HTML 파일 1개**여야 합니다. 품질 규칙은 아래 [시안 작성 규칙](#시안-작성-규칙) 참고.
실험 폴더에는 개요 페이지 `index.html`을 함께 둡니다 (문제 정의 · 아이디어 · 상태 목록 · 시안 링크).

### 3. 시안 간 이동 내비 주입 (선택, 시안이 2개 이상일 때)

```bash
node docs/experiments/_shared/inject-draft-nav.js docs/experiments/YYYY-MM-DD-이름/
```

- 멱등입니다 (이미 있으면 건너뜀).
- **내비의 항목 목록은 스니펫 안에 하드코딩돼 있습니다.** 새 실험에서는 주입 전에
  `_shared/draft-nav.snippet.html`의 `.xdn-item` 목록과 `ORDER` 배열을 그 실험의 파일명에 맞게 수정하세요.
  (실험 01의 항목: 개요 · A 궤도 · B 터치 일기 · C 세 가지 방법 · D 리듬)
- `← →` 방향키 이동, 활성 항목 하이라이트가 함께 들어갑니다.

### 4. 허브에 행 추가

`docs/experiments/index.html`에서 기존 `.exp` 행을 복사해 실험 1행을 추가합니다.
번호(`.num`), 날짜, 제목, 한 줄 설명, 목표 태그(색상), "시안 N · 페이지 N" 메타를 채웁니다.
"다음 실험 자리"(`.next`) 블록의 번호도 하나 올립니다.

### 5. gh-pages에 동기화 (정식 절차)

```bash
# 저장소 루트(또는 워크트리)에서 실행
TMP=$(mktemp -d)
git clone -q --depth 1 -b gh-pages git@github.com:mongle-master/mongle.git "$TMP/site"
find "$TMP/site" -mindepth 1 -maxdepth 1 ! -name '.git' ! -name '.nojekyll' -exec rm -rf {} +
cp -R docs/experiments/. "$TMP/site/"
git -C "$TMP/site" add -A
git -C "$TMP/site" commit -m "docs(ux): 실험실 동기화"
git -C "$TMP/site" push origin gh-pages
rm -rf "$TMP"
```

전체 미러 동기화입니다 — 작성 소스에서 지운 파일은 사이트에서도 지워집니다.

### 6. 배포 검증

```bash
# 빌드 상태 (built 가 될 때까지)
gh api repos/mongle-master/mongle/pages/builds --jq '.[0].status'

# URL 응답 확인
curl -s -o /dev/null -w '%{http_code}\n' https://mongle-master.github.io/mongle/
curl -s -o /dev/null -w '%{http_code}\n' https://mongle-master.github.io/mongle/YYYY-MM-DD-이름/
```

## 기존 실험 수정하기

작성 소스(`docs/experiments/...`)에서 수정 → 위 5·6단계로 재동기화. 자동 재배포됩니다.

## 시안 작성 규칙

### 하드 룰

- **자족 파일**: 외부 리소스 일절 금지 (CDN · 웹폰트 · 외부 이미지). `file://`에서 그대로 렌더돼야 합니다.
  아이콘은 인라인 SVG, 폰트는 시스템 스택, 이미지는 CSS/SVG로 대체.
- **관계 점수화·서열화·평가 표현 금지** (제품 PRD 원칙). 정량화는 주기·계절·팔레트 같은 "모양"으로.
- **한국어 해요체**, 한자 사용 금지 (순수 한국어 또는 영어 용어).

### 디자인 언어 "결(Gyeol)"

Airtable풍 편집적 절제: 흰 종이, 먹색 타입, 여백, 따뜻한 악센트.

| 용도 | 값 |
|------|-----|
| 배경(종이) | `#ffffff` |
| 잉크(전경) | `#26262b` |
| 뮤트 표면 | `#f7f7f8` |
| 뮤트 텍스트 | `#8e8e93` |
| 헤어라인 보더 | `#ebebec` |
| 프라이머리 버튼 | 잉크 채움 + 흰 글씨 |

감정 칩 팔레트 (색은 오직 감정/태그 칩과 데이터 시각화로만):

| 감정 | hex | | 감정 | hex |
|------|-----|-|------|-----|
| 기분좋음 | `#22a06b` | | 편안함 | `#0ea5e9` |
| 고마움 | `#e85d75` | | 피곤함 | `#8b5cf6` |
| 설렘 | `#f97316` | | 아쉬움 | `#d97706` |

- 타이포: `-apple-system, 'Apple SD Gothic Neo', 'Pretendard', 'Noto Sans KR', system-ui, sans-serif` —
  산스 전용(세리프 금지), 제목 weight 600 (800+ 남용 금지), 본문 15px, 캡션 11~13px
- 형태: 버튼 전부 pill(`rounded-full`, 500), 입력 44px, 카드 반경 12~16px, 1px 헤어라인,
  그림자 은은하게 (`0 4px 12px rgba(24,24,27,0.07)`)
- 금지: 보라/파랑 그라디언트, 글래스모피즘, 이모지 아이콘, 과장된 "AI 스타트업" 룩
- 아이콘: 인라인 SVG (stroke 1.6, round cap, 20~24px)

### 시안 파일 구성

1. **폰 목업**: 390×844, 중앙 배치, 실제 탭으로 동작하는 전체 플로우 (바닐라 JS)
2. **설명 패널**: 폰 옆에 문제 정의 → 핵심 아이디어 → 기대 개선 → 상태 목록
3. **상태 스위처**: 폰 프레임 밖 버튼으로 빈 상태 · 일반 · 엣지 상태를 즉시 전환
4. **마이크로 인터랙션**: 150~250ms 트랜지션, pressed 상태, 토스트
5. 샘플 데이터는 실감나는 한국어 이름·태그·감정 칩 사용

### 배포 전 검증 체크리스트

```bash
# 1. 외부 참조 0건 (허브의 저장소 링크 등 의도한 것 제외)
grep -cE "https?://|<link |@import" docs/experiments/YYYY-MM-DD-이름/*.html

# 2. 인라인 JS 구문
node -e "const fs=require('fs');for(const f of process.argv.slice(1)){const h=fs.readFileSync(f,'utf8');(h.match(/<script[^>]*>([\s\S]*?)<\/script>/g)||[]).forEach((s,i)=>{try{new Function(s.replace(/<\/?script[^>]*>/g,''))}catch(e){console.log(f,i,e.message)}})}" docs/experiments/YYYY-MM-DD-이름/*.html

# 3. 헤드리스 크롬 렌더 (JS 런타임 에러·레이어 겹침 확인)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --enable-logging=stderr --virtual-time-budget=3000 --dump-dom \
  "file://$(pwd)/docs/experiments/YYYY-MM-DD-이름/index.html" 2>&1 | grep -iE "error|uncaught"
```

## 자주 하는 질문

**Q. Pages 설정은 어디에?** 저장소 Settings → Pages, 또는 `gh api repos/mongle-master/mongle/pages`.
소스는 `gh-pages` / `/`(루트)로 설정돼 있습니다.

**Q. 배포가 안 돼요.** `gh api repos/mongle-master/mongle/pages/builds --jq '.[0]'`로
마지막 빌드 상태를 보세요. 보통 수 초~1분 안에 `built`가 됩니다.

**Q. 로컬에서 미리 볼 수 있나요?** 파일을 브라우저에서 바로 열면 됩니다(`file://` 동작 보장 규칙).
여러 파일을 서버로 보고 싶다면 `python3 -m http.server -d docs/experiments` 정도면 충분합니다.

**Q. 왜 gh-pages를 메인 삼지 않고 미러링하나요?** 작성 소스는 앱 코드 작업 브랜치와 같은 워크트리에 두어
실험 → 제품화 이관을 쉽게 하려는 의도입니다. 실험이 앱과 완전히 독립적이라면 gh-pages를 직접 체크아웃해
그 안에서 작업해도 무방합니다.
