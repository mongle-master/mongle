export {}

declare global {
  interface Window {
    __MONGLE_NATIVE_NAVIGATION__?: boolean
    ReactNativeWebView?: {
      postMessage: (message: string) => void
    }
  }
}
