import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MonogramAvatar } from './monogram-avatar'

describe('MonogramAvatar Amplitude 마스킹', () => {
  afterEach(cleanup)

  it('이름(모노그램)이 data-amp-mask 요소 안에서만 렌더된다', () => {
    const { container } = render(<MonogramAvatar name="김몽글" />)

    const masked = container.querySelector('[data-amp-mask]')
    expect(masked).not.toBeNull()
    expect(masked?.textContent).toContain('김')
  })
})
