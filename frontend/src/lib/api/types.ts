export type ChipRef = { id: number; label: string; color?: string | null }
export type PersonNameFields = {
  name: string
  fullName?: string | null
  familyName?: string | null
  givenName?: string | null
  lastName?: string | null
  firstName?: string | null
}

export type PersonRef = { id: number } & PersonNameFields

export type ChipType = 'CATEGORY' | 'RELATION_TAG' | 'EMOTION' | 'WEATHER'

export type ChipResponse = {
  id: number
  type: ChipType
  label: string
  color?: string | null
  personal: boolean
  order: number
  default: boolean
}

export type PersonResponse = PersonNameFields & {
  id: number
  birthday: { year?: number; month?: number; day?: number } | null
  firstMetDate: string | null
  lastMetDate: string | null
  profileImageUrl: string | null
  gender: 'FEMALE' | 'MALE' | null
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
  gender?: 'FEMALE' | 'MALE' | null
  relationType?: string | null
  relationTagChipIds?: number[]
  likes?: string[]
  cautions?: string[]
  favorite?: boolean
}

export type IntimacyStatus = 'UNKNOWN' | 'NORMAL' | 'DISTANT'

export type RelationMapResponse = {
  me: { label: string }
  nodes: Array<
    PersonNameFields & {
      id: number
      profileImageUrl: string | null
      avatarGender?: 'FEMALE' | 'MALE' | null
      favorite: boolean
      recordCount: number
      relationTags: ChipRef[]
      intimacy: {
        status: IntimacyStatus
        averageIntervalDays: number | null
        daysSinceLastMeet: number | null
      }
      firstMetDate: string | null
    }
  >
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
  memo: string | null
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
  memo?: string | null
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

export type TimelinePerson = {
  id: number
  name: string
  fullName?: string | null
  familyName?: string | null
  givenName?: string | null
  lastName?: string | null
  firstName?: string | null
  profileImageUrl: string | null
  favorite: boolean
}

export type TimelineCard = {
  id: number
  title: string
  memo: string | null
  occurredDate: string
  occurredTime: string | null
  category: ChipRef | null
  photoUrls: string[]
  persons: TimelinePerson[]
}

export type TimelineMonthGroup = {
  year: number
  month: number
  label: string
  cards: TimelineCard[]
}

export type TimelineResponse = {
  groups: TimelineMonthGroup[]
}

export type ApiErrorBody = {
  code?: string
  message?: string
}
