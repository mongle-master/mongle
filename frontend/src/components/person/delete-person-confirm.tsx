import { ConfirmPopup } from '@/components/ui/confirm-popup'

// 인물 삭제 확인 팝업. 문구와 destructive 스타일을 한곳에 고정한다.
export function DeletePersonConfirm({
  open,
  onOpenChange,
  error,
  pending,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  error: boolean
  pending: boolean
  onConfirm: () => void
}) {
  return (
    <ConfirmPopup
      open={open}
      onOpenChange={onOpenChange}
      title="인물을 삭제할까요?"
      description="삭제하면 되돌릴 수 없어요. 함께 새긴 기록도 모두 사라져요."
      error={
        error
          ? '인물을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.'
          : undefined
      }
      confirmLabel="삭제"
      destructive
      pending={pending}
      onConfirm={onConfirm}
    />
  )
}
