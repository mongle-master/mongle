import { Pencil, Trash2 } from 'lucide-react'
import { TagChip } from '@/components/ui/tag-chip'
import { normalizeChipColor } from '@/lib/relation-tag-colors'
import type { ChipResponse } from '@/apis/generated/mongle-api.schemas'

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
      <TagChip
        interactive={false}
        size="lg"
        surface="soft"
        color={color}
        className="min-w-0 max-w-full"
      >
        {color ? (
          <span
            className="size-3.5 shrink-0 rounded-full border-2 border-background shadow-sm ring-1 ring-black/10"
            style={{ backgroundColor: color }}
            title={color}
            aria-label={`지정 색상 ${color}`}
          />
        ) : null}
        <span
          data-amp-mask={chip.personal || undefined}
          className="min-w-0 truncate"
        >
          {chip.label}
        </span>
      </TagChip>
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
