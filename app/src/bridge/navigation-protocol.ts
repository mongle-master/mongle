import { isWebViewPath } from '../utils/webview-url'

// frontend/src/lib/native-navigation-bridge.ts와 함께 변경해야 하는 WebView → RN protocol.
export type NativeNavigationMessage =
  | { type: 'STACK_PUSH'; url: string }
  | { type: 'STACK_REPLACE'; url: string }
  | { type: 'STACK_POP'; count: number }

export const INJECTED_NATIVE_NAVIGATION_FLAG =
  'window.__MONGLE_NATIVE_NAVIGATION__ = true; true;'

const NATIVE_FOCUS_EVENT = 'mongle:native-focus'
export const NATIVE_FOCUS_SCRIPT = `window.dispatchEvent(new Event('${NATIVE_FOCUS_EVENT}')); true;`

export function parseNativeNavigationMessage(
  data: string,
): NativeNavigationMessage | null {
  try {
    const message: unknown = JSON.parse(data)
    if (!message || typeof message !== 'object' || !('type' in message)) {
      return null
    }

    if (
      (message.type === 'STACK_PUSH' || message.type === 'STACK_REPLACE') &&
      'url' in message &&
      isWebViewPath(message.url)
    ) {
      return { type: message.type, url: message.url }
    }

    if (
      message.type === 'STACK_POP' &&
      'count' in message &&
      typeof message.count === 'number' &&
      Number.isSafeInteger(message.count) &&
      message.count > 0
    ) {
      return { type: 'STACK_POP', count: message.count }
    }

    return null
  } catch {
    return null
  }
}
