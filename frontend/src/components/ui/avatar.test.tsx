import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

describe('Avatar', () => {
  afterEach(cleanup)

  it('마운트 즉시 img를 렌더한다 (로드 완료를 기다리지 않음)', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/a.png" alt="사람" />
        <AvatarFallback>몽</AvatarFallback>
      </Avatar>,
    )

    expect(screen.getByRole('img', { name: '사람' })).toBeInTheDocument()
  })

  it('이미지 로드 실패 시 img를 제거하고 fallback을 드러낸다', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/broken.png" alt="사람" />
        <AvatarFallback>몽</AvatarFallback>
      </Avatar>,
    )

    fireEvent.error(screen.getByRole('img'))

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('몽')).toBeInTheDocument()
  })

  it('src가 없으면 fallback만 렌더한다', () => {
    render(
      <Avatar>
        <AvatarFallback>몽</AvatarFallback>
      </Avatar>,
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('몽')).toBeInTheDocument()
  })
})
