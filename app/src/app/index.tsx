import { useRouter } from 'expo-router'
import { BridgeWebView } from '@/components/bridge-web-view'

export default function HomeScreen() {
  const router = useRouter()

  return (
    <BridgeWebView
      path="/home"
      onNavigationMessage={(message) => {
        if (message.type === 'STACK_PUSH') {
          router.push({ pathname: '/webview', params: { url: message.url } })
        }
      }}
    />
  )
}
