// 앱 ↔ 웹 단방향(fire-and-forget) 네비게이션 메시지 프로토콜.
// 설계 배경·전체 흐름은 docs/how-tos/rn-stack-nav.md 참조.
//
// ⚠️ 단일 소스여야 하지만 아직 모노레포가 아니라, 웹(frontend) 쪽에도 동일 정의가 존재한다.
//    한쪽만 바뀌면 런타임에 조용히 깨지므로, 두 레포를 합칠 때 공유 패키지로 승격한다.

export type AppBridgeMessage =
  | { type: 'STACK_PUSH'; url: string } // 새 상세 화면을 네이티브 스택에 push (url = 상대 경로)
  | { type: 'STACK_BACK' } // 스택 최상단 1개 pop
  | { type: 'NAVIGATE_TAB'; path: string }; // 스택 전부 걷고 탭 홈으로

// 웹에 "지금 앱 WebView 안"임을 알리는 스위치. 반드시 injectedJavaScriptBeforeContentLoaded로
// 주입해야 웹 첫 렌더부터 isInApp()이 참이 된다. 끝의 `true;`는 injectedJavaScript 반환값 경고 억제 관용구.
export const INJECTED_APP_FLAG = 'window.__MONGLE_APP__ = true; true;';

// onMessage 파싱은 탭 홈/스택 상세 양쪽에서 반복되므로 공통화(rule 5).
// non-JSON이거나 스키마 밖 메시지는 무시(null) — 양방향 브리지가 붙어도 여기서 걸러진다.
export function parseBridgeMessage(data: string): AppBridgeMessage | null {
  try {
    return JSON.parse(data) as AppBridgeMessage;
  } catch {
    return null;
  }
}
