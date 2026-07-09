import { Link } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

export function FormPageHeader({
  back,
  title,
  onSave,
  saving = false,
  saveLabel = '저장',
  className,
}: {
  back: LinkProps
  title: string
  onSave?: () => void
  saving?: boolean
  saveLabel?: string
  className?: string
}) {
  return (
    <header
      className={cn('grid shrink-0 grid-cols-3 items-center py-1', className)}
    >
      <Link {...back} className="text-lg font-extrabold text-muted-foreground">
        ‹
      </Link>
      <h1 className="text-center text-base font-extrabold">{title}</h1>
      {onSave ? (
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="text-right text-[15px] font-extrabold disabled:opacity-50"
        >
          {saving ? '저장 중' : saveLabel}
        </button>
      ) : (
        <span aria-hidden className="text-right" />
      )}
    </header>
  )
}
