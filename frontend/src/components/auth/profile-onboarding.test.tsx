import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProfileOnboarding } from './profile-onboarding'

describe('ProfileOnboarding', () => {
  it('changes the default avatar by gender and candidate', async () => {
    const user = userEvent.setup()

    render(<ProfileOnboarding username="성빈" onComplete={vi.fn()} />)

    expect(screen.getByAltText('성빈님의 선택한 프로필 사진')).toHaveAttribute(
      'src',
      '/default-people/person-female-1.png',
    )

    await user.click(screen.getByRole('button', { name: '남성' }))
    expect(screen.getByAltText('성빈님의 선택한 프로필 사진')).toHaveAttribute(
      'src',
      '/default-people/person-male-1.png',
    )

    await user.click(screen.getByRole('button', { name: '다른 사진' }))
    expect(screen.getByAltText('성빈님의 선택한 프로필 사진')).toHaveAttribute(
      'src',
      '/default-people/person-male-2.png',
    )
  })

  it('saves the selected avatar', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn().mockResolvedValue(undefined)

    render(<ProfileOnboarding username="성빈" onComplete={onComplete} />)

    await user.click(
      screen.getByRole('button', { name: '이 사진으로 시작하기' }),
    )
    expect(onComplete).toHaveBeenCalledWith({
      profileImageUrl: '/default-people/person-female-1.png',
      gender: 'FEMALE',
    })
  })

  it('can skip profile setup', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn().mockResolvedValue(undefined)

    render(<ProfileOnboarding username="성빈" onComplete={onComplete} />)

    await user.click(screen.getByRole('button', { name: '지금은 건너뛰기' }))
    expect(onComplete).toHaveBeenCalledWith({
      profileImageUrl: null,
      gender: null,
    })
  })
})
