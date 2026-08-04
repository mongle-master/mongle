import { describe, expect, it } from 'vitest'
import type { PersonNode } from '@/apis/generated/mongle-api.schemas'
import { personMatchesTags, sortHomeListPersons } from './relation-list'

function person(
  id: number,
  name: string,
  options: Partial<PersonNode> = {},
): PersonNode {
  return {
    id,
    name,
    profileImageUrl: null,
    avatarGender: null,
    favorite: false,
    recordCount: 1,
    relationTags: [],
    intimacy: { status: 'NORMAL', daysSinceLastMeet: null },
    firstMetDate: null,
    ...options,
  }
}

describe('personMatchesTags', () => {
  const tagged = person(1, '가', {
    relationTags: [{ id: 10, label: '친구', color: '#F97316' }],
  })

  it('미선택이면 전체 매칭, 선택 태그 하나라도 가지면 매칭(OR)', () => {
    expect(personMatchesTags(tagged, [])).toBe(true)
    expect(personMatchesTags(tagged, [10, 20])).toBe(true)
    expect(personMatchesTags(tagged, [20])).toBe(false)
  })
})

describe('sortHomeListPersons', () => {
  it('즐겨찾기 상단 → 최근 만난 순 → 이름 가나다 순으로 정렬한다', () => {
    const sorted = sortHomeListPersons([
      person(1, '다온', {
        intimacy: { status: 'NORMAL', daysSinceLastMeet: 30 },
      }),
      person(2, '나리', {
        favorite: true,
        intimacy: { status: 'NORMAL', daysSinceLastMeet: 50 },
      }),
      person(3, '가온', {
        favorite: true,
        intimacy: { status: 'NORMAL', daysSinceLastMeet: 5 },
      }),
      person(4, '라온', {
        intimacy: { status: 'NORMAL', daysSinceLastMeet: 30 },
      }),
      person(5, '만남 없음'),
    ])

    expect(sorted.map((p) => p.name)).toEqual([
      '가온',
      '나리',
      '다온',
      '라온',
      '만남 없음',
    ])
  })

  it('만남 이력이 같은 사람이면 이름순이고, 입력은 변형하지 않는다', () => {
    const input = [person(1, '하늘'), person(2, '가람')]
    const sorted = sortHomeListPersons(input)
    expect(sorted.map((p) => p.name)).toEqual(['가람', '하늘'])
    expect(input[0].name).toBe('하늘')
  })
})
