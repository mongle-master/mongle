import { Check } from 'lucide-react'
import { DialogShell } from '@/components/ui/dialog-shell'
import {
  RELATION_TAG_COLOR_OPTIONS,
  normalizeChipColor,
} from '@/lib/relation-tag-colors'
import { cn } from '@/lib/utils'
import { isLightTagColor } from '@/stackflow/activities/settings/tag-color.utils'

export function TagColorPickerModal({
  open,
  value,
  onOpenChange,
  onChange,
}: {
  open: boolean
  value: string
  onOpenChange: (open: boolean) => void
  onChange: (value: string) => void
}) {
  const normalized = normalizeChipColor(value)
  const selectedOption = RELATION_TAG_COLOR_OPTIONS.find(
    (option) => option.value === normalized,
  )

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      labelledBy="tag-color-picker-title"
    >
      <div className="pr-9">
        <h2
          id="tag-color-picker-title"
          className="text-base font-extrabold tracking-tight text-foreground"
        >
          태그 색상
        </h2>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-muted/35 px-3 py-2">
          <span
            className="size-7 shrink-0 rounded-full border border-background shadow-sm ring-1 ring-border"
            style={{ backgroundColor: normalized }}
            aria-hidden
          />
          <span className="text-sm font-extrabold text-foreground">
            {selectedOption?.label ?? normalized}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {RELATION_TAG_COLOR_OPTIONS.map((option) => {
          const active = normalized === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                onOpenChange(false)
              }}
              className={cn(
                'flex h-14 items-center gap-2 rounded-xl border bg-background px-2.5 text-left transition-all',
                active
                  ? 'border-foreground ring-2 ring-foreground/15'
                  : 'border-border hover:bg-muted',
              )}
              aria-pressed={active}
            >
              <span
                className="grid size-7 shrink-0 place-items-center rounded-full border border-background shadow-sm ring-1 ring-black/10"
                style={{ backgroundColor: option.value }}
              >
                {active ? (
                  <Check
                    className={cn(
                      'size-4 stroke-[3]',
                      isLightTagColor(option.value)
                        ? 'text-zinc-950'
                        : 'text-white',
                    )}
                  />
                ) : null}
              </span>
              <span className="min-w-0 truncate text-xs font-extrabold text-foreground">
                {option.label}
              </span>
            </button>
          )
        })}
      </div>
    </DialogShell>
  )
}
