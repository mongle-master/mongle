import type { ComponentProps } from 'react'
import { useState } from 'react'
import { X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { tagChipClass } from '@/components/ui/tag-chip'
import { isImeComposing } from '@/lib/keyboard'
import { cn } from '@/lib/utils'

function FieldLabel({
  className,
  children,
  ...props
}: ComponentProps<typeof Label>) {
  return (
    <Label className={cn('font-extrabold', className)} {...props}>
      {children}
    </Label>
  )
}

export function ListField({
  label,
  items,
  onChange,
  placeholder = '',
  maxItems = 20,
  tone = 'neutral',
}: {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  maxItems?: number
  tone?: 'neutral' | 'green' | 'red'
}) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const chipToneClass = {
    neutral: 'bg-muted text-foreground',
    green:
      'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
    red: 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
  }[tone]

  const addItem = () => {
    const value = draft.trim()
    if (!value) return
    if (value.length > 30) {
      setError('최대 30자까지 쓸 수 있어요.')
      return
    }
    if (items.includes(value)) {
      setError('이미 있는 항목이에요.')
      return
    }
    if (items.length >= maxItems) {
      setError('최대 20개까지 담을 수 있어요.')
      return
    }
    onChange([...items, value])
    setDraft('')
    setError(null)
  }

  return (
    <div>
      <FieldLabel className="mb-2 block">{label}</FieldLabel>
      <div className="flex items-start gap-2">
        <div
          className={cn(
            'flex min-h-10 flex-1 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-2 py-1.5 shadow-xs',
            'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
          )}
        >
          {items.map((item) => (
            <span
              key={item}
              className={cn(
                'inline-flex h-7 max-w-full items-center gap-1 rounded-md px-2.5 text-[13px] font-bold',
                chipToneClass,
              )}
            >
              <span className="min-w-0 truncate">{item}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((i) => i !== item))}
                className="flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-background hover:text-foreground"
                aria-label={`${item} 삭제`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          <input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              setError(null)
            }}
            placeholder={items.length === 0 ? placeholder : ''}
            onKeyDown={(e) => {
              if (isImeComposing(e)) return
              if (e.key === 'Enter') {
                e.preventDefault()
                addItem()
              }
            }}
            className="h-6 min-w-24 flex-1 border-0 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <Button type="button" variant="outline" onClick={addItem}>
          추가
        </Button>
      </div>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

export const RELATION_TYPE_SUGGESTIONS = [
  '친구',
  '회사 동료',
  '가족',
  '연인',
  '스터디원',
  '이웃',
  '지인',
] as const

export function RelationTypeField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <FieldLabel>만남 태그</FieldLabel>
      <div className="mt-2 flex flex-wrap gap-2">
        {RELATION_TYPE_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              onChange(value === suggestion ? '' : suggestion)
            }}
            className={tagChipClass(value === suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
