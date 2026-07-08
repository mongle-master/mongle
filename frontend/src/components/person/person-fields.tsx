import type { ComponentProps } from 'react'
import { useState } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
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
}: {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  maxItems?: number
}) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

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
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            setError(null)
          }}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addItem()
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addItem}>
          추가
        </Button>
      </div>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
      {items.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-1.5">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              <span className="min-w-0 flex-1">{item}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((i) => i !== item))}
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`${item} 삭제`}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
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
  // 제안 칩 선택값과 "새 태그" 입력은 별개. 제안에 있는 값이면 input은 비워 둔다.
  const [draft, setDraft] = useState(() =>
    (RELATION_TYPE_SUGGESTIONS as readonly string[]).includes(value)
      ? ''
      : value,
  )

  return (
    <div>
      <FieldLabel htmlFor="relationType">만남 태그</FieldLabel>
      <div className="mt-2 flex flex-wrap gap-2">
        {RELATION_TYPE_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              onChange(suggestion)
              setDraft('')
            }}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-bold',
              value === suggestion && draft === ''
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card',
            )}
          >
            {suggestion}
          </button>
        ))}
      </div>
      <Input
        id="relationType"
        value={draft}
        onChange={(e) => {
          const next = e.target.value
          setDraft(next)
          onChange(next)
        }}
        placeholder="새 태그(10자 이내)"
        className="mt-2"
        maxLength={10}
      />
    </div>
  )
}
