import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ChipResponseType } from '@/apis/generated/models'
import {
  chipQuery,
  eventQuery,
  homeQuery,
  personQuery,
  timelineQuery,
} from '@/apis/queries'
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
  type: ChipResponseType
  label: string
  description: string
}>

const MANAGED_TAG_TYPES = new Set<ChipResponseType>([
  'CATEGORY',
  'RELATION_TAG',
])

export function TagSettingsPage() {
  const queryClient = useQueryClient()
  const chipsQuery = useQuery(chipQuery.all())

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
          onChanged={() => {
            void Promise.all([
              queryClient.invalidateQueries({ queryKey: chipQuery.allKey }),
              queryClient.invalidateQueries({ queryKey: personQuery.allKey }),
              queryClient.invalidateQueries({ queryKey: homeQuery.allKey }),
              queryClient.invalidateQueries({ queryKey: eventQuery.allKey }),
              queryClient.invalidateQueries({
                queryKey: timelineQuery.allKey,
              }),
            ])
          }}
        />
      ))}
    </div>
  )
}
