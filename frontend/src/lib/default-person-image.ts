export const DEFAULT_FEMALE_PERSON_IMAGES = [
  '/default-people/person-female-1.png',
  '/default-people/person-female-2.png',
  '/default-people/person-female-3.png',
] as const

export const DEFAULT_MALE_PERSON_IMAGES = [
  '/default-people/person-male-1.png',
  '/default-people/person-male-2.png',
  '/default-people/person-male-3.png',
] as const

export const DEFAULT_PERSON_IMAGES = [
  ...DEFAULT_FEMALE_PERSON_IMAGES,
  ...DEFAULT_MALE_PERSON_IMAGES,
] as const

const DEFAULT_PERSON_GENDER_BY_NAME = new Map<string, 'FEMALE' | 'MALE'>([
  ['유진', 'FEMALE'],
  ['소연', 'FEMALE'],
  ['하은', 'FEMALE'],
  ['재윤', 'MALE'],
  ['지훈', 'MALE'],
  ['민수', 'MALE'],
])

export type PersonImageGender = 'FEMALE' | 'MALE' | null

export function defaultPersonImageUrl({
  id,
  name,
  gender,
}: {
  id?: string | number | null
  name: string
  gender?: PersonImageGender
}) {
  const resolvedGender =
    gender ?? DEFAULT_PERSON_GENDER_BY_NAME.get(name.trim()) ?? null
  const images =
    resolvedGender === 'FEMALE'
      ? DEFAULT_FEMALE_PERSON_IMAGES
      : resolvedGender === 'MALE'
        ? DEFAULT_MALE_PERSON_IMAGES
        : DEFAULT_PERSON_IMAGES
  const hash = stableStringHash(`${id ?? 0}:${name}`)
  return images[Math.abs(hash) % images.length]
}

function stableStringHash(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0
  }
  return hash
}
