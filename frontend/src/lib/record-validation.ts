const TITLE_MAX = 40
const TEXT_MAX = 120
const PHOTO_MAX = 5

export function validateRecordForm(data: {
  personIds: number[]
  title: string
  memo: string
  photoUrls: string[]
  occurredDate: string
}) {
  if (data.personIds.length === 0) {
    return '함께한 사람을 한 명 이상 선택해 주세요.'
  }
  if (data.title.length > TITLE_MAX) {
    return `최대 ${TITLE_MAX}자까지 쓸 수 있어요.`
  }
  if (data.memo.length > TEXT_MAX) {
    return `최대 ${TEXT_MAX}자까지 쓸 수 있어요.`
  }
  if (data.photoUrls.length > PHOTO_MAX) {
    return `사진은 최대 ${PHOTO_MAX}장까지 넣을 수 있어요.`
  }
  const today = new Date().toISOString().slice(0, 10)
  if (data.occurredDate > today) {
    return '오늘 이후 날짜는 선택할 수 없어요.'
  }
  return null
}

export function formatOccurredTimeForApi(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.length === 5 ? `${trimmed}:00` : trimmed
}

export function formatOccurredTimeForInput(value: string | null | undefined) {
  if (!value) return ''
  return value.slice(0, 5)
}
