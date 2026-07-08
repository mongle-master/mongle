// 웹(frontend) 도메인을 env로 고정한다. dev/staging/prod를 앱 재빌드 없이 스위칭하고,
// 웹에는 항상 상대 경로만 넘겨 결합도를 낮추기 위함. (rn-stack-nav.md §5-3)
export function getWebViewUri(): string {
  const baseUrl = process.env.EXPO_PUBLIC_WEBVIEW_BASE_URL;
  if (typeof baseUrl !== 'string' || baseUrl.length === 0) {
    throw new Error('EXPO_PUBLIC_WEBVIEW_BASE_URL is not defined (.env 확인)');
  }
  return new URL(baseUrl).toString();
}
