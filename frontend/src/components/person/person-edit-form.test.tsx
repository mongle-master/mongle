import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PersonEditForm } from '@/components/person/person-edit-form'
import { personToFormValues } from '@/components/person/person-form'

describe('PersonEditForm', () => {
  it('groups profile fields and saves the edited values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <>
        <PersonEditForm
          initialValues={personToFormValues({
            name: '민지',
            relationType: '친구',
            favorite: true,
          })}
          relationTags={[{ id: 1, label: '대학교' }]}
          onSubmit={onSubmit}
          onDelete={vi.fn()}
        />
        <button type="submit" form="person-edit-form">
          변경사항 저장
        </button>
      </>,
    )

    expect(
      screen.getByRole('heading', { name: '기본 정보' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '관계' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '함께한 날짜' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '기억 메모' }),
    ).toBeInTheDocument()

    const nameInput = screen.getByRole('textbox', { name: '이름' })
    expect(nameInput).not.toHaveFocus()
    await user.clear(nameInput)
    await user.type(nameInput, '민지 수정')
    await user.click(screen.getByRole('button', { name: '대학교' }))
    await user.click(screen.getByRole('button', { name: '변경사항 저장' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '민지 수정',
        relationType: '친구',
        relationTagChipIds: [1],
        favorite: true,
      }),
    )
  })

  it('separates deletion from the save action', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <PersonEditForm
        initialValues={personToFormValues({ name: '민지' })}
        relationTags={[]}
        onSubmit={vi.fn()}
        onDelete={onDelete}
      />,
    )

    await user.click(screen.getByRole('button', { name: '인물 삭제' }))

    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('keeps compact memory inputs full width on mobile', () => {
    render(
      <PersonEditForm
        initialValues={personToFormValues({ name: '민지' })}
        relationTags={[]}
        onSubmit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    for (const placeholder of ['예: 산책, 라떼', '예: 매운 음식']) {
      expect(
        screen.getByPlaceholderText(placeholder).parentElement,
      ).toHaveClass('w-full')
    }
  })
})
