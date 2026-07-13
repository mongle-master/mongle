// app/src/bridge/navigation-protocol.ts와 함께 변경해야 하는 WebView → RN protocol.
export type NativeNavigationMessage =
  | { type: 'STACK_PUSH'; url: string }
  | { type: 'STACK_REPLACE'; url: string }
  | { type: 'STACK_POP'; count: number }

export const NATIVE_FOCUS_EVENT = 'mongle:native-focus'

export function isNativeNavigationWebView(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.__MONGLE_NATIVE_NAVIGATION__ === true
  )
}

export function canPostNativeNavigation(): boolean {
  return (
    isNativeNavigationWebView() &&
    typeof window.ReactNativeWebView?.postMessage === 'function'
  )
}

export function postNativeNavigation(message: NativeNavigationMessage): void {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message))
}
