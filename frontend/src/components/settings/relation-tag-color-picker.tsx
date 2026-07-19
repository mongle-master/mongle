import { Palette } from 'lucide-react'
import { useState } from 'react'
import {
  RELATION_TAG_COLOR_OPTIONS,
  normalizeChipColor,
} from '@/lib/relation-tag-colors'
import { cn } from '@/lib/utils'
import { TagColorPickerModal } from '@/components/settings/tag-color-picker-modal'

export function RelationTagColorPicker({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const normalized = normalizeChipColor(value)
  const selectedOption = RELATION_TAG_COLOR_OPTIONS.find(
    (option) => option.value === normalized,
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/35 px-3 text-left transition-colors hover:bg-muted/60',
          className,
        )}
        aria-label="색상 선택"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="size-7 shrink-0 rounded-full border border-background shadow-sm ring-1 ring-border"
            style={{ backgroundColor: normalized }}
            aria-hidden
          />
          <span className="min-w-0 truncate text-xs font-extrabold text-foreground">
            {selectedOption?.label ?? normalized}
          </span>
        </div>
        <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-[11px] font-extrabold text-muted-foreground">
          <Palette className="size-3.5" />
          변경
        </span>
      </button>

      <TagColorPickerModal
        open={open}
        value={normalized}
        onOpenChange={setOpen}
        onChange={onChange}
      />
    </>
  )
}
