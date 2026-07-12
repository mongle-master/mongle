import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { getEvent, getPersonTimeline } from '@/apis/generated/mongle-api'
import { queryKeyNamespaces } from '@/apis/queries/_namespaces'

const queryKeys = {
  all: [queryKeyNamespaces.events] as const,
  detail: (id: number) => [queryKeyNamespaces.events, id] as const,
  personTimeline: (personId: number, categoryChipIds?: number[]) =>
    [
      queryKeyNamespaces.events,
      'person-timeline',
      personId,
      [...(categoryChipIds ?? [])].sort((a, b) => a - b),
    ] as const,
}

export const byId = (id: number, enabled = true) =>
  queryOptions({
    queryKey: queryKeys.detail(id),
    queryFn: () => getEvent(id),
    enabled,
  })

export const byPerson = (personId: number, categoryChipIds?: number[]) =>
  queryOptions({
    queryKey: queryKeys.personTimeline(personId, categoryChipIds),
    queryFn: () => getPersonTimeline(personId, { categoryChipIds }),
    enabled: Number.isFinite(personId),
    placeholderData: keepPreviousData,
  })

export const allKey = queryKeys.all
export const personTimelineKey = [
  queryKeyNamespaces.events,
  'person-timeline',
] as const
