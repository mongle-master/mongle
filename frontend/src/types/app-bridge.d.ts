export {}

declare global {
  interface Window {
    /** app이 콘텐츠 로드 전 주입하는 환경 플래그 (app/src/bridge/protocol.ts의 INJECTED_APP_FLAG) */
    __MONGLE_APP__?: boolean
    /** RN WebView가 주입하는 네이티브 브리지 (웹 → 앱 단방향 송신) */
    ReactNativeWebView?: { postMessage: (message: string) => void }
  }
}
