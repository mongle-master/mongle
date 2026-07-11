import { ChevronLeft, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FormPageHeader({
  onBack,
  title,
  onSave,
  saving = false,
  disabled = false,
  className,
}: {
  onBack: () => void
  title: string
  onSave?: () => void
  saving?: boolean
  disabled?: boolean
  className?: string
}) {
  return (
    <header
      className={cn('grid shrink-0 grid-cols-3 items-center py-1', className)}
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center justify-self-start text-muted-foreground"
        aria-label="뒤로 가기"
      >
        <ChevronLeft className="size-6" />
      </button>
      <h1 className="text-center text-base font-extrabold">{title}</h1>
      {onSave ? (
        <button
          type="button"
          onClick={onSave}
          disabled={saving || disabled}
          aria-label="저장"
          className="inline-flex items-center justify-self-end disabled:opacity-50"
        >
          <Save className="size-6" />
        </button>
      ) : (
        <span aria-hidden className="text-right" />
      )}
    </header>
  )
}
