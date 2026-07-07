import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ListField({
  label,
  items,
  onChange,
  placeholder,
  maxItems = 20,
}: {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
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
      <Label className="mb-2 block">{label}</Label>
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
              className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((i) => i !== item))}
                className="text-xs font-bold text-muted-foreground"
              >
                삭제
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
  return (
    <div>
      <Label htmlFor="relationType">관계 유형 (선택)</Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {RELATION_TYPE_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onChange(suggestion)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-bold',
              value === suggestion
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="직접 입력도 가능해요"
        className="mt-2"
        maxLength={20}
      />
    </div>
  )
}
