import type { ChipResponse, EventRequest, PersonRef } from '@/lib/api/types'
import { formatOccurredTimeForApi } from './record-validation'

export const EMOTION_MAX = 5
export const NOTE_MAX = 120
export const DERIVED_TITLE_MAX = 18
export const RECORD_FUNNEL_STEPS = [
  'person',
  'emotion',
  'letter',
  'detail',
] as const

export type RecordFunnelStep = (typeof RECORD_FUNNEL_STEPS)[number]

export function getDefaultChipId(chips: ChipResponse[]) {
  return chips.find((chip) => chip.default)?.id ?? chips.at(0)?.id ?? null
}

export function toggleLimitedId(
  selectedIds: number[],
  id: number,
  max: number,
) {
  if (selectedIds.includes(id)) {
    return selectedIds.filter((selectedId) => selectedId !== id)
  }
  if (selectedIds.length >= max) {
    return selectedIds
  }
  return [...selectedIds, id]
}

export function resolvePrimaryRecordPerson({
  presetPersonId,
  persons,
  eventPersons,
}: {
  presetPersonId: number | undefined
  persons: PersonRef[]
  eventPersons: PersonRef[]
}) {
  if (presetPersonId) {
    return (
      persons.find((person) => person.id === presetPersonId) ??
      eventPersons.find((person) => person.id === presetPersonId) ??
      null
    )
  }

  return eventPersons.at(0) ?? persons.at(0) ?? null
}

export function getNextRecordFunnelStep(step: RecordFunnelStep) {
  const index = RECORD_FUNNEL_STEPS.indexOf(step)
  return RECORD_FUNNEL_STEPS.at(index + 1) ?? null
}

export function deriveRecordTitle(value: string) {
  const firstLine = value.split('\n')[0]?.trim() ?? ''
  if (!firstLine) return null
  return firstLine.slice(0, DERIVED_TITLE_MAX)
}

export function getEmotionSentenceStem(label: string) {
  const known: Record<string, string> = {
    기쁨: '기뻤',
    감사: '감사했',
    편안: '편안했',
    반가움: '반가웠',
    고마움: '고마웠',
    아쉬움: '아쉬웠',
    슬픔: '슬펐',
    편함: '편했',
    몽글: '몽글했',
  }
  return known[label] ?? `${label}했`
}

export function getRecordDateOptions(baseDate = new Date()) {
  return Array.from({ length: 5 }, (_, index) => {
    const offset = 4 - index
    const date = new Date(baseDate)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - offset)
    return {
      value: formatDateValue(date),
      label: getRecordDateOptionLabel(offset, date),
      day: String(date.getDate()).padStart(2, '0'),
    }
  })
}

function getRecordDateOptionLabel(offset: number, date: Date) {
  if (offset === 0) return '오늘'
  if (offset === 1) return '어제'
  return ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
}

function formatDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function buildRecordFunnelPayload({
  personIds,
  occurredDate,
  categoryChipId,
  categoryChips,
  emotionChipIds,
  note,
  occurredTime,
  photoUrls,
}: {
  personIds: number[]
  occurredDate: string
  categoryChipId: number | null
  categoryChips: ChipResponse[]
  emotionChipIds: number[]
  note: string
  occurredTime: string
  photoUrls: string[]
}): EventRequest {
  const trimmedNote = note.trim()

  return {
    title: deriveRecordTitle(trimmedNote),
    memo: trimmedNote || null,
    occurredDate,
    occurredTime: formatOccurredTimeForApi(occurredTime),
    categoryChipId: categoryChipId ?? getDefaultChipId(categoryChips),
    weatherChipId: null,
    emotionChipIds,
    personIds,
    photoUrls,
  }
}
