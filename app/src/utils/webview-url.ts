function getWebViewBaseUrl(): URL {
  const baseUrl = process.env.EXPO_PUBLIC_WEBVIEW_BASE_URL
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_WEBVIEW_BASE_URL is not defined')
  }

  const url = new URL(baseUrl)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('EXPO_PUBLIC_WEBVIEW_BASE_URL must use http or https')
  }

  return url
}

export function isWebViewPath(value: unknown): value is string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.includes('\\') ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return false
  }

  try {
    const baseUrl = new URL('https://mongle.local')
    return new URL(value, baseUrl).origin === baseUrl.origin
  } catch {
    return false
  }
}

export function getWebViewUrl(path: string): string {
  if (!isWebViewPath(path)) {
    throw new Error(`Invalid WebView path: ${path}`)
  }

  const baseUrl = getWebViewBaseUrl()
  const url = new URL(path, baseUrl)
  if (url.origin !== baseUrl.origin) {
    throw new Error(`WebView URL must use ${baseUrl.origin}`)
  }

  return url.toString()
}

export function isAllowedWebViewUrl(value: string): boolean {
  try {
    return new URL(value).origin === getWebViewBaseUrl().origin
  } catch {
    return false
  }
}

export function isAllowedExternalUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value)
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(protocol)
  } catch {
    return false
  }
}

export function isModalWebViewPath(path: string): boolean {
  if (!isWebViewPath(path)) return false

  const url = new URL(path, 'https://mongle.local')
  return url.pathname === '/record' && !url.searchParams.has('personId')
}
