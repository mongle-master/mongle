import { FieldLabel } from '@/components/person/field-label'
import { ListGroupInset } from '@/components/ui/list-group-inset'
import { TagChip } from '@/components/ui/tag-chip'
import { cn } from '@/lib/utils'

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
  inset = false,
  hideLabel = false,
}: {
  value: string
  onChange: (value: string) => void
  inset?: boolean
  hideLabel?: boolean
}) {
  const chips = (
    <div className={cn('flex flex-wrap gap-2', !hideLabel && !inset && 'mt-2')}>
      {RELATION_TYPE_SUGGESTIONS.map((suggestion) => (
        <TagChip
          key={suggestion}
          tone="foreground"
          surface="card"
          hover
          selected={value === suggestion}
          onClick={() => {
            onChange(value === suggestion ? '' : suggestion)
          }}
        >
          {suggestion}
        </TagChip>
      ))}
    </div>
  )

  return (
    <div>
      {hideLabel ? null : <FieldLabel>만남 태그</FieldLabel>}
      {inset ? (
        <ListGroupInset className="mt-2 p-2">{chips}</ListGroupInset>
      ) : (
        chips
      )}
    </div>
  )
}
