export type ChipRef = { id: number; label: string }
export type PersonRef = { id: number; name: string }

export type ChipType = 'EMOTION' | 'WEATHER' | 'CATEGORY' | 'RELATION_TAG'

export type ChipResponse = {
  id: number
  type: ChipType
  label: string
  personal: boolean
  order: number
  default: boolean
}

export type PersonResponse = {
  id: number
  name: string
  birthday: { year?: number; month?: number; day?: number } | null
  firstMetDate: string | null
  lastMetDate: string | null
  profileImageUrl: string | null
  relationType: string | null
  relationTags: ChipRef[]
  likes: string[]
  cautions: string[]
  favorite: boolean
  createdAt: string | null
}

export type PersonStats = {
  meetCount: number
  recordCount: number
  daysSinceFirstMet: number | null
  acquaintancePeriod: string | null
  lastMetRelative: string | null
}

export type PersonDetailResponse = PersonResponse & {
  stats: PersonStats
}

export type PersonRequest = {
  name: string
  birthday?: { year?: number; month?: number; day?: number } | null
  firstMetDate?: string | null
  lastMetDate?: string | null
  profileImageUrl?: string | null
  relationType?: string | null
  relationTagChipIds?: number[]
  likes?: string[]
  cautions?: string[]
  favorite?: boolean
}

export type IntimacyStatus = 'UNKNOWN' | 'NORMAL' | 'DISTANT'

export type RelationMapResponse = {
  me: { label: string }
  nodes: Array<{
    id: number
    name: string
    profileImageUrl: string | null
    favorite: boolean
    relationTags: ChipRef[]
    intimacy: {
      status: IntimacyStatus
      averageIntervalDays: number | null
      daysSinceLastMeet: number | null
    }
  }>
  edges: Array<{ personId: number; distant: boolean }>
}

export type ThrowbackResponse = {
  eventId: number
  personId: number
  personName: string
  title: string | null
  occurredDate: string
  photoUrl: string | null
}

export type EventResponse = {
  id: number
  title: string
  why: string | null
  what: string | null
  occurredDate: string
  occurredTime: string | null
  category: ChipRef | null
  weather: ChipRef | null
  emotions: ChipRef[]
  persons: PersonRef[]
  photoUrls: string[]
  createdAt: string | null
}

export type EventRequest = {
  title?: string | null
  why?: string | null
  what?: string | null
  occurredDate?: string | null
  occurredTime?: string | null
  categoryChipId?: number | null
  weatherChipId?: number | null
  emotionChipIds?: number[]
  personIds: number[]
  photoUrls?: string[]
}

export type ActivityFlowResponse = {
  months: string[]
  lanes: Array<{
    lane: 'MEETING' | 'CONTACT' | 'MEMORY'
    categoryLabel: string
    present: boolean[]
  }>
  hasAnyActivity: boolean
}

export type ApiErrorBody = {
  code?: string
  message?: string
}
