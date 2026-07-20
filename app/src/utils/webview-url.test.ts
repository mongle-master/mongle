import { beforeEach, describe, expect, it } from 'vitest'
import {
  getWebViewUrl,
  isAllowedExternalUrl,
  isAllowedWebViewUrl,
  isModalWebViewPath,
  isWebViewPath,
} from './webview-url'

describe('WebView URL policy', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_WEBVIEW_BASE_URL = 'https://mongle.example'
  })

  it.each(['/home', '/people/10?view=timeline', '/record'])(
    '같은 origin의 상대 경로 %s를 허용한다',
    (path) => {
      expect(isWebViewPath(path)).toBe(true)
      expect(getWebViewUrl(path)).toBe(`https://mongle.example${path}`)
    },
  )

  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/\n/evil.example',
  ])('origin을 우회할 수 있는 경로 %s를 거부한다', (path) => {
    expect(isWebViewPath(path)).toBe(false)
    expect(() => getWebViewUrl(path)).toThrow('Invalid WebView path')
  })

  it('현재 frontend origin에서 온 URL만 bridge source로 허용한다', () => {
    expect(isAllowedWebViewUrl('https://mongle.example/people/10')).toBe(true)
    expect(isAllowedWebViewUrl('https://mongle.example.evil/people/10')).toBe(
      false,
    )
  })

  it.each([
    'https://docs.example',
    'http://docs.example',
    'mailto:hello@example.com',
    'tel:+821012345678',
  ])('허용한 외부 URL scheme만 시스템으로 전달한다: %s', (url) => {
    expect(isAllowedExternalUrl(url)).toBe(true)
  })

  it.each(['javascript:alert(1)', 'data:text/html,hello', 'file:///tmp/a'])(
    '위험하거나 불필요한 외부 URL scheme을 거부한다: %s',
    (url) => {
      expect(isAllowedExternalUrl(url)).toBe(false)
    },
  )

  it('인물 없는 기록 화면만 native modal로 분류한다', () => {
    expect(isModalWebViewPath('/record')).toBe(true)
    expect(isModalWebViewPath('/record?eventId=20')).toBe(true)
    expect(isModalWebViewPath('/record?personId=10')).toBe(false)
  })
})
