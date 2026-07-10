#!/usr/bin/env node

const DEFAULT_API_URL = 'http://localhost:8080/api'
const DEFAULT_USERNAME = 'demo'
const DEFAULT_COUNT = 100
const DEFAULT_PREFIX = '샘플'
const DEFAULT_EVENT_PREFIX = '샘플 타임라인'
const DEFAULT_EVENT_START_YEAR = 2015
const DEFAULT_EVENT_END_YEAR = 2025
const DEFAULT_EVENTS_PER_YEAR = 10

const FIRST_NAMES = [
  '민준',
  '서준',
  '도윤',
  '예준',
  '시우',
  '하준',
  '주원',
  '지호',
  '지후',
  '준우',
  '서연',
  '서윤',
  '지우',
  '서현',
  '하은',
  '하윤',
  '민서',
  '지유',
  '윤서',
  '채원',
]

const RELATION_TYPES = [
  '친구',
  '동료',
  '동네친구',
  '스터디',
  '가족',
  '선배',
  '후배',
  '모임',
  '취미친구',
  '멘토',
]

const LIKES = [
  '커피',
  '산책',
  '영화',
  '전시',
  '러닝',
  '책',
  '디저트',
  '보드게임',
  '사진',
  '맛집',
]

const CAUTIONS = [
  '늦은 연락',
  '매운 음식',
  '소음',
  '갑작스런 약속',
  '야근 시즌',
  '알레르기',
]

const args = parseArgs(process.argv.slice(2))
const apiUrl = normalizeBaseUrl(
  args['api-url'] ?? process.env.MONGLE_API_URL ?? DEFAULT_API_URL,
)
const username =
  args.username ?? process.env.MONGLE_USERNAME ?? DEFAULT_USERNAME
const count = readNonNegativeInteger(
  args.count ?? process.env.MONGLE_SEED_COUNT,
  DEFAULT_COUNT,
)
const prefix = args.prefix ?? process.env.MONGLE_SEED_PREFIX ?? DEFAULT_PREFIX
const eventPrefix =
  args['event-prefix'] ??
  process.env.MONGLE_SEED_EVENT_PREFIX ??
  DEFAULT_EVENT_PREFIX
const eventStartYear = readInteger(
  args['event-start-year'] ?? process.env.MONGLE_SEED_EVENT_START_YEAR,
  DEFAULT_EVENT_START_YEAR,
)
const eventEndYear = readInteger(
  args['event-end-year'] ?? process.env.MONGLE_SEED_EVENT_END_YEAR,
  DEFAULT_EVENT_END_YEAR,
)
const eventsPerYear = readPositiveInteger(
  args['events-per-year'] ?? process.env.MONGLE_SEED_EVENTS_PER_YEAR,
  DEFAULT_EVENTS_PER_YEAR,
)
const skipExisting = args['skip-existing'] !== 'false'

main().catch((error) => {
  console.error(`\nSeed failed: ${error.message}`)
  process.exitCode = 1
})

async function main() {
  const token = args.token ?? process.env.MONGLE_TOKEN ?? (await issueToken())
  const authHeaders = {
    Authorization: `Bearer ${token}`,
  }

  const [persons, relationTags, categoryChips, weatherChips, emotionChips] =
    await Promise.all([
      request('/v1/persons?sort=NAME', { headers: authHeaders }),
      request('/v1/chips?type=RELATION_TAG', { headers: authHeaders }),
      request('/v1/chips?type=CATEGORY', { headers: authHeaders }),
      request('/v1/chips?type=WEATHER', { headers: authHeaders }),
      request('/v1/chips?type=EMOTION', { headers: authHeaders }),
    ])

  const existingTimeline = await request('/v1/timeline', {
    headers: authHeaders,
  })

  const existingEventKeys = new Set(
    flattenTimelineCards(existingTimeline).map(
      (card) => `${card.occurredDate}|${card.title}`,
    ),
  )

  const existingNames = new Set(persons.map((person) => person.name))
  const existingSeedCount = persons.filter((person) =>
    person.name.startsWith(prefix),
  ).length
  const toCreate = skipExisting ? Math.max(count - existingSeedCount, 0) : count
  const created = []

  if (toCreate === 0) {
    console.log(
      `Already have ${existingSeedCount} "${prefix}" people. Skipping people.`,
    )
  } else {
    console.log(`Adding ${toCreate} people to ${apiUrl} as "${username}"...`)

    for (let index = 0; index < toCreate; index += 1) {
      const sequence = nextAvailableSequence(existingNames, prefix)
      const person = buildPerson(sequence, relationTags)
      const response = await request('/v1/persons', {
        method: 'POST',
        headers: authHeaders,
        body: person,
      })

      existingNames.add(response.name)
      created.push(response)
      console.log(
        `${String(created.length).padStart(3, ' ')}. ${response.name}`,
      )
    }
  }

  const allPersons =
    created.length > 0
      ? await request('/v1/persons?sort=NAME', { headers: authHeaders })
      : persons
  const seedPersons = allPersons.filter((person) =>
    person.name.startsWith(prefix),
  )
  const eventPersons = seedPersons.length > 0 ? seedPersons : allPersons

  if (eventPersons.length === 0) {
    console.log('\nNo people available for timeline events. Skipped events.')
    return
  }

  const eventPlans = buildTimelineEvents({
    persons: eventPersons,
    categoryChips,
    weatherChips,
    emotionChips,
  })
  const missingEventPlans = skipExisting
    ? eventPlans.filter(
        (event) =>
          !existingEventKeys.has(`${event.occurredDate}|${event.title}`),
      )
    : eventPlans

  if (missingEventPlans.length === 0) {
    console.log(`Already have ${eventPlans.length} "${eventPrefix}" events.`)
  } else {
    console.log(
      `\nAdding ${missingEventPlans.length} timeline events (${eventStartYear}-${eventEndYear}, ${eventsPerYear}/year)...`,
    )
    for (let index = 0; index < missingEventPlans.length; index += 1) {
      const event = missingEventPlans[index]
      await request('/v1/events', {
        method: 'POST',
        headers: authHeaders,
        body: event,
      })
      console.log(
        `${String(index + 1).padStart(3, ' ')}. ${event.occurredDate} ${event.title}`,
      )
    }
  }

  console.log(
    `\nDone. Created ${created.length} people and ${missingEventPlans.length} timeline events.`,
  )
}

async function issueToken() {
  const response = await request('/v1/auth/token', {
    method: 'POST',
    body: { username },
  })

  if (!response.token) {
    throw new Error('Token response did not include a token.')
  }

  return response.token
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  }

  const response = await fetch(`${apiUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(
      `${options.method ?? 'GET'} ${path} -> ${response.status} ${text}`,
    )
  }

  if (response.status === 204) return null
  return response.json()
}

function buildPerson(sequence, relationTags) {
  const gender = sequence % 2 === 0 ? 'FEMALE' : 'MALE'
  const firstName = FIRST_NAMES[(sequence - 1) % FIRST_NAMES.length]
  const relationType = RELATION_TYPES[(sequence - 1) % RELATION_TYPES.length]
  const firstMetDate = dateDaysAgo(1200 - ((sequence * 11) % 900))
  const lastMetDate = dateDaysAgo((sequence * 7) % 120)
  const tagIds = pickRelationTagIds(relationTags, sequence)

  return {
    name: `${prefix}${String(sequence).padStart(3, '0')}${firstName}`,
    birthday: {
      year: 1988 + (sequence % 18),
      month: (sequence % 12) + 1,
      day: (sequence % 28) + 1,
    },
    firstMetDate,
    lastMetDate,
    profileImageUrl: null,
    gender,
    relationType,
    relationTagChipIds: tagIds,
    likes: [
      LIKES[sequence % LIKES.length],
      LIKES[(sequence + 3) % LIKES.length],
    ],
    cautions: sequence % 4 === 0 ? [CAUTIONS[sequence % CAUTIONS.length]] : [],
    favorite: sequence % 13 === 0,
  }
}

function buildTimelineEvents({
  persons,
  categoryChips,
  weatherChips,
  emotionChips,
}) {
  const years = Array.from(
    { length: Math.max(eventEndYear - eventStartYear + 1, 0) },
    (_, index) => eventStartYear + index,
  )
  const titles = [
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

  return years.flatMap((year) =>
    Array.from({ length: eventsPerYear }, (_, index) => {
      const sequence = (year - eventStartYear) * eventsPerYear + index
      const person = persons[sequence % persons.length]
      const category = pickChip(categoryChips, sequence)
      const weather = pickChip(weatherChips, sequence)
      const emotion = pickChip(emotionChips, sequence)
      const title =
        titles[index % titles.length] ?? `${eventPrefix} ${index + 1}`

      return {
        title: `${eventPrefix} ${year}-${String(index + 1).padStart(2, '0')} ${title}`,
        memo: `${year}년에 남겨둔 샘플 타임라인 기록`,
        occurredDate: buildEventDate(year, index),
        occurredTime:
          index % 3 === 0
            ? null
            : `${String(10 + (index % 8)).padStart(2, '0')}:00:00`,
        categoryChipId: category?.id ?? null,
        weatherChipId: index % 4 === 0 ? null : weather?.id ?? null,
        emotionChipIds: emotion ? [emotion.id] : [],
        personIds: [person.id],
        photoUrls: [],
      }
    }),
  )
}

function buildEventDate(year, index) {
  const month = ((index * 5 + year) % 12) + 1
  const day = ((index * 7 + year) % 28) + 1
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(
    2,
    '0',
  )}`
}

function flattenTimelineCards(timeline) {
  return (timeline.groups ?? []).flatMap((group) => group.cards ?? [])
}

function pickChip(chips, sequence) {
  if (chips.length === 0) return null
  return chips[sequence % chips.length] ?? null
}

function pickRelationTagIds(relationTags, sequence) {
  if (relationTags.length === 0) return []

  const first = relationTags[(sequence - 1) % relationTags.length]?.id
  const second =
    sequence % 5 === 0 ? relationTags[sequence % relationTags.length]?.id : null
  return [...new Set([first, second].filter(Boolean))]
}

function nextAvailableSequence(existingNames, seedPrefix) {
  for (let sequence = 1; sequence < 10000; sequence += 1) {
    const padded = String(sequence).padStart(3, '0')
    const used = [...existingNames].some((name) =>
      name.startsWith(`${seedPrefix}${padded}`),
    )
    if (!used) return sequence
  }

  throw new Error(`Could not find an available "${seedPrefix}" sequence.`)
}

function dateDaysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, '')
}

function readPositiveInteger(value, fallback) {
  if (value == null) return fallback
  const parsed = Number.parseInt(String(value), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function readNonNegativeInteger(value, fallback) {
  if (value == null) return fallback
  const parsed = Number.parseInt(String(value), 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

function readInteger(value, fallback) {
  if (value == null) return fallback
  const parsed = Number.parseInt(String(value), 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseArgs(rawArgs) {
  const parsed = {}

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index]
    if (!arg.startsWith('--')) continue

    const [key, inlineValue] = arg.slice(2).split('=', 2)
    parsed[key] = inlineValue ?? rawArgs[index + 1] ?? 'true'
    if (
      inlineValue == null &&
      rawArgs[index + 1] &&
      !rawArgs[index + 1].startsWith('--')
    ) {
      index += 1
    }
  }

  return parsed
}
