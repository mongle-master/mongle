import { queryOptions } from '@tanstack/react-query'
import { getPerson, getPersons } from '@/apis/generated/mongle-api'
import type { GetPersonsSort } from '@/apis/generated/mongle-api.schemas'
import { queryKeyNamespaces } from '@/apis/queries/_namespaces'

const queryKeys = {
  all: [queryKeyNamespaces.persons] as const,
  directory: (query: string | undefined, sort: GetPersonsSort) =>
    [queryKeyNamespaces.persons, 'directory', query ?? '', sort] as const,
  detail: (id: number) => [queryKeyNamespaces.persons, id] as const,
}

export const all = () =>
  queryOptions({
    queryKey: queryKeys.directory(undefined, 'NAME'),
    queryFn: () => getPersons({ sort: 'NAME' }),
  })

export const list = (query?: string, sort: GetPersonsSort = 'NAME') =>
  queryOptions({
    queryKey: queryKeys.directory(query, sort),
    queryFn: () => getPersons({ query: query?.trim() || undefined, sort }),
  })

export const byId = (id: number) =>
  queryOptions({
    queryKey: queryKeys.detail(id),
    queryFn: () => getPerson(id),
    enabled: Number.isFinite(id),
  })

export const allKey = queryKeys.all
