import { useLocalSearchParams, useRouter } from 'expo-router';

import { BridgeWebView } from '@/components/bridge-web-view';

// 스택 네비게이션의 심장. 재사용 가능한 이 화면 하나가 url 파라미터만 바꿔가며 무한히 쌓인다.
// (pathname은 항상 '/webview' 고정, params.url만 매번 다름 — rn-stack-nav.md §5-2)
export default function WebViewScreen() {
  const { url } = useLocalSearchParams<{ url?: string }>(); // 스택마다 다른 상대 경로
  const router = useRouter();

  return (
    <BridgeWebView
      url={url ?? '/'}
      onBridgeMessage={(message) => {
        switch (message.type) {
          case 'STACK_PUSH':
            // 같은 /webview 화면을 새 url로 스택에 쌓는다
            router.push({ pathname: '/webview', params: { url: message.url } });
            break;
          case 'STACK_BACK':
            router.back(); // 스택 최상단 1개 pop
            break;
          case 'NAVIGATE_TAB':
            router.dismissAll(); // 스택 전부 걷고 탭 홈(index)으로 (= popToTop)
            break;
        }
      }}
    />
  );
}
