import type {
  ActivityFlowResponse,
  ChipResponse,
  EventResponse,
  PersonDetailResponse,
  PersonResponse,
  RelationMapResponse,
  ThrowbackResponse,
  TimelineCard,
  TimelineResponse,
} from '@/lib/api/types'

export const FALLBACK_CHIPS: ChipResponse[] = [
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
    name: '유진',
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
    name: '재윤',
    birthday: { month: 9, day: 23 },
    firstMetDate: '2025-05-07',
    lastMetDate: '2026-07-07',
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
    name: '지훈',
    birthday: { year: 2000, month: 11, day: 5 },
    firstMetDate: null,
    lastMetDate: '2026-06-30',
    profileImageUrl: null,
    relationType: '동생',
    relationTags: [{ id: 401, label: '가족' }],
    likes: [],
    cautions: [],
    favorite: true,
    createdAt: null,
  },
  {
    id: 4,
    name: '소연',
    birthday: { month: 2, day: 14 },
    firstMetDate: '2024-03-01',
    lastMetDate: '2026-07-02',
    profileImageUrl: null,
    relationType: '친구',
    relationTags: [{ id: 402, label: '친구' }],
    likes: ['전시', '산책'],
    cautions: [],
    favorite: false,
    createdAt: null,
  },
  {
    id: 5,
    name: '하은',
    birthday: { month: 6, day: 5 },
    firstMetDate: '2024-09-01',
    lastMetDate: '2026-06-23',
    profileImageUrl: null,
    relationType: '친구',
    relationTags: [{ id: 402, label: '친구' }],
    likes: ['카페', '영화'],
    cautions: [],
    favorite: false,
    createdAt: null,
  },
  {
    id: 6,
    name: '민수',
    birthday: { month: 12, day: 2 },
    firstMetDate: '2023-12-11',
    lastMetDate: '2026-06-07',
    profileImageUrl: null,
    relationType: '회사 동료',
    relationTags: [{ id: 403, label: '직장' }],
    likes: ['러닝', '커피'],
    cautions: [],
    favorite: false,
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
      status: p.id === 6 ? 'DISTANT' : 'NORMAL',
      averageIntervalDays: 30,
      daysSinceLastMeet:
        p.id === 1
          ? 3
          : p.id === 2
            ? 0
            : p.id === 3
              ? 7
              : p.id === 4
                ? 5
                : p.id === 5
                  ? 14
                  : 30,
    },
  })),
  edges: FALLBACK_PERSONS.map((p) => ({
    personId: p.id,
    distant: p.id === 6,
  })),
}

export const FALLBACK_THROWBACK: ThrowbackResponse = {
  eventId: 99,
  personId: 1,
  personName: '유진',
  title: '이친구와 제주도 여행 다녀온 날. 날씨가 정말 좋았던 하루',
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

function toTimelineCard(
  event: EventResponse,
  person: PersonResponse,
): TimelineCard {
  return {
    id: event.id,
    title: event.title,
    why: event.why,
    what: event.what,
    occurredDate: event.occurredDate,
    occurredTime: event.occurredTime,
    category: event.category,
    photoUrls: event.photoUrls,
    persons: [
      {
        id: person.id,
        name: person.name,
        profileImageUrl: person.profileImageUrl,
        favorite: person.favorite,
      },
    ],
  }
}

export function fallbackMyTimeline(): TimelineResponse {
  const cards = FALLBACK_PERSONS.flatMap((person) =>
    fallbackEvents(person.id, person.name).map((event) =>
      toTimelineCard(event, person),
    ),
  ).sort((a, b) => b.occurredDate.localeCompare(a.occurredDate) || b.id - a.id)

  const groupMap = new Map<string, TimelineCard[]>()
  for (const card of cards) {
    const [year, month] = card.occurredDate.split('-')
    const key = `${year}-${month}`
    const list = groupMap.get(key) ?? []
    list.push(card)
    groupMap.set(key, list)
  }

  const groups = [...groupMap.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, monthCards]) => {
      const [yearStr, monthStr] = key.split('-')
      const year = Number(yearStr)
      const month = Number(monthStr)
      return {
        year,
        month,
        label: `${year}년 ${month}월`,
        cards: monthCards,
      }
    })

  return { groups }
}
