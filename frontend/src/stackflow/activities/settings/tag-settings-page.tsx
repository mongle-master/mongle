import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchChips } from '@/lib/api/chips'
import type { ChipType } from '@/lib/api/types'
import { queryKeys } from '@/lib/query-keys'
import { TagTypePanel } from '@/stackflow/activities/settings/tag-type-panel'

const TAG_GROUPS = [
  {
    type: 'CATEGORY' as const,
    label: '만남 태그',
    description: '기록을 구분할 때 사용해요',
  },
  {
    type: 'RELATION_TAG' as const,
    label: '관계 태그',
    description: '사람 사이의 관계를 나타내요',
  },
] satisfies ReadonlyArray<{
  type: ChipType
  label: string
  description: string
}>

const MANAGED_TAG_TYPES = new Set<ChipType>(['CATEGORY', 'RELATION_TAG'])

export function TagSettingsPage() {
  const queryClient = useQueryClient()
  const chipsQuery = useQuery({
    queryKey: queryKeys.chips,
    queryFn: () => fetchChips(),
  })

  const chips = (chipsQuery.data ?? []).filter((chip) =>
    MANAGED_TAG_TYPES.has(chip.type),
  )

  return (
    <div className="min-h-0 flex-1 space-y-7 overflow-y-auto pb-8">
      {TAG_GROUPS.map((group) => (
        <TagTypePanel
          key={group.type}
          type={group.type}
          label={group.label}
          description={group.description}
          chips={chips.filter((chip) => chip.type === group.type)}
          onChanged={() =>
            queryClient.invalidateQueries({ queryKey: queryKeys.chips })
          }
        />
      ))}
    </div>
  )
}
