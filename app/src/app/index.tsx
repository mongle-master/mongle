import { useRouter } from 'expo-router';

import { BridgeWebView } from '@/components/bridge-web-view';

// 탭 홈(스택 바닥). 지금은 웹 루트('/') 한 장만 띄운다.
// 네이티브 탭바가 필요해지면 rn-stack-nav.md §6처럼 탭별 WebView 오버레이로 확장한다.
export default function HomeScreen() {
  const router = useRouter();

  return (
    <BridgeWebView
      url="/"
      onBridgeMessage={(message) => {
        // 탭 홈에서는 STACK_PUSH만 처리 → 상세는 네이티브 스택(webview.tsx)으로 넘긴다.
        if (message.type === 'STACK_PUSH') {
          router.push({ pathname: '/webview', params: { url: message.url } });
        }
      }}
    />
  );
}
