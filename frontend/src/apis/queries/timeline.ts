import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { getTimeline } from '@/apis/generated/mongle-api'
import { queryKeyNamespaces } from '@/apis/queries/_namespaces'

const queryKeys = {
  all: [queryKeyNamespaces.timeline] as const,
  list: (categoryChipIds?: number[], personIds?: number[]) =>
    [
      queryKeyNamespaces.timeline,
      [...(categoryChipIds ?? [])].sort((a, b) => a - b),
      [...(personIds ?? [])].sort((a, b) => a - b),
    ] as const,
}

export const list = (categoryChipIds?: number[], personIds?: number[]) =>
  queryOptions({
    queryKey: queryKeys.list(categoryChipIds, personIds),
    queryFn: () => getTimeline({ categoryChipIds, personIds }),
    placeholderData: keepPreviousData,
  })

export const allKey = queryKeys.all
