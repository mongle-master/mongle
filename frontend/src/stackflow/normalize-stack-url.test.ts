import { normalizeStackUrl } from './normalize-stack-url'

describe('normalizeStackUrl', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('루트 URL을 홈 탭 URL로 교체한다', () => {
    window.history.replaceState({ marker: 'preserved' }, '', '/')

    normalizeStackUrl()

    expect(window.location.pathname).toBe('/home')
    expect(window.history.state).toEqual({ marker: 'preserved' })
  })

  it('구 인물 타임라인 URL을 현재 step URL로 교체한다', () => {
    window.history.replaceState(
      null,
      '',
      '/people/12/timeline/?source=bookmark#events',
    )

    normalizeStackUrl()

    expect(window.location.pathname).toBe('/people/12')
    expect(window.location.search).toBe('?source=bookmark&view=timeline')
    expect(window.location.hash).toBe('#events')
  })

  it('이미 canonical인 URL은 변경하지 않는다', () => {
    window.history.replaceState(null, '', '/people/12?view=profile')

    normalizeStackUrl()

    expect(window.location.pathname).toBe('/people/12')
    expect(window.location.search).toBe('?view=profile')
  })
})
