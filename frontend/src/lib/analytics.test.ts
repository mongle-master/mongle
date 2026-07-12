import { beforeEach, describe, expect, it, vi } from 'vitest'

const initAll = vi.fn()
const add = vi.fn()

vi.mock('@amplitude/unified', () => ({
  initAll: (...args: unknown[]) => initAll(...args),
  add: (...args: unknown[]) => add(...args),
  setUserId: vi.fn(),
  track: vi.fn(),
  reset: vi.fn(),
}))

// apiKey를 모듈 로드 시점에 읽으므로 매 테스트마다 env를 세팅하고 새로 import한다
async function importAnalytics(apiKey: string | undefined) {
  vi.resetModules()
  if (apiKey === undefined) {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', '')
  } else {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', apiKey)
  }
  return import('./analytics')
}

type EnrichmentPlugin = {
  name: string
  type: string
  execute: (event: {
    event_type: string
    event_properties?: Record<string, unknown>
  }) => Promise<{ event_properties?: Record<string, unknown> }>
}

beforeEach(() => {
  initAll.mockReset().mockResolvedValue(undefined)
  add.mockReset().mockReturnValue({ promise: Promise.resolve() })
  vi.unstubAllEnvs()
})

describe('initializeAnalytics autocapture 설정', () => {
  it('API key가 없으면 initAll을 호출하지 않는다', async () => {
    const { initializeAnalytics } = await importAnalytics(undefined)

    await initializeAnalytics()

    expect(initAll).not.toHaveBeenCalled()
  })

  it('클릭·폼·좌절 수집은 켜고 pageViews·network 등은 끈 채 한 번만 초기화한다', async () => {
    const { initializeAnalytics } = await importAnalytics('test-key')

    await initializeAnalytics()
    await initializeAnalytics()

    expect(initAll).toHaveBeenCalledTimes(1)
    expect(initAll).toHaveBeenCalledWith('test-key', expect.anything())

    const options = initAll.mock.calls[0][1] as {
      analytics: { autocapture: Record<string, unknown> }
      sessionReplay: { sampleRate: number }
    }
    const autocapture = options.analytics.autocapture

    expect(autocapture.formInteractions).toBe(true)
    expect(autocapture.frustrationInteractions).toBe(true)
    expect(autocapture.sessions).toBe(true)
    expect(autocapture.attribution).toBe(false)
    expect(autocapture.pageViews).toBe(false)
    expect(autocapture.fileDownloads).toBe(false)
    expect(autocapture.pageUrlEnrichment).toBe(false)
    expect(autocapture.networkTracking).toBe(false)
    expect(autocapture.webVitals).toBe(false)

    // 기존 Session Replay 설정 유지
    expect(options.sessionReplay).toEqual({ sampleRate: 1 })
  })

  it('elementInteractions를 동적 URL ID maskTextRegex와 함께 켠다', async () => {
    const { initializeAnalytics } = await importAnalytics('test-key')

    await initializeAnalytics()

    const options = initAll.mock.calls[0][1] as {
      analytics: {
        autocapture: { elementInteractions: { maskTextRegex: RegExp[] } }
      }
    }
    const { maskTextRegex } = options.analytics.autocapture.elementInteractions

    expect(maskTextRegex).toHaveLength(1)
    expect('/people/123'.replace(maskTextRegex[0], '*****')).toBe('*****')
    expect('/events/45'.replace(maskTextRegex[0], '*****')).toBe('*****')
    expect('/record'.match(maskTextRegex[0])).toBeNull()
  })
})

describe('동적 URL ID enrichment plugin', () => {
  async function registeredPlugin() {
    const { initializeAnalytics } = await importAnalytics('test-key')
    await initializeAnalytics()

    expect(add).toHaveBeenCalledTimes(1)
    return add.mock.calls[0][0] as EnrichmentPlugin
  }

  it('이벤트 속성의 person/event ID를 경로 자리표시자로 바꾼다', async () => {
    const plugin = await registeredPlugin()

    const event = await plugin.execute({
      event_type: '[Amplitude] Element Clicked',
      event_properties: {
        '[Amplitude] Page URL': 'https://app.example.com/people/123',
        '[Amplitude] Element Href': 'https://app.example.com/events/45',
      },
    })

    expect(event.event_properties).toEqual({
      '[Amplitude] Page URL': 'https://app.example.com/people/:id',
      '[Amplitude] Element Href': 'https://app.example.com/events/:id',
    })
  })

  it('중첩 배열·객체 속성 안의 URL도 가리고 나머지 값은 유지한다', async () => {
    const plugin = await registeredPlugin()

    const event = await plugin.execute({
      event_type: '[Amplitude] Element Clicked',
      event_properties: {
        '[Amplitude] Element Hierarchy': [
          { tag: 'a', attrs: { href: '/people/9/edit' } },
        ],
        '[Amplitude] Element Text': '저장',
        '[Amplitude] Viewport Width': 390,
      },
    })

    expect(event.event_properties).toEqual({
      '[Amplitude] Element Hierarchy': [
        { tag: 'a', attrs: { href: '/people/:id/edit' } },
      ],
      '[Amplitude] Element Text': '저장',
      '[Amplitude] Viewport Width': 390,
    })
  })

  it('event_properties가 없는 이벤트는 그대로 통과시킨다', async () => {
    const plugin = await registeredPlugin()

    const event = await plugin.execute({ event_type: 'session_start' })

    expect(event).toEqual({ event_type: 'session_start' })
  })
})
