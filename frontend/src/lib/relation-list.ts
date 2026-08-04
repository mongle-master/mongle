import type { PersonNode } from '@/apis/generated/mongle-api.schemas'

/** 태그 필터 매칭(OR·합집합). 미선택은 전체 매칭. */
export function personMatchesTags(
  person: Pick<PersonNode, 'relationTags'>,
  selectedTagIds: number[],
) {
  if (selectedTagIds.length === 0) return true
  return person.relationTags.some((tag) => selectedTagIds.includes(tag.id))
}

/**
 * 홈 리스트뷰 고정 정렬(PRD §4): 즐겨찾기 상단 → 최근 만난 순 → 이름 가나다.
 * 만남 이력이 없는 사람은 최근 만난 순 맨 아래로, 그 사이에선 이름순.
 */
export function sortHomeListPersons(persons: PersonNode[]) {
  return [...persons].sort((a, b) => {
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1
    const aDays = a.intimacy.daysSinceLastMeet
    const bDays = b.intimacy.daysSinceLastMeet
    if ((aDays == null) !== (bDays == null)) {
      return aDays == null ? 1 : -1
    }
    if (aDays != null && bDays != null && aDays !== bDays) {
      return aDays - bDays
    }
    return a.name.localeCompare(b.name, 'ko')
  })
}
