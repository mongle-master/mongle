import { api } from '@/lib/api/client'
import { dummyMyTimeline } from '@/lib/dummy-data'
import { DUMMY_DATA_MODE } from '@/lib/dummy-mode'
import type { TimelineResponse } from '@/lib/api/types'

type MyTimelineFilters = {
  categoryChipIds?: number[]
  personIds?: number[]
}

export async function fetchMyTimeline(filters: MyTimelineFilters = {}) {
  if (DUMMY_DATA_MODE) return dummyMyTimeline(filters)
  const searchParams = new URLSearchParams()
  filters.categoryChipIds?.forEach((id) =>
    searchParams.append('categoryChipIds', String(id)),
  )
  filters.personIds?.forEach((id) =>
    searchParams.append('personIds', String(id)),
  )
  const qs = searchParams.toString()
  return api.get(`v1/timeline${qs ? `?${qs}` : ''}`).json<TimelineResponse>()
}
