import { Pencil, Trash2 } from 'lucide-react'
import {
  coloredTagStyle,
  normalizeChipColor,
  tagChipClass,
} from '@/components/ui/tag-chip'
import type { ChipResponse } from '@/lib/api/types'

export function TagSettingRow({
  chip,
  supportsColor,
  deletePending,
  onEdit,
  onDelete,
}: {
  chip: ChipResponse
  supportsColor: boolean
  deletePending: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const color = supportsColor ? normalizeChipColor(chip.color) : null

  return (
    <div className="flex min-h-9 items-center gap-2">
      <div
        className={tagChipClass(false, {
          inactiveClassName:
            'h-8 max-w-full border-border/60 bg-background px-2.5 text-foreground',
          className: 'inline-flex min-w-0 items-center gap-1.5',
        })}
        style={color ? coloredTagStyle(color) : undefined}
      >
        {color ? (
          <span
            className="size-3.5 shrink-0 rounded-full border-2 border-background shadow-sm ring-1 ring-black/10"
            style={{ backgroundColor: color }}
            title={color}
            aria-label={`지정 색상 ${color}`}
          />
        ) : null}
        <span className="min-w-0 truncate">{chip.label}</span>
      </div>
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          onClick={onEdit}
          className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="태그 수정"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={deletePending}
          className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:text-destructive"
          aria-label="삭제"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
