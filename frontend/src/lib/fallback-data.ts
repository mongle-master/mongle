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
    color: null,
    personal: false,
    order: 1,
    default: true,
  },
  {
    id: 302,
    type: 'CATEGORY',
    label: '연락',
    color: null,
    personal: false,
    order: 2,
    default: true,
  },
  {
    id: 303,
    type: 'CATEGORY',
    label: '기념일',
    color: null,
    personal: false,
    order: 3,
    default: true,
  },
  {
    id: 304,
    type: 'CATEGORY',
    label: '기타',
    color: null,
    personal: false,
    order: 4,
    default: true,
  },
  {
    id: 401,
    type: 'RELATION_TAG',
    label: '가족',
    color: '#E85D75',
    personal: true,
    order: 1,
    default: false,
  },
  {
    id: 402,
    type: 'RELATION_TAG',
    label: '친구',
    color: '#0EA5E9',
    personal: true,
    order: 2,
    default: false,
  },
  {
    id: 403,
    type: 'RELATION_TAG',
    label: '직장',
    color: '#22A06B',
    personal: true,
    order: 3,
    default: false,
  },
  {
    id: 404,
    type: 'RELATION_TAG',
    label: '대학동기',
    color: '#8B5CF6',
    personal: true,
    order: 4,
    default: false,
  },
  {
    id: 501,
    type: 'EMOTION',
    label: '기쁨',
    personal: false,
    order: 1,
    default: false,
  },
  {
    id: 502,
    type: 'EMOTION',
    label: '감사',
    personal: false,
    order: 2,
    default: false,
  },
  {
    id: 503,
    type: 'EMOTION',
    label: '편안',
    personal: false,
    order: 3,
    default: false,
  },
  {
    id: 601,
    type: 'WEATHER',
    label: '맑음',
    personal: false,
    order: 1,
    default: false,
  },
  {
    id: 602,
    type: 'WEATHER',
    label: '흐림',
    personal: false,
    order: 2,
    default: false,
  },
  {
    id: 603,
    type: 'WEATHER',
    label: '비',
    personal: false,
    order: 3,
    default: false,
  },
]

const EXTRA_FALLBACK_PERSON_NAMES = [
  '도윤',
  '민서',
  '준호',
  '서윤',
  '현우',
  '지우',
  '예린',
  '태민',
  '수빈',
  '건우',
  '다은',
  '시현',
  '윤재',
  '나연',
  '정우',
  '채원',
  '동현',
  '아린',
  '태윤',
  '은서',
]

const EXTRA_FALLBACK_RELATIONS = [
  { type: '친구', tag: { id: 402, label: '친구', color: '#0EA5E9' } },
  { type: '회사 동료', tag: { id: 403, label: '직장', color: '#22A06B' } },
  { type: '가족', tag: { id: 401, label: '가족', color: '#E85D75' } },
  { type: '대학 동기', tag: { id: 404, label: '대학동기', color: '#8B5CF6' } },
]

const EXTRA_FALLBACK_LIKES = [
  ['러닝', '커피'],
  ['전시', '디저트'],
  ['영화', '맛집'],
  ['책', '산책'],
  ['사진', '카페'],
]

const EXTRA_FALLBACK_FAMILY_NAMES = [
  '김',
  '이',
  '박',
  '최',
  '정',
  '강',
  '조',
  '윤',
]

const EXTRA_FALLBACK_PEOPLE: PersonResponse[] = EXTRA_FALLBACK_PERSON_NAMES.map(
  (name, index) => {
    const id = index + 7
    const relation =
      EXTRA_FALLBACK_RELATIONS[index % EXTRA_FALLBACK_RELATIONS.length]

    return {
      id,
      name,
      familyName:
        EXTRA_FALLBACK_FAMILY_NAMES[index % EXTRA_FALLBACK_FAMILY_NAMES.length],
      birthday: {
        year: 1989 + (index % 14),
        month: (index % 12) + 1,
        day: ((index * 3) % 28) + 1,
      },
      firstMetDate: `202${3 + (index % 4)}-${String((index % 12) + 1).padStart(
        2,
        '0',
      )}-${String(((index * 5) % 28) + 1).padStart(2, '0')}`,
      lastMetDate: `2026-${String(((index + 1) % 7) + 1).padStart(
        2,
        '0',
      )}-${String(((index * 4) % 28) + 1).padStart(2, '0')}`,
      profileImageUrl: null,
      gender: index % 2 === 0 ? 'MALE' : 'FEMALE',
      relationType: relation.type,
      relationTags: [relation.tag],
      likes: EXTRA_FALLBACK_LIKES[index % EXTRA_FALLBACK_LIKES.length],
      cautions: index % 6 === 0 ? ['갑작스런 약속'] : [],
      favorite: index % 9 === 0,
      createdAt: null,
    }
  },
)

export const FALLBACK_PERSONS: PersonResponse[] = [
  {
    id: 1,
    name: '유진',
    familyName: '김',
    birthday: { year: 1995, month: 4, day: 12 },
    firstMetDate: '2023-07-07',
    lastMetDate: '2026-07-04',
    profileImageUrl: null,
    gender: 'FEMALE',
    relationType: '대학 친구',
    relationTags: [
      { id: 402, label: '친구', color: '#0EA5E9' },
      { id: 404, label: '대학동기', color: '#8B5CF6' },
    ],
    likes: ['카페 투어', '산책'],
    cautions: ['매운 음식'],
    favorite: true,
    createdAt: null,
  },
  {
    id: 2,
    name: '재윤',
    familyName: '이',
    birthday: { month: 9, day: 23 },
    firstMetDate: '2025-05-07',
    lastMetDate: '2026-07-07',
    profileImageUrl: null,
    gender: 'MALE',
    relationType: '회사 동료',
    relationTags: [{ id: 403, label: '직장', color: '#22A06B' }],
    likes: ['커피', '러닝'],
    cautions: [],
    favorite: false,
    createdAt: null,
  },
  {
    id: 3,
    name: '지훈',
    familyName: '박',
    birthday: { year: 2000, month: 11, day: 5 },
    firstMetDate: null,
    lastMetDate: '2026-06-30',
    profileImageUrl: null,
    gender: 'MALE',
    relationType: '동생',
    relationTags: [{ id: 401, label: '가족', color: '#E85D75' }],
    likes: [],
    cautions: [],
    favorite: true,
    createdAt: null,
  },
  {
    id: 4,
    name: '소연',
    familyName: '최',
    birthday: { month: 2, day: 14 },
    firstMetDate: '2024-03-01',
    lastMetDate: '2026-07-02',
    profileImageUrl: null,
    gender: 'FEMALE',
    relationType: '친구',
    relationTags: [{ id: 402, label: '친구', color: '#0EA5E9' }],
    likes: ['전시', '산책'],
    cautions: [],
    favorite: false,
    createdAt: null,
  },
  {
    id: 5,
    name: '하은',
    familyName: '정',
    birthday: { month: 6, day: 5 },
    firstMetDate: '2024-09-01',
    lastMetDate: '2026-06-23',
    profileImageUrl: null,
    gender: 'FEMALE',
    relationType: '친구',
    relationTags: [{ id: 402, label: '친구', color: '#0EA5E9' }],
    likes: ['카페', '영화'],
    cautions: [],
    favorite: false,
    createdAt: null,
  },
  {
    id: 6,
    name: '민수',
    familyName: '강',
    birthday: { month: 12, day: 2 },
    firstMetDate: '2023-12-11',
    lastMetDate: '2026-06-07',
    profileImageUrl: null,
    gender: 'MALE',
    relationType: '회사 동료',
    relationTags: [{ id: 403, label: '직장', color: '#22A06B' }],
    likes: ['러닝', '커피'],
    cautions: [],
    favorite: false,
    createdAt: null,
  },
  ...EXTRA_FALLBACK_PEOPLE,
]

export const FALLBACK_RELATION_MAP: RelationMapResponse = {
  me: { label: '나' },
  nodes: FALLBACK_PERSONS.map((p) => ({
    id: p.id,
    name: p.name,
    familyName: p.familyName,
    givenName: p.givenName,
    fullName: p.fullName,
    lastName: p.lastName,
    firstName: p.firstName,
    profileImageUrl: p.profileImageUrl,
    avatarGender: p.gender,
    favorite: p.favorite,
    recordCount: p.id === 1 ? 7 : p.id === 2 ? 5 : p.id === 3 ? 3 : 2,
    relationTags: p.relationTags,
    firstMetDate: p.firstMetDate,
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

const FALLBACK_TIMELINE_YEARS = Array.from(
  { length: 11 },
  (_, index) => 2015 + index,
)

const FALLBACK_TIMELINE_TITLES = [
  '카페에서 근황 나눈 날',
  '함께 산책한 오후',
  '생일 축하 메시지',
  '전시 보고 온 날',
  '늦은 저녁 통화',
  '새로운 맛집 발견',
  '주말 보드게임 모임',
  '여행 계획 세운 날',
  '오랜만의 점심 약속',
  '기념일 챙긴 날',
]

const FALLBACK_TIMELINE_CATEGORIES = FALLBACK_CHIPS.filter(
  (chip) => chip.type === 'CATEGORY',
).map(({ id, label, color }) => ({ id, label, color }))

const FALLBACK_TIMELINE_WEATHERS = [
  { id: 601, label: '맑음' },
  { id: 602, label: '흐림' },
  { id: 603, label: '비' },
]

const FALLBACK_TIMELINE_EMOTIONS = [
  { id: 501, label: '기쁨' },
  { id: 502, label: '감사' },
  { id: 503, label: '편안' },
]

const FALLBACK_TIMELINE_EVENTS: EventResponse[] =
  FALLBACK_TIMELINE_YEARS.flatMap((year) =>
    Array.from({ length: 10 }, (_, index) => {
      const sequence = (year - 2015) * 10 + index
      const person = FALLBACK_PERSONS[sequence % FALLBACK_PERSONS.length]
      const month = ((index * 5 + year) % 12) + 1
      const day = ((index * 7 + year) % 28) + 1
      const category =
        FALLBACK_TIMELINE_CATEGORIES[
          sequence % FALLBACK_TIMELINE_CATEGORIES.length
        ]
      const weather =
        sequence % 4 === 0
          ? null
          : FALLBACK_TIMELINE_WEATHERS[
              sequence % FALLBACK_TIMELINE_WEATHERS.length
            ]
      const emotion =
        FALLBACK_TIMELINE_EMOTIONS[sequence % FALLBACK_TIMELINE_EMOTIONS.length]

      return {
        id: 10000 + sequence + 1,
        title: FALLBACK_TIMELINE_TITLES[index],
        memo: `${year}년에 남겨둔 샘플 타임라인 기록`,
        occurredDate: `${year}-${String(month).padStart(2, '0')}-${String(
          day,
        ).padStart(2, '0')}`,
        occurredTime:
          index % 3 === 0
            ? null
            : `${String(10 + (index % 8)).padStart(2, '0')}:00:00`,
        category,
        weather,
        emotions: [emotion],
        persons: [
          {
            id: person.id,
            name: person.name,
            familyName: person.familyName,
            givenName: person.givenName,
            fullName: person.fullName,
            lastName: person.lastName,
            firstName: person.firstName,
          },
        ],
        photoUrls: [],
        createdAt: null,
      }
    }),
  ).sort((a, b) => b.occurredDate.localeCompare(a.occurredDate) || b.id - a.id)

export function fallbackEvent(eventId: number): EventResponse | null {
  return FALLBACK_TIMELINE_EVENTS.find((event) => event.id === eventId) ?? null
}

export function fallbackPersonTimeline(personId: number) {
  return FALLBACK_TIMELINE_EVENTS.filter((event) =>
    event.persons.some((person) => person.id === personId),
  )
}

export function fallbackPersonDetail(personId: number): PersonDetailResponse {
  const base =
    FALLBACK_PERSONS.find((p) => p.id === personId) ?? FALLBACK_PERSONS[0]
  const events = fallbackPersonTimeline(base.id)
  return {
    ...base,
    stats: {
      meetCount: events.filter((event) => event.category?.id === 301).length,
      recordCount: events.length,
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
    memo: event.memo,
    occurredDate: event.occurredDate,
    occurredTime: event.occurredTime,
    category: event.category,
    photoUrls: event.photoUrls,
    persons: [
      {
        id: person.id,
        name: person.name,
        familyName: person.familyName,
        givenName: person.givenName,
        fullName: person.fullName,
        lastName: person.lastName,
        firstName: person.firstName,
        profileImageUrl: person.profileImageUrl,
        favorite: person.favorite,
      },
    ],
  }
}

export function fallbackMyTimeline(
  filters: {
    categoryChipIds?: number[]
    personIds?: number[]
  } = {},
): TimelineResponse {
  const cards = FALLBACK_TIMELINE_EVENTS.filter((event) => {
    const matchesCategory =
      !filters.categoryChipIds?.length ||
      (event.category && filters.categoryChipIds.includes(event.category.id))
    const matchesPerson =
      !filters.personIds?.length ||
      event.persons.some((person) => filters.personIds?.includes(person.id))

    return matchesCategory && matchesPerson
  }).map((event) => {
    const person =
      FALLBACK_PERSONS.find((p) => p.id === event.persons[0]?.id) ??
      FALLBACK_PERSONS[0]
    return toTimelineCard(event, person)
  })

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
