# Mongle App

Expo Router의 네이티브 스택 위에 Mongle frontend를 여러 WebView로 띄우는 모바일 앱입니다.

- 첫 화면은 `/home`을 로드하는 루트 WebView입니다.
- 웹에서 activity를 push하면 RN 스택에 새 WebView가 추가됩니다.
- 웹의 replace와 여러 단계 pop도 RN 스택에서 처리합니다.
- 하단 ＋·기록 수정은 아래에서 올라오는 full-screen modal, 인물에서 시작한 기록은 일반 push로 표시합니다.
- 상세 화면에서 돌아오면 아래 WebView의 활성 query를 다시 조회합니다.
- 모바일 브라우저에서는 이 브리지가 활성화되지 않고 기존 Stackflow가 계속 내비게이션을 담당합니다.
- WebView는 설정한 frontend와 같은 origin만 로드하고, 허용한 외부 URL은 시스템 앱으로 엽니다.

## 실행

Node.js 22.13 이상과 pnpm 10이 필요합니다.

```bash
cp .env.example .env.local
pnpm install
pnpm ios
# 또는 pnpm android
```

`EXPO_PUBLIC_WEBVIEW_BASE_URL`에는 frontend 주소를 지정합니다. iOS 시뮬레이터는
`http://localhost:3000`, Android 에뮬레이터는 `http://10.0.2.2:3000`, 실기기는 같은
네트워크에서 접근 가능한 개발 머신 주소를 사용합니다.
