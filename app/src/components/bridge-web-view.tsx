import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent, type WebViewProps } from 'react-native-webview';

import { type AppBridgeMessage, INJECTED_APP_FLAG, parseBridgeMessage } from '@/bridge/protocol';
import { getWebViewUri } from '@/utils/webview-url';

// 앱의 모든 WebView 화면(탭 홈 index / 스택 상세 webview)이 공유하는 껍데기.
// 상대 경로 → 도메인 결합, 앱 플래그 주입, onMessage 파싱을 한 곳에 모은다.
// (WebView props와 파싱이 여러 화면에서 반복되어 공통화 — rule 5)
type BridgeWebViewProps = {
  /** 웹 도메인에 결합할 상대 경로 (예: '/', '/person/1') */
  url: string;
  /** 파싱에 성공한 브리지 메시지만 전달된다 */
  onBridgeMessage: (message: AppBridgeMessage) => void;
} & Omit<WebViewProps, 'source' | 'onMessage'>;

export function BridgeWebView({ url, onBridgeMessage, ...webViewProps }: BridgeWebViewProps) {
  const uri = new URL(url, getWebViewUri()).toString();

  const handleMessage = (event: WebViewMessageEvent) => {
    const message = parseBridgeMessage(event.nativeEvent.data);
    if (message) onBridgeMessage(message);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <WebView
        source={{ uri }}
        onMessage={handleMessage}
        injectedJavaScriptBeforeContentLoaded={INJECTED_APP_FLAG}
        javaScriptEnabled
        domStorageEnabled
        bounces={false}
        style={styles.webview}
        {...webViewProps}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  webview: { flex: 1 },
});
