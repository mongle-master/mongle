import type {
  ActivityFlowResponse,
  ChipRef,
  ChipResponse,
  ChipType,
  EventResponse,
  PersonDetailResponse,
  PersonResponse,
  RelationMapResponse,
  ThrowbackResponse,
  TimelineCard,
  TimelineResponse,
} from '@/lib/api/types'

// 백엔드 시더(ChipSeeder·DemoDataSeeder)와 같은 시나리오를 유지한다(mustpass/dummy-data-mode.md §6).
// 원본은 칩·인물·기록뿐이고, 파생값(친밀도·스탯·타임라인·활동흐름)은 백엔드와 같은 규칙으로
// 아래에서 계산한다 — 시더가 바뀌면 원본 상수만 같이 고치면 된다.
// id 는 네트워크를 타지 않으므로(쓰기는 DummyModeError) 실서버 id 와 일치시킬 필요 없다.

// ── 날짜: 시더처럼 '오늘' 기준 상대 날짜 ──────────────────────────────

const TODAY = new Date()

function isoDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function shift(days: number, months = 0, years = 0) {
  return isoDate(
    new Date(
      TODAY.getFullYear() - years,
      TODAY.getMonth() - months,
      TODAY.getDate() - days,
    ),
  )
}

const daysAgo = (n: number) => shift(n)
const monthsAgo = (n: number) => shift(0, n)
const yearsAgo = (n: number) => shift(0, 0, n)

function daysBetween(fromIso: string, toIso: string) {
  return Math.round(
    (new Date(toIso).getTime() - new Date(fromIso).getTime()) / 86_400_000,
  )
}

// 백엔드 DateDisplay.relativeTime 과 같은 버킷.
function relativeTime(dateIso: string) {
  const days = daysBetween(dateIso, isoDate(TODAY))
  if (days <= 0) return '오늘'
  if (days === 1) return '어제'
  if (days <= 13) return `${days}일 전`
  if (days <= 59) return `${Math.floor(days / 7)}주 전`
  if (days <= 364) return `${Math.floor(days / 30)}개월 전`
  return `${Math.floor(days / 365)}년 전`
}

// 백엔드 DateDisplay.acquaintancePeriod 와 같은 규칙(가장 큰 단위 하나).
function acquaintancePeriod(firstMetIso: string) {
  const days = daysBetween(firstMetIso, isoDate(TODAY))
  if (days >= 365) return `${Math.floor(days / 365)}년`
  if (days >= 30) return `${Math.floor(days / 30)}개월`
  return `${days}일`
}

// ── 칩: ChipSeeder 라벨·순서 동일 ────────────────────────────────────

function chip(
  id: number,
  type: ChipType,
  label: string,
  opts: {
    color?: string
    personal?: boolean
    default?: boolean
    order: number
  },
): ChipResponse {
  return {
    id,
    type,
    label,
    color: opts.color ?? null,
    personal: opts.personal ?? false,
    order: opts.order,
    default: opts.default ?? false,
  }
}

export const DUMMY_CHIPS: ChipResponse[] = [
  chip(11, 'CATEGORY', '만남', { order: 0, default: true }),
  chip(12, 'CATEGORY', '연락', { order: 1 }),
  chip(13, 'CATEGORY', '기념일', { order: 2 }),
  chip(14, 'CATEGORY', '기타', { order: 3 }),
  chip(21, 'RELATION_TAG', '가족', {
    color: '#E85D75',
    personal: true,
    order: 0,
  }),
  chip(22, 'RELATION_TAG', '친구', {
    color: '#0EA5E9',
    personal: true,
    order: 1,
  }),
  chip(23, 'RELATION_TAG', '직장', {
    color: '#22A06B',
    personal: true,
    order: 2,
  }),
  chip(24, 'RELATION_TAG', '대학동기', {
    color: '#8B5CF6',
    personal: true,
    order: 3,
  }),
  chip(25, 'RELATION_TAG', '동네', {
    color: '#F97316',
    personal: true,
    order: 4,
  }),
  chip(31, 'EMOTION', '반가움', { order: 0 }),
  chip(32, 'EMOTION', '뭉클', { order: 1 }),
  chip(33, 'EMOTION', '편안', { order: 2 }),
  chip(34, 'EMOTION', '즐거움', { order: 3 }),
  chip(35, 'EMOTION', '고마움', { order: 4 }),
  chip(36, 'EMOTION', '그냥', { order: 5 }),
  chip(41, 'WEATHER', '맑음', { order: 0 }),
  chip(42, 'WEATHER', '흐림', { order: 1 }),
  chip(43, 'WEATHER', '비', { order: 2 }),
  chip(44, 'WEATHER', '쌀쌀', { order: 3 }),
  chip(45, 'WEATHER', '더움', { order: 4 }),
]

function chipRef(label: string): ChipRef {
  const found = DUMMY_CHIPS.find((c) => c.label === label)!
  return { id: found.id, label: found.label, color: found.color }
}

// ── 인물 5명: DemoDataSeeder 동일 ────────────────────────────────────

export const DUMMY_PERSONS: PersonResponse[] = [
  {
    id: 1,
    name: '김서연',
    birthday: { year: 1995, month: 4, day: 12 },
    firstMetDate: yearsAgo(3),
    lastMetDate: daysAgo(3),
    profileImageUrl: null,
    gender: 'FEMALE',
    relationType: '대학 친구',
    relationTags: [chipRef('친구'), chipRef('대학동기')],
    likes: ['카페 투어', '산책'],
    cautions: ['매운 음식'],
    favorite: true,
    createdAt: null,
  },
  {
    id: 2,
    name: '이준호',
    birthday: { month: 9, day: 23 },
    firstMetDate: monthsAgo(14),
    lastMetDate: monthsAgo(1),
    profileImageUrl: null,
    gender: 'MALE',
    relationType: '회사 동료',
    relationTags: [chipRef('직장')],
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
    lastMetDate: monthsAgo(2),
    profileImageUrl: null,
    gender: 'FEMALE',
    relationType: '동생',
    relationTags: [chipRef('가족')],
    likes: [],
    cautions: [],
    favorite: true,
    createdAt: null,
  },
  {
    id: 4,
    name: '최윤서',
    birthday: null,
    firstMetDate: monthsAgo(14),
    lastMetDate: daysAgo(10),
    profileImageUrl: null,
    gender: 'FEMALE',
    relationType: '동네 친구',
    relationTags: [chipRef('동네'), chipRef('친구')],
    likes: ['떡볶이'],
    cautions: ['늦은 약속'],
    favorite: false,
    createdAt: null,
  },
  {
    id: 5,
    name: '정하준',
    birthday: { year: 1998, month: 7, day: 30 },
    firstMetDate: yearsAgo(2),
    lastMetDate: yearsAgo(1),
    profileImageUrl: null,
    gender: 'MALE',
    relationType: '동아리 후배',
    relationTags: [chipRef('대학동기'), chipRef('친구')],
    likes: [],
    cautions: [],
    favorite: false,
    createdAt: null,
  },
]

function personRef(id: number) {
  const p = DUMMY_PERSONS.find((person) => person.id === id)!
  return { id: p.id, name: p.name }
}

// ── 기록 8건: DemoDataSeeder 동일('정확히 1년 전 오늘' 1건 포함) ─────

type DummyEventSeed = {
  id: number
  date: string
  time?: string
  category: string
  weather?: string
  personIds: number[]
  emotions: string[]
  title: string
  memo: string
}

const EVENT_SEEDS: DummyEventSeed[] = [
  {
    id: 1,
    date: yearsAgo(1),
    category: '만남',
    weather: '맑음',
    personIds: [5],
    emotions: ['반가움', '즐거움'],
    title: '한강 피크닉',
    memo: '오랜만에 얼굴 보고 싶어서\n한강 피크닉',
  },
  {
    id: 2,
    date: daysAgo(3),
    time: '15:00:00',
    category: '만남',
    weather: '흐림',
    personIds: [1],
    emotions: ['편안', '고마움'],
    title: '서연이랑 카페',
    memo: '시험 끝나고 기분전환\n홍대 카페에서 수다',
  },
  {
    id: 3,
    date: daysAgo(10),
    category: '만남',
    weather: '더움',
    personIds: [4],
    emotions: ['즐거움'],
    title: '동네 저녁 산책',
    memo: '동네 저녁 산책',
  },
  {
    id: 4,
    date: monthsAgo(1),
    category: '연락',
    personIds: [2],
    emotions: ['그냥'],
    title: '오랜만에 안부 전화',
    memo: '문득 생각나서\n오랜만에 안부 전화',
  },
  {
    id: 5,
    date: monthsAgo(2),
    category: '만남',
    weather: '맑음',
    personIds: [3, 1],
    emotions: ['반가움', '편안', '즐거움'],
    title: '가족 모임 겸 저녁',
    memo: '엄마 생신\n가족 모임 겸 저녁',
  },
  {
    id: 6,
    date: monthsAgo(4),
    category: '기념일',
    weather: '쌀쌀',
    personIds: [1],
    emotions: ['뭉클', '고마움'],
    title: '서연 생일',
    memo: '10년지기 생일\n생일 축하 저녁',
  },
  {
    id: 7,
    date: monthsAgo(7),
    category: '만남',
    weather: '비',
    personIds: [5, 4],
    emotions: ['즐거움', '그냥'],
    title: '동아리 번개 모임',
    memo: '동아리 번개 모임',
  },
  {
    id: 8,
    date: monthsAgo(9),
    category: '연락',
    personIds: [2],
    emotions: ['그냥'],
    title: '프로젝트 관련 메시지',
    memo: '협업 논의\n프로젝트 관련 메시지',
  },
]

const DUMMY_EVENTS: EventResponse[] = EVENT_SEEDS.map((seed) => ({
  id: seed.id,
  title: seed.title,
  memo: seed.memo,
  occurredDate: seed.date,
  occurredTime: seed.time ?? null,
  category: chipRef(seed.category),
  weather: seed.weather ? chipRef(seed.weather) : null,
  emotions: seed.emotions.map(chipRef),
  persons: seed.personIds.map(personRef),
  photoUrls: [],
  createdAt: null,
}))

// ── 조회 함수: lib/api/* 조회 시그니처와 1:1 대응 ────────────────────

export function dummyChips(type?: ChipType) {
  return type ? DUMMY_CHIPS.filter((c) => c.type === type) : [...DUMMY_CHIPS]
}

export function dummyPersons(query?: string, sort: 'NAME' | 'RECENT' = 'NAME') {
  const q = query?.trim()
  const filtered = DUMMY_PERSONS.filter((p) => !q || p.name.includes(q))
  return filtered.sort((a, b) =>
    sort === 'RECENT'
      ? (b.lastMetDate ?? '').localeCompare(a.lastMetDate ?? '')
      : a.name.localeCompare(b.name, 'ko'),
  )
}

function eventsOf(personId: number) {
  return DUMMY_EVENTS.filter((e) => e.persons.some((p) => p.id === personId))
}

// 만남 카테고리 고유 날짜(최신 먼저) — 백엔드 PersonStats 와 같은 근거.
function meetingDatesDesc(personId: number) {
  return [
    ...new Set(
      eventsOf(personId)
        .filter((e) => e.category?.label === '만남')
        .map((e) => e.occurredDate),
    ),
  ].sort((a, b) => b.localeCompare(a))
}

export function dummyPersonDetail(id: number): PersonDetailResponse {
  const person = DUMMY_PERSONS.find((p) => p.id === id) ?? DUMMY_PERSONS[0]
  const records = eventsOf(person.id)
  return {
    ...person,
    stats: {
      meetCount: meetingDatesDesc(person.id).length,
      recordCount: records.length,
      // 만난 날을 1일째로 센다(백엔드 DateDisplay.daysSinceFirstMet).
      daysSinceFirstMet: person.firstMetDate
        ? daysBetween(person.firstMetDate, isoDate(TODAY)) + 1
        : null,
      acquaintancePeriod: person.firstMetDate
        ? acquaintancePeriod(person.firstMetDate)
        : null,
      lastMetRelative: person.lastMetDate
        ? relativeTime(person.lastMetDate)
        : null,
    },
  }
}

export function dummyEvent(id: number): EventResponse {
  return DUMMY_EVENTS.find((e) => e.id === id) ?? DUMMY_EVENTS[0]
}

export function dummyPersonTimeline(
  personId: number,
  categoryChipIds?: number[],
) {
  return eventsOf(personId)
    .filter(
      (e) =>
        !categoryChipIds?.length ||
        (e.category && categoryChipIds.includes(e.category.id)),
    )
    .sort((a, b) => b.occurredDate.localeCompare(a.occurredDate))
}

export function dummyMyTimeline(
  filters: { categoryChipIds?: number[]; personIds?: number[] } = {},
): TimelineResponse {
  const cards = DUMMY_EVENTS.filter(
    (e) =>
      (!filters.categoryChipIds?.length ||
        (e.category && filters.categoryChipIds.includes(e.category.id))) &&
      (!filters.personIds?.length ||
        e.persons.some((p) => filters.personIds!.includes(p.id))),
  ).sort((a, b) => b.occurredDate.localeCompare(a.occurredDate))

  const groups = new Map<string, TimelineCard[]>()
  for (const e of cards) {
    const key = e.occurredDate.slice(0, 7)
    const card: TimelineCard = {
      id: e.id,
      title: e.title,
      memo: e.memo,
      occurredDate: e.occurredDate,
      occurredTime: e.occurredTime,
      category: e.category,
      photoUrls: e.photoUrls,
      persons: e.persons.map((p) => {
        const person = DUMMY_PERSONS.find((dp) => dp.id === p.id)!
        return {
          id: person.id,
          name: person.name,
          profileImageUrl: person.profileImageUrl,
          favorite: person.favorite,
        }
      }),
    }
    groups.set(key, [...(groups.get(key) ?? []), card])
  }
  return {
    groups: [...groups.entries()].map(([key, monthCards]) => {
      const [year, month] = key.split('-').map(Number)
      return { year, month, label: `${year}년 ${month}월`, cards: monthCards }
    }),
  }
}

export function dummyActivityFlow(personId: number): ActivityFlowResponse {
  // 최근 6개월 창(이번 달 포함) — 백엔드 TimelineService 활동 흐름과 같은 창.
  const window = Array.from({ length: 6 }, (_, i) =>
    monthsAgo(5 - i).slice(0, 7),
  )
  const events = eventsOf(personId)
  const lane = (
    laneKey: 'MEETING' | 'CONTACT' | 'MEMORY',
    categoryLabel: string,
  ) => ({
    lane: laneKey,
    categoryLabel,
    present: window.map((ym) =>
      events.some(
        (e) =>
          e.category?.label === categoryLabel && e.occurredDate.startsWith(ym),
      ),
    ),
  })
  const lanes = [
    lane('MEETING', '만남'),
    lane('CONTACT', '연락'),
    lane('MEMORY', '기념일'),
  ]
  return {
    months: window,
    lanes,
    hasAnyActivity: lanes.some((l) => l.present.some(Boolean)),
  }
}

export function dummyRelationMap(
  relationTagChipIds?: number[],
): RelationMapResponse {
  const nodes = DUMMY_PERSONS.filter(
    (p) =>
      !relationTagChipIds?.length ||
      p.relationTags.some((t) => relationTagChipIds.includes(t.id)),
  ).map((p) => {
    const meetings = meetingDatesDesc(p.id)
    // IntimacyCalculator 와 같은 판정: 만남 <2 이면 UNKNOWN, 평소 주기 2배 초과면 DISTANT.
    const daysSinceLastMeet = meetings.length
      ? daysBetween(meetings[0], isoDate(TODAY))
      : null
    let status: 'UNKNOWN' | 'NORMAL' | 'DISTANT' = 'UNKNOWN'
    let averageIntervalDays: number | null = null
    if (meetings.length >= 2) {
      const sorted = [...meetings].sort()
      const gaps = sorted
        .slice(1)
        .map((date, i) => daysBetween(sorted[i], date))
      averageIntervalDays = Math.round(
        gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length,
      )
      status =
        daysSinceLastMeet! > averageIntervalDays * 2 ? 'DISTANT' : 'NORMAL'
    }
    return {
      id: p.id,
      name: p.name,
      profileImageUrl: p.profileImageUrl,
      avatarGender: p.gender,
      favorite: p.favorite,
      recordCount: eventsOf(p.id).length,
      relationTags: p.relationTags,
      intimacy: { status, averageIntervalDays, daysSinceLastMeet },
      firstMetDate: p.firstMetDate,
    }
  })
  return {
    me: { label: '나' },
    nodes,
    edges: nodes.map((n) => ({
      personId: n.id,
      distant: n.intimacy.status === 'DISTANT',
    })),
  }
}

export function dummyThrowback(): ThrowbackResponse | null {
  const oneYearAgo = yearsAgo(1)
  const event = DUMMY_EVENTS.find((e) => e.occurredDate === oneYearAgo)
  if (!event) return null
  return {
    eventId: event.id,
    personId: event.persons[0].id,
    personName: event.persons[0].name,
    title: event.title,
    occurredDate: event.occurredDate,
    photoUrl: event.photoUrls[0] ?? null,
  }
}
