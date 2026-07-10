import { useRef, useState } from 'react'
import type { ComponentProps, FormEvent, ReactNode } from 'react'
import { Star } from 'lucide-react'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { coloredTagStyle, tagChipClass } from '@/components/ui/tag-chip'
import { uploadImage } from '@/lib/api/images'
import type { PersonRequest } from '@/lib/api/types'
import { validatePersonForm } from '@/lib/person-validation'
import { cn } from '@/lib/utils'
import { ListField, RelationTypeField } from '@/components/person/person-fields'
import { DatePartPicker } from '@/components/person/first-met-date-picker'

function FieldLabel({
  className,
  children,
  ...props
}: ComponentProps<typeof Label>) {
  return (
    <Label className={cn('font-extrabold', className)} {...props}>
      {children}
    </Label>
  )
}

function FavoriteToggle({
  active,
  onClick,
}: {
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? '즐겨찾기 해제' : '즐겨찾기'}
      aria-pressed={active}
      className={cn(
        'absolute -top-1 -right-1 z-10 flex size-9 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-colors',
        active
          ? 'text-amber-500'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Star className={cn('size-5', active && 'fill-current')} />
    </button>
  )
}

function FormSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-5 border-t border-border pt-5">
      <h2 className="text-[15px] font-extrabold text-foreground">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
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

export function PersonForm({
  initialValues,
  relationTags,
  submitLabel,
  pending,
  onSubmit,
  onDelete,
  avatarPicker = 'button',
  showLastMetDate = true,
  requireFirstMetYear = false,
  formId = 'person-form',
  hideSubmitButton = false,
}: {
  initialValues: PersonFormValues
  relationTags: Array<{ id: number; label: string; color?: string | null }>
  submitLabel: string
  pending?: boolean
  onSubmit: (request: PersonRequest) => void
  onDelete?: () => void
  avatarPicker?: 'button' | 'circle'
  showLastMetDate?: boolean
  requireFirstMetYear?: boolean
  formId?: string
  hideSubmitButton?: boolean
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
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={(e) => void handlePhoto(e.target.files?.[0] ?? null)}
      />

      {avatarPicker === 'circle' ? (
        <div className="flex flex-col items-center">
          <div className="relative">
            <FavoriteToggle
              active={values.favorite}
              onClick={() => patch('favorite', !values.favorite)}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="relative"
              aria-label="프로필 사진 추가"
            >
              {values.profileImageUrl ? (
                <MonogramAvatar
                  name={values.name || '?'}
                  imageUrl={values.profileImageUrl}
                  className="size-24"
                />
              ) : (
                <div className="flex size-24 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground bg-muted/30 text-3xl font-normal text-muted-foreground">
                  {uploading ? '…' : '＋'}
                </div>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <FavoriteToggle
              active={values.favorite}
              onClick={() => patch('favorite', !values.favorite)}
            />
            <MonogramAvatar
              name={values.name || '?'}
              imageUrl={values.profileImageUrl}
              className="size-24"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? '업로드 중…' : '프로필 사진 선택'}
          </Button>
        </div>
      )}

      <FormSection title="기본 정보">
        <div>
          <FieldLabel htmlFor="name">이름</FieldLabel>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => patch('name', e.target.value)}
            className="mt-1.5"
            maxLength={20}
            autoFocus
          />
        </div>

        <div>
          <FieldLabel className="mb-2 block">성별</FieldLabel>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: '', label: '선택 안 함' },
              { value: 'FEMALE', label: '여성' },
              { value: 'MALE', label: '남성' },
            ].map((option) => {
              const active = values.gender === option.value
              return (
                <button
                  key={option.value || 'none'}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    patch('gender', option.value as PersonFormValues['gender'])
                  }
                  className={cn(
                    'h-9 rounded-lg border px-2 text-[13px] font-extrabold transition-colors',
                    active
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <FieldLabel>생일</FieldLabel>
          <DatePartPicker
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
        </div>

        <div>
          <FieldLabel>처음 만난 날</FieldLabel>
          <DatePartPicker
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
        </div>

        {showLastMetDate ? (
          <div>
            <FieldLabel htmlFor="lastMetDate">마지막 만난 날짜</FieldLabel>
            <Input
              id="lastMetDate"
              type="date"
              value={values.lastMetDate}
              onChange={(e) => patch('lastMetDate', e.target.value)}
              className="mt-1.5"
            />
          </div>
        ) : null}
      </FormSection>

      <FormSection title="추가 정보">
        <RelationTypeField
          value={values.relationType}
          onChange={(v) => patch('relationType', v)}
        />

        <div>
          <FieldLabel className="mb-2 block">관계 태그</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {relationTags.map((tag) => {
              const active = values.relationTagChipIds.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={tagChipClass(active)}
                  style={
                    tag.color ? coloredTagStyle(tag.color, active) : undefined
                  }
                >
                  {tag.label}
                </button>
              )
            })}
          </div>
        </div>
      </FormSection>

      <FormSection title="취향">
        <ListField
          label="좋아하는 것"
          items={values.likes}
          onChange={(likes) => patch('likes', likes)}
          tone="green"
        />

        <ListField
          label="조심할 것"
          items={values.cautions}
          onChange={(cautions) => patch('cautions', cautions)}
          tone="red"
        />
      </FormSection>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

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
