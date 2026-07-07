import type {
  ActivityFlowResponse,
  ChipResponse,
  EventResponse,
  PersonDetailResponse,
  PersonResponse,
  RelationMapResponse,
  ThrowbackResponse,
} from '@/lib/api/types'

export const FALLBACK_CHIPS: ChipResponse[] = [
  {
    id: 101,
    type: 'EMOTION',
    label: '반가움',
    personal: false,
    order: 1,
    default: true,
  },
  {
    id: 102,
    type: 'EMOTION',
    label: '뭉클',
    personal: false,
    order: 2,
    default: true,
  },
  {
    id: 103,
    type: 'EMOTION',
    label: '편안',
    personal: false,
    order: 3,
    default: true,
  },
  {
    id: 104,
    type: 'EMOTION',
    label: '즐거움',
    personal: false,
    order: 4,
    default: true,
  },
  {
    id: 105,
    type: 'EMOTION',
    label: '고마움',
    personal: false,
    order: 5,
    default: true,
  },
  {
    id: 106,
    type: 'EMOTION',
    label: '그냥',
    personal: false,
    order: 6,
    default: true,
  },
  {
    id: 201,
    type: 'WEATHER',
    label: '맑음',
    personal: false,
    order: 1,
    default: true,
  },
  {
    id: 202,
    type: 'WEATHER',
    label: '흐림',
    personal: false,
    order: 2,
    default: true,
  },
  {
    id: 203,
    type: 'WEATHER',
    label: '비',
    personal: false,
    order: 3,
    default: true,
  },
  {
    id: 204,
    type: 'WEATHER',
    label: '쌀쌀',
    personal: false,
    order: 4,
    default: true,
  },
  {
    id: 205,
    type: 'WEATHER',
    label: '더움',
    personal: false,
    order: 5,
    default: true,
  },
  {
    id: 301,
    type: 'CATEGORY',
    label: '만남',
    personal: false,
    order: 1,
    default: true,
  },
  {
    id: 302,
    type: 'CATEGORY',
    label: '연락',
    personal: false,
    order: 2,
    default: true,
  },
  {
    id: 303,
    type: 'CATEGORY',
    label: '기념일',
    personal: false,
    order: 3,
    default: true,
  },
  {
    id: 304,
    type: 'CATEGORY',
    label: '기타',
    personal: false,
    order: 4,
    default: true,
  },
  {
    id: 401,
    type: 'RELATION_TAG',
    label: '가족',
    personal: true,
    order: 1,
    default: false,
  },
  {
    id: 402,
    type: 'RELATION_TAG',
    label: '친구',
    personal: true,
    order: 2,
    default: false,
  },
  {
    id: 403,
    type: 'RELATION_TAG',
    label: '직장',
    personal: true,
    order: 3,
    default: false,
  },
  {
    id: 404,
    type: 'RELATION_TAG',
    label: '대학동기',
    personal: true,
    order: 4,
    default: false,
  },
]

export const FALLBACK_PERSONS: PersonResponse[] = [
  {
    id: 1,
    name: '김서연',
    birthday: { year: 1995, month: 4, day: 12 },
    firstMetDate: '2023-07-07',
    lastMetDate: '2026-07-04',
    profileImageUrl: null,
    relationType: '대학 친구',
    relationTags: [
      { id: 402, label: '친구' },
      { id: 404, label: '대학동기' },
    ],
    likes: ['카페 투어', '산책'],
    cautions: ['매운 음식'],
    favorite: true,
    createdAt: null,
  },
  {
    id: 2,
    name: '이준호',
    birthday: { month: 9, day: 23 },
    firstMetDate: '2025-05-07',
    lastMetDate: '2026-06-07',
    profileImageUrl: null,
    relationType: '회사 동료',
    relationTags: [{ id: 403, label: '직장' }],
    likes: ['커피', '러닝'],
    cautions: [],
    favorite: false,
    createdAt: null,
  },
  {
    id: 3,
    name: '박민지',
    birthday: { year: 2000, month: 11, day: 5 },
    firstMetDate: null,
    lastMetDate: '2026-05-07',
    profileImageUrl: null,
    relationType: '동생',
    relationTags: [{ id: 401, label: '가족' }],
    likes: [],
    cautions: [],
    favorite: true,
    createdAt: null,
  },
]

export const FALLBACK_RELATION_MAP: RelationMapResponse = {
  me: { label: '나' },
  nodes: FALLBACK_PERSONS.map((p) => ({
    id: p.id,
    name: p.name,
    profileImageUrl: p.profileImageUrl,
    favorite: p.favorite,
    relationTags: p.relationTags,
    intimacy: {
      status: p.id === 2 ? 'DISTANT' : 'NORMAL',
      averageIntervalDays: 30,
      daysSinceLastMeet: p.id === 1 ? 3 : 30,
    },
  })),
  edges: FALLBACK_PERSONS.map((p) => ({
    personId: p.id,
    distant: p.id === 2,
  })),
}

export const FALLBACK_THROWBACK: ThrowbackResponse = {
  eventId: 99,
  personId: 1,
  personName: '김서연',
  title: '작년 이맘때 한강 산책',
  occurredDate: '2025-07-07',
  photoUrl: null,
}

const fallbackEvents = (
  personId: number,
  personName: string,
): EventResponse[] => [
  {
    id: personId * 100 + 1,
    title: '유진 결혼식',
    why: '결혼식 참석',
    what: '축하해주고 맛있는 거 많이 먹기',
    occurredDate: '2024-05-26',
    occurredTime: null,
    category: { id: 303, label: '기념일' },
    weather: { id: 201, label: '맑음' },
    emotions: [{ id: 105, label: '고마움' }],
    persons: [{ id: personId, name: personName }],
    photoUrls: [],
    createdAt: null,
  },
  {
    id: personId * 100 + 2,
    title: '카페 약속',
    why: '오랜만에 수다',
    what: '근황 토크 + 신상 카페 발견',
    occurredDate: '2024-04-13',
    occurredTime: '15:00:00',
    category: { id: 301, label: '만남' },
    weather: { id: 201, label: '맑음' },
    emotions: [
      { id: 103, label: '편안' },
      { id: 105, label: '고마움' },
    ],
    persons: [{ id: personId, name: personName }],
    photoUrls: [],
    createdAt: null,
  },
  {
    id: personId * 100 + 3,
    title: '개발 모임',
    why: null,
    what: '코드 리뷰 + 아키텍처 이야기',
    occurredDate: '2024-02-17',
    occurredTime: '13:00:00',
    category: { id: 301, label: '만남' },
    weather: null,
    emotions: [{ id: 104, label: '즐거움' }],
    persons: [{ id: personId, name: personName }],
    photoUrls: [],
    createdAt: null,
  },
]

export function fallbackPersonTimeline(personId: number) {
  const person =
    FALLBACK_PERSONS.find((p) => p.id === personId) ?? FALLBACK_PERSONS[0]
  return fallbackEvents(person.id, person.name)
}

export function fallbackPersonDetail(personId: number): PersonDetailResponse {
  const base =
    FALLBACK_PERSONS.find((p) => p.id === personId) ?? FALLBACK_PERSONS[0]
  return {
    ...base,
    stats: {
      meetCount: 24,
      recordCount: 18,
      daysSinceFirstMet: 2154,
      acquaintancePeriod: '6년',
      lastMetRelative: '6일 전',
    },
  }
}

export const FALLBACK_ACTIVITY_FLOW: ActivityFlowResponse = {
  months: ['2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'],
  lanes: [
    {
      lane: 'MEETING',
      categoryLabel: '만남',
      present: [false, true, true, true, true, true],
    },
    {
      lane: 'CONTACT',
      categoryLabel: '연락',
      present: [true, true, false, true, true, true],
    },
    {
      lane: 'MEMORY',
      categoryLabel: '추억',
      present: [false, false, true, false, false, false],
    },
  ],
  hasAnyActivity: true,
}
