import { queryOptions } from '@tanstack/react-query'
import { getChips } from '@/apis/generated/mongle-api'
import type { ChipResponseType } from '@/apis/generated/mongle-api.schemas'
import { queryKeyNamespaces } from '@/apis/queries/_namespaces'

const CHIP_TYPES: ChipResponseType[] = [
  'CATEGORY',
  'RELATION_TAG',
  'EMOTION',
  'WEATHER',
]

const queryKeys = {
  all: [queryKeyNamespaces.chips] as const,
  byType: (type: ChipResponseType) => [queryKeyNamespaces.chips, type] as const,
}

export const all = () =>
  queryOptions({
    queryKey: queryKeys.all,
    queryFn: async () =>
      (await Promise.all(CHIP_TYPES.map((type) => getChips({ type })))).flat(),
  })

export const byType = (type: ChipResponseType) =>
  queryOptions({
    queryKey: queryKeys.byType(type),
    queryFn: () => getChips({ type }),
  })

export const allKey = queryKeys.all
