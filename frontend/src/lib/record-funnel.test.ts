import type { ChipResponse, PersonRef } from '@/lib/api/types'
import {
  buildRecordFunnelPayload,
  deriveRecordTitle,
  getDefaultChipId,
  getEmotionSentenceStem,
  getRecordDateOptions,
  getNextRecordFunnelStep,
  resolvePrimaryRecordPerson,
  toggleLimitedId,
} from './record-funnel'

const chips = [
  chip(10, 'CATEGORY', '연락', false),
  chip(11, 'CATEGORY', '만남', true),
  chip(20, 'EMOTION', '반가움', false),
  chip(21, 'EMOTION', '몽글', false),
]

describe('record funnel helpers', () => {
  it('uses only person as required input and fills date/category defaults', () => {
    const payload = buildRecordFunnelPayload({
      personIds: [1],
      occurredDate: '2026-07-08',
      categoryChipId: null,
      categoryChips: chips.filter((c) => c.type === 'CATEGORY'),
      emotionChipIds: [],
      note: '',
      occurredTime: '',
      photoUrls: [],
    })

    expect(payload).toEqual({
      title: null,
      memo: null,
      occurredDate: '2026-07-08',
      occurredTime: null,
      categoryChipId: 11,
      weatherChipId: null,
      emotionChipIds: [],
      personIds: [1],
      photoUrls: [],
    })
  })

  it('stores a one-line note as memo and derives title from it', () => {
    const payload = buildRecordFunnelPayload({
      personIds: [1],
      occurredDate: '2026-07-08',
      categoryChipId: 10,
      categoryChips: chips.filter((c) => c.type === 'CATEGORY'),
      emotionChipIds: [20, 21],
      note: '오랜만에 커피 마심',
      occurredTime: '',
      photoUrls: [],
    })

    expect(payload.title).toBe('오랜만에 커피 마심')
    expect(payload.memo).toBe('오랜만에 커피 마심')
    expect(payload.emotionChipIds).toEqual([20, 21])
    expect(payload.categoryChipId).toBe(10)
  })

  it('keeps occurred time and photos with the one-line note', () => {
    const payload = buildRecordFunnelPayload({
      personIds: [1],
      occurredDate: '2026-07-08',
      categoryChipId: 10,
      categoryChips: chips.filter((c) => c.type === 'CATEGORY'),
      emotionChipIds: [],
      note: '한 줄 메모',
      occurredTime: '19:30',
      photoUrls: ['photo.jpg'],
    })

    expect(payload.memo).toBe('한 줄 메모')
    expect(payload.occurredTime).toBe('19:30:00')
    expect(payload.photoUrls).toEqual(['photo.jpg'])
  })

  it('derives title from the first line before newline and trims its length', () => {
    const payload = buildRecordFunnelPayload({
      personIds: [1],
      occurredDate: '2026-07-08',
      categoryChipId: 10,
      categoryChips: chips.filter((c) => c.type === 'CATEGORY'),
      emotionChipIds: [],
      note: '오랜만에 커피 마시고 이야기 나눈 날\n두 번째 줄',
      occurredTime: '',
      photoUrls: [],
    })

    expect(payload.title).toBe('오랜만에 커피 마시고 이야기 나눈')
    expect(deriveRecordTitle('첫 줄\n둘째 줄')).toBe('첫 줄')
  })

  it('chooses the default chip before falling back to the first chip', () => {
    expect(getDefaultChipId(chips.filter((c) => c.type === 'CATEGORY'))).toBe(
      11,
    )
    expect(
      getDefaultChipId([
        chip(1, 'CATEGORY', '연락', false),
        chip(2, 'CATEGORY', '기타', false),
      ]),
    ).toBe(1)
    expect(getDefaultChipId([])).toBeNull()
  })

  it('toggles selected ids while respecting max count', () => {
    expect(toggleLimitedId([1, 2], 2, 5)).toEqual([1])
    expect(toggleLimitedId([1, 2], 3, 5)).toEqual([1, 2, 3])
    expect(toggleLimitedId([1, 2, 3, 4, 5], 6, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('resolves one primary person instead of exposing multi-select by default', () => {
    const people: PersonRef[] = [
      { id: 1, name: '민지' },
      { id: 2, name: '수진' },
    ]

    expect(
      resolvePrimaryRecordPerson({
        presetPersonId: 2,
        persons: people,
        eventPersons: [],
      }),
    ).toEqual({ id: 2, name: '수진' })
    expect(
      resolvePrimaryRecordPerson({
        presetPersonId: undefined,
        persons: people,
        eventPersons: [],
      }),
    ).toEqual({ id: 1, name: '민지' })
  })

  it('returns the next step without exposing progress UI state', () => {
    expect(getNextRecordFunnelStep('person')).toBe('emotion')
    expect(getNextRecordFunnelStep('letter')).toBe('detail')
    expect(getNextRecordFunnelStep('detail')).toBeNull()
  })

  it('converts emotion labels into Korean sentence stems', () => {
    expect(getEmotionSentenceStem('기쁨')).toBe('기뻤')
    expect(getEmotionSentenceStem('감사')).toBe('감사했')
    expect(getEmotionSentenceStem('편안')).toBe('편안했')
    expect(getEmotionSentenceStem('반가움')).toBe('반가웠')
    expect(getEmotionSentenceStem('행복')).toBe('행복했')
  })

  it('builds recent date options without using a native date input', () => {
    expect(getRecordDateOptions(new Date('2026-07-08T12:00:00+09:00'))).toEqual(
      [
        { value: '2026-07-04', label: '토', day: '04' },
        { value: '2026-07-05', label: '일', day: '05' },
        { value: '2026-07-06', label: '월', day: '06' },
        { value: '2026-07-07', label: '어제', day: '07' },
        { value: '2026-07-08', label: '오늘', day: '08' },
      ],
    )
  })
})

function chip(
  id: number,
  type: ChipResponse['type'],
  label: string,
  isDefault: boolean,
): ChipResponse {
  return {
    id,
    type,
    label,
    personal: false,
    order: id,
    default: isDefault,
  }
}
