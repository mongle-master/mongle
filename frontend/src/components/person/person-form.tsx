import { useRef, useState } from 'react'
import { Star } from 'lucide-react'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { uploadImage } from '@/lib/api/images'
import type { PersonRequest } from '@/lib/api/types'
import { validatePersonForm } from '@/lib/person-validation'
import { cn } from '@/lib/utils'
import { ListField, RelationTypeField } from '@/components/person/person-fields'

export type PersonFormValues = {
  name: string
  profileImageUrl: string | null
  relationType: string
  relationTagChipIds: number[]
  likes: string[]
  cautions: string[]
  favorite: boolean
  firstMetDate: string
  lastMetDate: string
  birthMonth: string
  birthDay: string
  birthYear: string
}

export function personToFormValues(
  person?: Partial<PersonRequest> & {
    name?: string
    relationTags?: Array<{ id: number }>
  },
): PersonFormValues {
  return {
    name: person?.name ?? '',
    profileImageUrl: person?.profileImageUrl ?? null,
    relationType: person?.relationType ?? '',
    relationTagChipIds:
      person?.relationTagChipIds ??
      person?.relationTags?.map((t) => t.id) ??
      [],
    likes: person?.likes ?? [],
    cautions: person?.cautions ?? [],
    favorite: person?.favorite ?? false,
    firstMetDate: person?.firstMetDate ?? '',
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

  return {
    name: values.name.trim(),
    profileImageUrl: values.profileImageUrl,
    relationType: values.relationType.trim() || null,
    relationTagChipIds: values.relationTagChipIds,
    likes: values.likes,
    cautions: values.cautions,
    favorite: values.favorite,
    firstMetDate: values.firstMetDate || null,
    lastMetDate: values.lastMetDate || null,
    birthday,
  }
}

export function PersonForm({
  initialValues,
  relationTags,
  onCreateRelationTag,
  submitLabel,
  pending,
  onSubmit,
  onDelete,
  avatarPicker = 'button',
  showLastMetDate = true,
}: {
  initialValues: PersonFormValues
  relationTags: Array<{ id: number; label: string }>
  onCreateRelationTag?: (label: string) => Promise<number | null>
  submitLabel: string
  pending?: boolean
  onSubmit: (request: PersonRequest) => void
  onDelete?: () => void
  avatarPicker?: 'button' | 'circle'
  showLastMetDate?: boolean
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [values, setValues] = useState(initialValues)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [newTagLabel, setNewTagLabel] = useState('')

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

  const handleAddTag = async () => {
    const label = newTagLabel.trim()
    if (!label || !onCreateRelationTag) return
    const id = await onCreateRelationTag(label)
    if (id) {
      patch(
        'relationTagChipIds',
        [...values.relationTagChipIds, id].slice(0, 10),
      )
      setNewTagLabel('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const request = formValuesToRequest(values)
    const validationError = validatePersonForm(request)
    if (validationError) {
      setError(validationError)
      return
    }
    onSubmit(request)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={(e) => void handlePhoto(e.target.files?.[0] ?? null)}
      />

      {avatarPicker === 'circle' ? (
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => patch('favorite', !values.favorite)}
            className="mb-2"
            aria-label="즐겨찾기"
          >
            <Star
              className={cn(
                'size-6',
                values.favorite
                  ? 'fill-foreground text-foreground'
                  : 'text-muted-foreground',
              )}
            />
          </button>
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
      ) : (
        <div className="flex flex-col items-center gap-3">
          <MonogramAvatar
            name={values.name || '?'}
            imageUrl={values.profileImageUrl}
            className="size-24"
          />
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

      <div>
        <Label htmlFor="name">이름</Label>
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
        <Label>생일 (선택)</Label>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          <Input
            type="number"
            min={1}
            max={12}
            placeholder="월"
            value={values.birthMonth}
            onChange={(e) => patch('birthMonth', e.target.value)}
          />
          <Input
            type="number"
            min={1}
            max={31}
            placeholder="일"
            value={values.birthDay}
            onChange={(e) => patch('birthDay', e.target.value)}
          />
          <Input
            type="number"
            min={1900}
            max={2100}
            placeholder="연도(선택)"
            value={values.birthYear}
            onChange={(e) => patch('birthYear', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="firstMetDate">처음 만난 날 (선택)</Label>
        <Input
          id="firstMetDate"
          type="date"
          value={values.firstMetDate}
          onChange={(e) => patch('firstMetDate', e.target.value)}
          className="mt-1.5"
        />
      </div>

      {showLastMetDate ? (
        <div>
          <Label htmlFor="lastMetDate">마지막 만난 날짜 (선택)</Label>
          <Input
            id="lastMetDate"
            type="date"
            value={values.lastMetDate}
            onChange={(e) => patch('lastMetDate', e.target.value)}
            className="mt-1.5"
          />
        </div>
      ) : null}

      <RelationTypeField
        value={values.relationType}
        onChange={(v) => patch('relationType', v)}
      />

      <div>
        <Label className="mb-2 block">관계 태그</Label>
        <div className="flex flex-wrap gap-2">
          {relationTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-bold',
                values.relationTagChipIds.includes(tag.id)
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-card',
              )}
            >
              {tag.label}
            </button>
          ))}
        </div>
        {onCreateRelationTag ? (
          <div className="mt-2 flex gap-2">
            <Input
              value={newTagLabel}
              onChange={(e) => setNewTagLabel(e.target.value)}
              placeholder="새 태그 (10자 이내)"
              maxLength={10}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleAddTag()}
            >
              ＋
            </Button>
          </div>
        ) : null}
      </div>

      <ListField
        label="좋아하는 것"
        items={values.likes}
        onChange={(likes) => patch('likes', likes)}
        placeholder="예: 카페 투어"
      />

      <ListField
        label="조심할 것"
        items={values.cautions}
        onChange={(cautions) => patch('cautions', cautions)}
        placeholder="예: 매운 음식"
      />

      {avatarPicker === 'button' ? (
        <button
          type="button"
          onClick={() => patch('favorite', !values.favorite)}
          className="flex items-center gap-2 text-sm font-bold"
        >
          <Star
            className={cn(
              'size-5',
              values.favorite
                ? 'fill-foreground text-foreground'
                : 'text-muted-foreground',
            )}
          />
          즐겨찾기 {values.favorite ? '켜짐' : '꺼짐'}
        </button>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" size="lg" disabled={pending || uploading}>
        {pending ? '저장 중…' : submitLabel}
      </Button>

      {onDelete ? (
        <Button type="button" variant="destructive" onClick={onDelete}>
          인물 삭제
        </Button>
      ) : null}
    </form>
  )
}
