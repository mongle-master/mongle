import { describe, expect, it } from 'vitest'
import { parseNativeNavigationMessage } from './navigation-protocol'

describe('native navigation protocol', () => {
  it.each([
    [{ type: 'STACK_PUSH', url: '/people/10' }, '/people/10'],
    [
      { type: 'STACK_REPLACE', url: '/record?eventId=20' },
      '/record?eventId=20',
    ],
  ] as const)('검증된 내부 경로 메시지만 수락한다', (message, url) => {
    expect(parseNativeNavigationMessage(JSON.stringify(message))).toEqual({
      type: message.type,
      url,
    })
  })

  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/\n/evil.example',
  ])('외부 경로 %s를 거부한다', (url) => {
    expect(
      parseNativeNavigationMessage(JSON.stringify({ type: 'STACK_PUSH', url })),
    ).toBeNull()
  })

  it('양의 안전한 정수만 pop count로 수락한다', () => {
    expect(
      parseNativeNavigationMessage(
        JSON.stringify({ type: 'STACK_POP', count: 2 }),
      ),
    ).toEqual({ type: 'STACK_POP', count: 2 })
    expect(
      parseNativeNavigationMessage(
        JSON.stringify({ type: 'STACK_POP', count: 0 }),
      ),
    ).toBeNull()
  })

  it('잘못된 JSON과 알 수 없는 메시지를 무시한다', () => {
    expect(parseNativeNavigationMessage('{')).toBeNull()
    expect(
      parseNativeNavigationMessage(JSON.stringify({ type: 'OPEN_EXTERNAL' })),
    ).toBeNull()
  })
})
