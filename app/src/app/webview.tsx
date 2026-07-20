import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { BridgeWebView } from '@/components/bridge-web-view'
import { isModalWebViewPath, isWebViewPath } from '@/utils/webview-url'

export default function WebViewScreen() {
  const params = useLocalSearchParams<{ url?: string | string[] }>()
  const router = useRouter()
  const path = Array.isArray(params.url) ? params.url[0] : params.url

  if (!isWebViewPath(path)) return <Redirect href="/" />

  const isModal = isModalWebViewPath(path)

  return (
    <>
      <Stack.Screen
        options={{
          presentation: isModal ? 'fullScreenModal' : 'card',
          animation: isModal ? 'slide_from_bottom' : 'default',
          gestureDirection: isModal ? 'vertical' : 'horizontal',
        }}
      />
      <BridgeWebView
        path={path}
        onNavigationMessage={(message) => {
          switch (message.type) {
            case 'STACK_PUSH':
              router.push({
                pathname: '/webview',
                params: { url: message.url },
              })
              break
            case 'STACK_REPLACE':
              router.replace({
                pathname: '/webview',
                params: { url: message.url },
              })
              break
            case 'STACK_POP':
              if (router.canDismiss()) router.dismiss(message.count)
              break
          }
        }}
      />
    </>
  )
}
