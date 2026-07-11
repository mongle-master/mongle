import { useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Camera, Star } from 'lucide-react'
import {
  FormFieldCard,
  FormFieldSection,
} from '@/components/form/form-field-section'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { uploadImage } from '@/lib/api/images'
import type { PersonRequest } from '@/lib/api/types'
import { validatePersonForm } from '@/lib/person-validation'
import { cn } from '@/lib/utils'
import { ListField, RelationTypeField } from '@/components/person/person-fields'
import { DatePartPicker } from '@/components/person/first-met-date-picker'
import { coloredTagStyle, tagChipClass } from '@/components/ui/tag-chip'

export function ProfileHero({
  name,
  imageUrl,
  favorite,
  uploading,
  onPhotoClick,
  onFavoriteToggle,
}: {
  name: string
  imageUrl: string | null
  favorite: boolean
  uploading: boolean
  onPhotoClick: () => void
  onFavoriteToggle: () => void
}) {
  const hasPhoto = Boolean(imageUrl)

  return (
    <div className="rounded-lg border border-border bg-card p-3.5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={uploading}
          onClick={onPhotoClick}
          className="relative shrink-0"
          aria-label={hasPhoto ? '프로필 사진 변경' : '프로필 사진 추가'}
        >
          {hasPhoto || name.trim() ? (
            <MonogramAvatar
              name={name || '?'}
              imageUrl={imageUrl}
              className="size-14"
            />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 bg-muted/20 text-muted-foreground">
              <Camera className="size-5" />
            </div>
          )}
          <span className="absolute -right-0.5 -bottom-0.5 flex size-6 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm">
            {uploading ? (
              <span className="text-[10px] font-bold">…</span>
            ) : (
              <Camera className="size-3" />
            )}
          </span>
        </button>

        <button
          type="button"
          disabled={uploading}
          onClick={onPhotoClick}
          className="min-w-0 flex-1 text-left"
        >
          <p className="text-sm font-extrabold text-foreground">
            {hasPhoto ? '프로필 사진 변경' : '프로필 사진 추가'}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {uploading
              ? '사진을 올리는 중이에요'
              : '탭해서 앨범에서 고를 수 있어요'}
          </p>
        </button>

        <button
          type="button"
          onClick={onFavoriteToggle}
          aria-label={favorite ? '즐겨찾기 해제' : '즐겨찾기'}
          aria-pressed={favorite}
          className={cn(
            'flex shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 transition-colors',
            favorite
              ? 'bg-amber-500/12 text-amber-600 dark:text-amber-400'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted',
          )}
        >
          <Star
            className={cn('size-5', favorite && 'fill-current text-amber-500')}
          />
          <span className="text-[10px] font-extrabold">즐겨찾기</span>
        </button>
      </div>
    </div>
  )
}

export type PersonFormValues = {
  name: string
  profileImageUrl: string | null
  gender: 'FEMALE' | 'MALE' | ''
  relationType: string
  relationTagChipIds: number[]
  likes: string[]
  cautions: string[]
  favorite: boolean
  firstMetYear: string
  firstMetMonth: string
  firstMetDay: string
  lastMetDate: string
  birthMonth: string
  birthDay: string
  birthYear: string
}

function parseIsoDateParts(iso: string | null | undefined) {
  if (!iso) return { year: '', month: '', day: '' }
  const [year, month, day] = iso.split('-')
  return {
    year: year || '',
    month: month ? String(Number(month)) : '',
    day: day ? String(Number(day)) : '',
  }
}

function composeFirstMetDate(
  year: string,
  month: string,
  day: string,
): string | null {
  const y = year.trim()
  const m = month.trim()
  const d = day.trim()

  if (!y && !m && !d) return null
  if (!y) return ''

  const monthPart = m ? m.padStart(2, '0') : '01'
  const dayPart = d ? d.padStart(2, '0') : '01'
  return `${y.padStart(4, '0')}-${monthPart}-${dayPart}`
}

export function personToFormValues(
  person?: Partial<PersonRequest> & {
    name?: string
    relationTags?: Array<{ id: number }>
  },
): PersonFormValues {
  const firstMet = parseIsoDateParts(person?.firstMetDate)

  return {
    name: person?.name ?? '',
    profileImageUrl: person?.profileImageUrl ?? null,
    gender: person?.gender ?? '',
    relationType: person?.relationType ?? '',
    relationTagChipIds:
      person?.relationTagChipIds ??
      person?.relationTags?.map((t) => t.id) ??
      [],
    likes: person?.likes ?? [],
    cautions: person?.cautions ?? [],
    favorite: person?.favorite ?? false,
    firstMetYear: firstMet.year,
    firstMetMonth: firstMet.month,
    firstMetDay: firstMet.day,
    lastMetDate: person?.lastMetDate ?? '',
    birthMonth: person?.birthday?.month ? String(person.birthday.month) : '',
    birthDay: person?.birthday?.day ? String(person.birthday.day) : '',
    birthYear: person?.birthday?.year ? String(person.birthday.year) : '',
  }
}

export function formValuesToRequest(values: PersonFormValues): PersonRequest {
  const month = values.birthMonth ? Number(values.birthMonth) : undefined
  const day = values.birthDay ? Number(values.birthDay) : undefined
  const year = values.birthYear ? Number(values.birthYear) : undefined
  const birthday =
    month && day ? { month, day, ...(year ? { year } : {}) } : null

  const firstMetDate = composeFirstMetDate(
    values.firstMetYear,
    values.firstMetMonth,
    values.firstMetDay,
  )

  return {
    name: values.name.trim(),
    profileImageUrl: values.profileImageUrl,
    gender: values.gender || null,
    relationType: values.relationType.trim() || null,
    relationTagChipIds: values.relationTagChipIds,
    likes: values.likes,
    cautions: values.cautions,
    favorite: values.favorite,
    firstMetDate: firstMetDate === '' ? undefined : firstMetDate,
    lastMetDate: values.lastMetDate || null,
    birthday,
  }
}

export const GENDER_OPTIONS = [
  { value: '', label: '선택 안 함' },
  { value: 'FEMALE', label: '여성' },
  { value: 'MALE', label: '남성' },
] as const

export function PersonForm({
  initialValues,
  relationTags,
  submitLabel,
  pending,
  onSubmit,
  onDelete,
  showLastMetDate = true,
  requireFirstMetYear = false,
  formId = 'person-form',
  hideSubmitButton = false,
  greetingTitle = '새로운 인물을 남겨볼까요?',
  greetingSubtitle = '함께한 사람의 기본 정보를 남겨요',
}: {
  initialValues: PersonFormValues
  relationTags: Array<{ id: number; label: string; color?: string | null }>
  submitLabel: string
  pending?: boolean
  onSubmit: (request: PersonRequest) => void
  onDelete?: () => void
  showLastMetDate?: boolean
  requireFirstMetYear?: boolean
  formId?: string
  hideSubmitButton?: boolean
  greetingTitle?: ReactNode
  greetingSubtitle?: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [values, setValues] = useState(initialValues)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const patch = <TKey extends keyof PersonFormValues>(
    key: TKey,
    value: PersonFormValues[TKey],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  const toggleTag = (id: number) => {
    patch(
      'relationTagChipIds',
      values.relationTagChipIds.includes(id)
        ? values.relationTagChipIds.filter((t) => t !== id)
        : [...values.relationTagChipIds, id].slice(0, 10),
    )
  }

  const handlePhoto = async (file: File | null) => {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const { url } = await uploadImage(file)
      patch('profileImageUrl', url)
    } catch {
      setError('사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (requireFirstMetYear && !values.firstMetYear.trim()) {
      setError('처음 만난 날의 연도를 입력해 주세요.')
      return
    }

    const request = formValuesToRequest(values)

    if (request.firstMetDate === undefined) {
      setError('처음 만난 날의 연도를 입력해 주세요.')
      return
    }

    const validationError = validatePersonForm(request)
    if (validationError) {
      setError(validationError)
      return
    }
    onSubmit(request)
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => void handlePhoto(e.target.files?.[0] ?? null)}
      />

      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-foreground">
          {greetingTitle}
        </h2>
        {greetingSubtitle ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {greetingSubtitle}
          </p>
        ) : null}
        <div className="mt-4">
          <ProfileHero
            name={values.name}
            imageUrl={values.profileImageUrl}
            favorite={values.favorite}
            uploading={uploading}
            onPhotoClick={() => fileRef.current?.click()}
            onFavoriteToggle={() => patch('favorite', !values.favorite)}
          />
        </div>
      </div>

      {error ? (
        <p className="text-center text-xs text-destructive">{error}</p>
      ) : null}

      <FormFieldSection title="이름">
        <FormFieldCard className="py-2">
          <Input
            id="name"
            value={values.name}
            onChange={(e) => patch('name', e.target.value)}
            className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            placeholder="이름을 입력해 주세요"
            maxLength={20}
            autoFocus
          />
        </FormFieldCard>
      </FormFieldSection>

      <FormFieldSection title="성별">
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((option) => {
            const active = values.gender === option.value
            return (
              <button
                key={option.value || 'none'}
                type="button"
                aria-pressed={active}
                onClick={() => patch('gender', option.value)}
                className={tagChipClass(active, {
                  activeClassName:
                    'border-foreground bg-foreground text-background',
                  inactiveClassName:
                    'border-border bg-card text-foreground hover:bg-muted/40',
                })}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </FormFieldSection>

      <FormFieldSection title="생일">
        <DatePartPicker
          className="mt-0"
          year={values.birthYear}
          month={values.birthMonth}
          day={values.birthDay}
          onChange={({ year, month, day }) => {
            setValues((prev) => ({
              ...prev,
              birthYear: year,
              birthMonth: month,
              birthDay: day,
            }))
            setError(null)
          }}
        />
      </FormFieldSection>

      <FormFieldSection title="처음 만난 날">
        <DatePartPicker
          className="mt-0"
          year={values.firstMetYear}
          month={values.firstMetMonth}
          day={values.firstMetDay}
          yearRequired={requireFirstMetYear}
          onChange={({ year, month, day }) => {
            setValues((prev) => ({
              ...prev,
              firstMetYear: year,
              firstMetMonth: month,
              firstMetDay: day,
            }))
            setError(null)
          }}
        />
      </FormFieldSection>

      {showLastMetDate ? (
        <FormFieldSection title="마지막 만난 날짜">
          <FormFieldCard className="py-2">
            <Input
              id="lastMetDate"
              type="date"
              value={values.lastMetDate}
              onChange={(e) => patch('lastMetDate', e.target.value)}
              className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            />
          </FormFieldCard>
        </FormFieldSection>
      ) : null}

      <FormFieldSection title="만남 태그">
        <RelationTypeField
          value={values.relationType}
          onChange={(v) => patch('relationType', v)}
          hideLabel
        />
      </FormFieldSection>

      {relationTags.length > 0 ? (
        <FormFieldSection title="관계 태그">
          <div className="flex flex-wrap gap-2">
            {relationTags.map((tag) => {
              const active = values.relationTagChipIds.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={tagChipClass(active, {
                    activeClassName:
                      'border-foreground bg-foreground text-background',
                    inactiveClassName:
                      'border-border bg-card text-foreground hover:bg-muted/40',
                  })}
                  style={
                    tag.color ? coloredTagStyle(tag.color, active) : undefined
                  }
                >
                  {tag.label}
                </button>
              )
            })}
          </div>
        </FormFieldSection>
      ) : null}

      <FormFieldSection title="좋아하는 것">
        <ListField
          label=""
          items={values.likes}
          onChange={(likes) => patch('likes', likes)}
          tone="green"
          placeholder="좋아하는 것을 입력해 주세요"
        />
      </FormFieldSection>

      <FormFieldSection title="조심할 것">
        <ListField
          label=""
          items={values.cautions}
          onChange={(cautions) => patch('cautions', cautions)}
          tone="red"
          placeholder="조심할 것을 입력해 주세요"
        />
      </FormFieldSection>

      {hideSubmitButton ? null : (
        <Button type="submit" size="lg" disabled={pending || uploading}>
          {pending ? '저장 중…' : submitLabel}
        </Button>
      )}

      {onDelete ? (
        <Button type="button" variant="destructive" onClick={onDelete}>
          인물 삭제
        </Button>
      ) : null}
    </form>
  )
}
