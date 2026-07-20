import { useCallback, useRef } from 'react'
import { StyleSheet } from 'react-native'
import * as Linking from 'expo-linking'
import { useFocusEffect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  WebView,
  type WebViewMessageEvent,
  type WebViewProps,
} from 'react-native-webview'
import {
  INJECTED_NATIVE_NAVIGATION_FLAG,
  NATIVE_FOCUS_SCRIPT,
  parseNativeNavigationMessage,
  type NativeNavigationMessage,
} from '@/bridge/navigation-protocol'
import {
  getWebViewUrl,
  isAllowedExternalUrl,
  isAllowedWebViewUrl,
} from '@/utils/webview-url'

type BridgeWebViewProps = {
  path: string
  onNavigationMessage: (message: NativeNavigationMessage) => void
} & Omit<
  WebViewProps,
  | 'source'
  | 'onMessage'
  | 'originWhitelist'
  | 'onShouldStartLoadWithRequest'
  | 'injectedJavaScriptBeforeContentLoaded'
>

export function BridgeWebView({
  path,
  onNavigationMessage,
  ...webViewProps
}: BridgeWebViewProps) {
  const webViewRef = useRef<WebView>(null)
  const isFocusedRef = useRef(false)
  const sourceUrl = getWebViewUrl(path)

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true
      webViewRef.current?.injectJavaScript(NATIVE_FOCUS_SCRIPT)
      return () => {
        isFocusedRef.current = false
      }
    }, []),
  )

  const handleMessage = (event: WebViewMessageEvent) => {
    if (!isFocusedRef.current) return
    if (!isAllowedWebViewUrl(event.nativeEvent.url)) return

    const message = parseNativeNavigationMessage(event.nativeEvent.data)
    if (message) onNavigationMessage(message)
  }

  const handleShouldStartLoad = ({ url }: { url: string }) => {
    if (url === 'about:blank' || isAllowedWebViewUrl(url)) return true

    if (isAllowedExternalUrl(url)) {
      void Linking.openURL(url).catch(() => undefined)
    }
    return false
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WebView
        {...webViewProps}
        ref={webViewRef}
        source={{ uri: sourceUrl }}
        onMessage={handleMessage}
        originWhitelist={['*']}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        injectedJavaScriptBeforeContentLoaded={INJECTED_NATIVE_NAVIGATION_FLAG}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        bounces={false}
        allowsBackForwardNavigationGestures={false}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        style={styles.webView}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  webView: { flex: 1, backgroundColor: '#ffffff' },
})
