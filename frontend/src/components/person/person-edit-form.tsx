import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarDays, Heart, Link2, Trash2, UserRound } from 'lucide-react'
import { DatePartPicker } from '@/components/person/first-met-date-picker'
import { ListField, RelationTypeField } from '@/components/person/person-fields'
import {
  GENDER_OPTIONS,
  ProfileHero,
  formValuesToRequest,
} from '@/components/person/person-form'
import type { PersonFormValues } from '@/components/person/person-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { coloredTagStyle, tagChipClass } from '@/components/ui/tag-chip'
import { uploadImage } from '@/lib/api/images'
import type { PersonRequest } from '@/lib/api/types'
import { validatePersonForm } from '@/lib/person-validation'

export function PersonEditForm({
  initialValues,
  relationTags,
  pending = false,
  onSubmit,
  onDelete,
  formId = 'person-edit-form',
}: {
  initialValues: PersonFormValues
  relationTags: Array<{ id: number; label: string; color?: string | null }>
  pending?: boolean
  onSubmit: (request: PersonRequest) => void
  onDelete: () => void
  formId?: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [values, setValues] = useState(initialValues)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const patch = <TKey extends keyof PersonFormValues>(
    key: TKey,
    value: PersonFormValues[TKey],
  ) => {
    setValues((previous) => ({ ...previous, [key]: value }))
    setError(null)
  }

  const toggleTag = (id: number) => {
    patch(
      'relationTagChipIds',
      values.relationTagChipIds.includes(id)
        ? values.relationTagChipIds.filter((tagId) => tagId !== id)
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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
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
    <form
      id={formId}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 pb-6"
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => void handlePhoto(event.target.files?.[0] ?? null)}
      />

      <ProfileHero
        name={values.name}
        imageUrl={values.profileImageUrl}
        favorite={values.favorite}
        uploading={uploading}
        onPhotoClick={() => fileRef.current?.click()}
        onFavoriteToggle={() => patch('favorite', !values.favorite)}
      />

      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive"
        >
          {error}
        </p>
      ) : null}

      <section aria-labelledby="person-basic-heading">
        <div className="mb-3 flex items-start gap-3 px-1">
          <UserRound className="mt-0.5 size-5 text-muted-foreground" />
          <div>
            <h2 id="person-basic-heading" className="text-base font-extrabold">
              기본 정보
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              프로필에서 가장 먼저 보이는 정보예요.
            </p>
          </div>
        </div>
        <div className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <div className="p-4">
            <label htmlFor="name" className="text-xs font-extrabold">
              이름
            </label>
            <Input
              id="name"
              value={values.name}
              onChange={(event) => patch('name', event.target.value)}
              className="mt-2 h-11 bg-background px-3 text-base font-bold"
              placeholder="이름을 입력해 주세요"
              maxLength={20}
              enterKeyHint="done"
            />
          </div>
          <div className="p-4">
            <p className="mb-3 text-xs font-extrabold">성별</p>
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
                        'border-border bg-background text-foreground hover:bg-muted/40',
                    })}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs font-extrabold">생일</p>
            <DatePartPicker
              year={values.birthYear}
              month={values.birthMonth}
              day={values.birthDay}
              onChange={({ year, month, day }) => {
                setValues((previous) => ({
                  ...previous,
                  birthYear: year,
                  birthMonth: month,
                  birthDay: day,
                }))
                setError(null)
              }}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="person-relation-heading">
        <div className="mb-3 flex items-start gap-3 px-1">
          <Link2 className="mt-0.5 size-5 text-muted-foreground" />
          <div>
            <h2
              id="person-relation-heading"
              className="text-base font-extrabold"
            >
              관계
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              어떤 사이인지 빠르게 구분할 수 있어요.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div>
            <p className="mb-3 text-xs font-extrabold">한마디로</p>
            <RelationTypeField
              value={values.relationType}
              onChange={(value) => patch('relationType', value)}
              hideLabel
            />
          </div>
          {relationTags.length > 0 ? (
            <div className="border-t border-border/70 pt-4">
              <p className="mb-3 text-xs font-extrabold">관계 태그</p>
              <div className="flex flex-wrap gap-2">
                {relationTags.map((tag) => {
                  const active = values.relationTagChipIds.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleTag(tag.id)}
                      className={tagChipClass(active, {
                        activeClassName:
                          'border-foreground bg-foreground text-background',
                        inactiveClassName:
                          'border-border bg-background text-foreground hover:bg-muted/40',
                      })}
                      style={
                        tag.color
                          ? coloredTagStyle(tag.color, active)
                          : undefined
                      }
                    >
                      {tag.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="person-dates-heading">
        <div className="mb-3 flex items-start gap-3 px-1">
          <CalendarDays className="mt-0.5 size-5 text-muted-foreground" />
          <div>
            <h2 id="person-dates-heading" className="text-base font-extrabold">
              함께한 날짜
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              기억나지 않는 값은 비워 두어도 괜찮아요.
            </p>
          </div>
        </div>
        <div className="divide-y divide-border/70 overflow-visible rounded-2xl border border-border bg-card shadow-xs">
          <div className="p-4">
            <p className="text-xs font-extrabold">처음 만난 날</p>
            <DatePartPicker
              year={values.firstMetYear}
              month={values.firstMetMonth}
              day={values.firstMetDay}
              onChange={({ year, month, day }) => {
                setValues((previous) => ({
                  ...previous,
                  firstMetYear: year,
                  firstMetMonth: month,
                  firstMetDay: day,
                }))
                setError(null)
              }}
            />
          </div>
          <div className="p-4">
            <label htmlFor="lastMetDate" className="text-xs font-extrabold">
              마지막으로 만난 날
            </label>
            <Input
              id="lastMetDate"
              type="date"
              value={values.lastMetDate}
              onChange={(event) => patch('lastMetDate', event.target.value)}
              className="mt-2 h-11 bg-background px-3 text-sm"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="person-memory-heading">
        <div className="mb-3 flex items-start gap-3 px-1">
          <Heart className="mt-0.5 size-5 text-muted-foreground" />
          <div>
            <h2 id="person-memory-heading" className="text-base font-extrabold">
              기억 메모
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              다음 만남에 도움이 될 내용을 짧게 남겨요.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 shadow-xs">
          <ListField
            label="좋아하는 것"
            items={values.likes}
            onChange={(likes) => patch('likes', likes)}
            tone="green"
            compact
            placeholder="예: 산책, 라떼"
          />
          <div className="border-t border-border/70 pt-4">
            <ListField
              label="조심할 것"
              items={values.cautions}
              onChange={(cautions) => patch('cautions', cautions)}
              tone="red"
              compact
              placeholder="예: 매운 음식"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-start gap-3">
          <Trash2 className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-extrabold">이 인물 삭제</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              함께 새긴 기록까지 모두 사라지며 되돌릴 수 없어요.
            </p>
            <Button
              type="button"
              variant="destructive"
              className="mt-3 h-10 w-full"
              disabled={pending}
              onClick={onDelete}
            >
              인물 삭제
            </Button>
          </div>
        </div>
      </section>
    </form>
  )
}
