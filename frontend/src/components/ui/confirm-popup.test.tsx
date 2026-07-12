import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ConfirmPopup } from './confirm-popup'

describe('ConfirmPopup Amplitude 마스킹', () => {
  beforeEach(() => {
    const overlayRoot = document.createElement('div')
    overlayRoot.id = 'stack-overlay-root'
    document.body.appendChild(overlayRoot)
  })

  afterEach(() => {
    cleanup()
    document.getElementById('stack-overlay-root')?.remove()
  })

  it('사용자 라벨이 끼어드는 description은 data-amp-mask 아래에 렌더된다', () => {
    render(
      <ConfirmPopup
        open
        title="태그를 삭제할까요?"
        description="'나만의 태그' 태그를 지우면 관련된 태그 정보도 함께 삭제돼요."
        onOpenChange={() => {}}
        onConfirm={() => {}}
      />,
    )

    expect(
      screen
        .getByText(/'나만의 태그' 태그를 지우면/)
        .closest('[data-amp-mask]'),
    ).not.toBeNull()
    // 정적 버튼 라벨은 마스킹하지 않는다 — Amplitude에서 클릭 구분에 쓰인다
    expect(screen.getByText('확인').closest('[data-amp-mask]')).toBeNull()
  })
})
