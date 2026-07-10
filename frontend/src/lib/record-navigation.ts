export type RecordReturnTo =
  'timeline' | 'person-timeline' | 'person-profile' | 'home' | 'event-detail'

const RECORD_RETURN_TO = new Set<RecordReturnTo>([
  'timeline',
  'person-timeline',
  'person-profile',
  'home',
  'event-detail',
])

export type EventDetailReturnTo = Exclude<RecordReturnTo, 'event-detail'>

export function parseRecordReturnTo(
  value: unknown,
): RecordReturnTo | undefined {
  return typeof value === 'string' &&
    RECORD_RETURN_TO.has(value as RecordReturnTo)
    ? (value as RecordReturnTo)
    : undefined
}

export function parseEventDetailReturnTo(
  value: unknown,
): EventDetailReturnTo | undefined {
  const parsed = parseRecordReturnTo(value)
  return parsed && parsed !== 'event-detail' ? parsed : undefined
}

export function parseRecordSearchId(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

export function eventDetailSearch(search: {
  returnTo?: EventDetailReturnTo
  returnPersonId?: number
}) {
  return {
    returnTo: search.returnTo,
    returnPersonId: search.returnPersonId,
  }
}

export function recordSearch(search: {
  personId?: number
  eventId?: number
  returnTo?: RecordReturnTo
  returnPersonId?: number
  detailReturnTo?: EventDetailReturnTo
  detailReturnPersonId?: number
}) {
  return {
    personId: search.personId,
    eventId: search.eventId,
    returnTo: search.returnTo,
    returnPersonId: search.returnPersonId,
    detailReturnTo: search.detailReturnTo,
    detailReturnPersonId: search.detailReturnPersonId,
  }
}

type NavigationTarget =
  | {
      to: '/'
      params?: undefined
      search?: undefined
    }
  | {
      to: '/timeline'
      params?: undefined
      search?: undefined
    }
  | {
      to: '/people/$personId/timeline'
      params: { personId: string }
      search?: undefined
    }
  | {
      to: '/people/$personId'
      params: { personId: string }
      search?: undefined
    }
  | {
      to: '/events/$eventId'
      params: { eventId: string }
      search: ReturnType<typeof eventDetailSearch>
    }

export function resolveEventDetailBack(search: {
  returnTo?: EventDetailReturnTo
  returnPersonId?: number
}): NavigationTarget {
  if (search.returnTo === 'timeline') {
    return { to: '/timeline' }
  }
  if (search.returnTo === 'person-timeline' && search.returnPersonId) {
    return {
      to: '/people/$personId/timeline',
      params: { personId: String(search.returnPersonId) },
    }
  }
  if (search.returnTo === 'person-profile' && search.returnPersonId) {
    return {
      to: '/people/$personId',
      params: { personId: String(search.returnPersonId) },
    }
  }
  if (search.returnTo === 'home') {
    return { to: '/' }
  }
  return { to: '/timeline' }
}

export function recordEditFromEventDetail(
  eventId: number,
  detailSearch: {
    returnTo?: EventDetailReturnTo
    returnPersonId?: number
  },
) {
  return recordSearch({
    eventId,
    returnTo: 'event-detail',
    detailReturnTo: detailSearch.returnTo,
    detailReturnPersonId: detailSearch.returnPersonId,
  })
}
