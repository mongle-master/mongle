import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PersonSelectModal } from '@/components/record/person-select-modal'
import { AppShell } from '@/components/layout/app-shell'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { tagChipBaseClass } from '@/components/ui/tag-chip'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { fetchChips } from '@/lib/api/chips'
import { createEvent, fetchEvent, updateEvent } from '@/lib/api/events'
import { uploadImage } from '@/lib/api/images'
import { fetchPersons } from '@/lib/api/persons'
import type { EventRequest, PersonResponse } from '@/lib/api/types'
import { mediaUrl } from '@/lib/api/client'
import { safeApi } from '@/lib/api/safe'
import {
  FALLBACK_CHIPS,
  FALLBACK_PERSONS,
  fallbackEvent,
} from '@/lib/fallback-data'
import { queryKeys } from '@/lib/query-keys'
import {
  formatOccurredTimeForApi,
  formatOccurredTimeForInput,
  validateRecordForm,
} from '@/lib/record-validation'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/record')({
  validateSearch: (search: Record<string, unknown>) => ({
    personId:
      typeof search.personId === 'number'
        ? search.personId
        : typeof search.personId === 'string'
          ? Number(search.personId) || undefined
          : undefined,
    eventId:
      typeof search.eventId === 'number'
        ? search.eventId
        : typeof search.eventId === 'string'
          ? Number(search.eventId) || undefined
          : undefined,
  }),
  component: RecordPage,
})

function RecordPage() {
  const { personId: presetPersonId, eventId: editingEventId } =
    Route.useSearch()
  const isEditing = Number.isFinite(editingEventId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const hydratedEventId = useRef<number | null>(null)

  const [selectedPersonIds, setSelectedPersonIds] = useState<number[]>(() =>
    presetPersonId ? [presetPersonId] : [],
  )
  const [personModalOpen, setPersonModalOpen] = useState(false)
  const [personModalDismissible, setPersonModalDismissible] = useState(true)
  const [personSelectError, setPersonSelectError] = useState(false)
  const [categoryChipId, setCategoryChipId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [why, setWhy] = useState('')
  const [what, setWhat] = useState('')
  const [occurredDate, setOccurredDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  )
  const [occurredTime, setOccurredTime] = useState('')
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [savedLocally, setSavedLocally] = useState(false)

  const chipsQuery = useQuery({
    queryKey: queryKeys.chips,
    queryFn: () => safeApi(fetchChips, FALLBACK_CHIPS),
    initialData: FALLBACK_CHIPS,
  })
  const personsQuery = useQuery({
    queryKey: queryKeys.persons(),
    queryFn: (): Promise<PersonResponse[]> =>
      safeApi(() => fetchPersons(), FALLBACK_PERSONS),
    initialData: FALLBACK_PERSONS,
  })
  const eventQuery = useQuery({
    queryKey: queryKeys.event(editingEventId ?? 0),
    queryFn: () =>
      safeApi(
        () => fetchEvent(editingEventId!),
        fallbackEvent(editingEventId!) ?? undefined,
      ),
    enabled: isEditing,
  })

  const persons = personsQuery.data
  const chips = chipsQuery.data

  const categoryChips = useMemo(
    () => chips.filter((c) => c.type === 'CATEGORY'),
    [chips],
  )

  const selectedPersons = useMemo(() => {
    return selectedPersonIds.map((id) => {
      const fromDirectory = persons.find((p) => p.id === id)
      if (fromDirectory) return fromDirectory
      const fromEvent = eventQuery.data?.persons.find((p) => p.id === id)
      if (fromEvent) return { ...fromEvent, profileImageUrl: null }
      return {
        id,
        name: `#${id}`,
        profileImageUrl: null,
      } satisfies Pick<PersonResponse, 'id' | 'name' | 'profileImageUrl'>
    })
  }, [eventQuery.data?.persons, persons, selectedPersonIds])

  const primaryPerson = selectedPersons.at(0)

  const categoryLabel =
    categoryChips.find((c) => c.id === categoryChipId)?.label ??
    categoryChips.at(0)?.label ??
    ''

  const greeting = useMemo(() => {
    if (isEditing) {
      return {
        title: '기록을 수정해요',
        subtitle: '바뀐 내용을 저장하면 타임라인에 반영돼요.',
      }
    }
    if (selectedPersons.length === 0) {
      return {
        title: '오늘 누구와 함께였어요?',
        subtitle: '함께한 사람을 먼저 선택해 주세요.',
      }
    }
    if (selectedPersons.length === 1) {
      return {
        title: (
          <>
            오늘{' '}
            <span className="underline underline-offset-4">
              {selectedPersons[0].name}
            </span>
            랑 어땠어요?
          </>
        ),
        subtitle: '세 줄이면 충분해요.',
      }
    }
    return {
      title: '오늘 어땠어요?',
      subtitle: `${selectedPersons[0].name} 외 ${selectedPersons.length - 1}명과 함께한 순간이에요.`,
    }
  }, [isEditing, selectedPersons])

  const autoOpenedPersonModal = useRef(false)

  useEffect(() => {
    if (isEditing) return
    if (autoOpenedPersonModal.current) return
    if (presetPersonId || selectedPersonIds.length > 0) return
    if (persons.length === 0) return
    autoOpenedPersonModal.current = true
    setPersonModalDismissible(false)
    setPersonModalOpen(true)
  }, [isEditing, persons.length, presetPersonId, selectedPersonIds.length])

  useEffect(() => {
    if (!isEditing || !eventQuery.data) return
    if (hydratedEventId.current === editingEventId) return
    const event = eventQuery.data
    hydratedEventId.current = editingEventId ?? null
    setSelectedPersonIds(event.persons.map((p) => p.id))
    setTitle(event.title)
    setWhy(event.why ?? '')
    setWhat(event.what ?? '')
    setOccurredDate(event.occurredDate)
    setOccurredTime(formatOccurredTimeForInput(event.occurredTime))
    setCategoryChipId(event.category?.id ?? null)
    setPhotoUrls(event.photoUrls)
  }, [editingEventId, eventQuery.data, isEditing])

  const openPersonModal = (dismissible = true) => {
    setPersonModalDismissible(dismissible)
    setPersonModalOpen(true)
  }

  const invalidateAfterSave = async () => {
    await queryClient.invalidateQueries({ queryKey: ['home'] })
    await queryClient.invalidateQueries({ queryKey: ['persons'] })
    await queryClient.invalidateQueries({ queryKey: ['my-timeline'] })
    await queryClient.invalidateQueries({ queryKey: ['person-timeline'] })
    if (isEditing) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.event(editingEventId!),
      })
    }
  }

  const navigateAfterSave = (personId?: number) => {
    if (personId) {
      void navigate({
        to: '/people/$personId/timeline',
        params: { personId: String(personId) },
      })
      return
    }
    void navigate({ to: '/timeline' })
  }

  const saveMutation = useMutation({
    mutationFn: (body: EventRequest) =>
      isEditing ? updateEvent(editingEventId!, body) : createEvent(body),
    onSuccess: async (event) => {
      await invalidateAfterSave()
      navigateAfterSave(event.persons[0]?.id)
    },
    onError: () => {
      setSavedLocally(true)
      navigateAfterSave(selectedPersonIds[0])
    },
  })

  const buildPayload = (): EventRequest => ({
    title: title.trim() || null,
    why: why.trim() || null,
    what: what.trim() || null,
    occurredDate,
    occurredTime: formatOccurredTimeForApi(occurredTime),
    categoryChipId: categoryChipId ?? categoryChips.at(0)?.id ?? null,
    weatherChipId: null,
    emotionChipIds: [],
    personIds: selectedPersonIds,
    photoUrls,
  })

  const handleSave = () => {
    const validationError = validateRecordForm({
      personIds: selectedPersonIds,
      title: title.trim(),
      why: why.trim(),
      what: what.trim(),
      photoUrls,
      occurredDate,
    })
    if (validationError) {
      if (validationError.includes('함께한 사람')) {
        setPersonSelectError(true)
        openPersonModal(false)
      }
      setFormError(validationError)
      return
    }

    setSavedLocally(false)
    setPersonSelectError(false)
    setFormError(null)
    saveMutation.mutate(buildPayload())
  }

  const handlePhotoPick = async (file: File | null) => {
    if (!file) return
    if (photoUrls.length >= 5) {
      setFormError('사진은 최대 5장까지 넣을 수 있어요.')
      return
    }
    setUploadingPhoto(true)
    setFormError(null)
    try {
      const { url } = await uploadImage(file)
      setPhotoUrls((prev) => [...prev, url])
    } catch {
      setFormError('사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const pageTitle = isEditing ? '기록 수정' : '새 기록'
  const isLoading = isEditing && eventQuery.isPending

  if (isLoading) {
    return (
      <AppShell activePath="/record" className="px-0">
        <RecordHeader title={pageTitle} onSave={handleSave} saving={false} />
        <p className="px-5 py-20 text-center text-sm text-muted-foreground">
          불러오는 중…
        </p>
      </AppShell>
    )
  }

  if (!isEditing && persons.length === 0) {
    return (
      <AppShell activePath="/record" className="px-0">
        <RecordHeader title={pageTitle} onSave={handleSave} saving={false} />
        <div className="flex flex-col items-center px-5 py-20 text-center">
          <p className="text-sm text-muted-foreground">
            먼저 함께한 사람을 추가해 주세요.
          </p>
          <Link
            to="/people/new"
            className="mt-5 inline-flex items-center gap-1 rounded-full border border-foreground bg-card px-4 py-2.5 text-sm font-extrabold"
          >
            <Plus className="size-4" />
            사람 추가
          </Link>
        </div>
      </AppShell>
    )
  }

  if (isEditing && !eventQuery.data) {
    return (
      <AppShell activePath="/record" className="px-0">
        <RecordHeader title={pageTitle} onSave={handleSave} saving={false} />
        <p className="px-5 py-20 text-center text-sm text-muted-foreground">
          기록을 찾을 수 없어요.
        </p>
      </AppShell>
    )
  }

  return (
    <AppShell activePath="/record" className="px-0">
      <RecordHeader
        title={pageTitle}
        onSave={handleSave}
        saving={saveMutation.isPending}
      />

      <div className="flex flex-col gap-5 px-5 pb-8">
        <button
          type="button"
          onClick={() => openPersonModal()}
          className="text-left"
        >
          {primaryPerson ? (
            <MonogramAvatar
              name={primaryPerson.name}
              imageUrl={primaryPerson.profileImageUrl}
              className="size-9"
            />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-full border border-dashed border-muted-foreground text-muted-foreground">
              ?
            </div>
          )}
          <h2 className="mt-2 text-xl font-extrabold">{greeting.title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {greeting.subtitle}
          </p>
        </button>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-extrabold text-muted-foreground">
              함께한 사람
            </p>
            <button
              type="button"
              onClick={() => openPersonModal()}
              className="text-xs font-extrabold text-primary"
            >
              {selectedPersonIds.length > 0 ? '변경' : '선택'}
            </button>
          </div>
          {selectedPersons.length > 0 ? (
            <button
              type="button"
              onClick={() => openPersonModal()}
              className="flex w-full items-center gap-2 rounded-lg border border-border bg-card p-3 text-left"
            >
              <div className="flex -space-x-2">
                {selectedPersons.slice(0, 3).map((person) => (
                  <MonogramAvatar
                    key={person.id}
                    name={person.name}
                    imageUrl={person.profileImageUrl}
                    className="size-9 ring-2 ring-card"
                  />
                ))}
              </div>
              <p className="min-w-0 flex-1 truncate text-sm font-extrabold">
                {selectedPersons.length === 1
                  ? selectedPersons[0].name
                  : `${selectedPersons[0].name} 외 ${selectedPersons.length - 1}명`}
              </p>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openPersonModal(false)}
              className={cn(
                'flex w-full items-center justify-center rounded-lg border border-dashed px-4 py-6 text-sm font-extrabold',
                personSelectError
                  ? 'border-destructive text-destructive'
                  : 'border-muted-foreground text-muted-foreground',
              )}
            >
              사람을 선택해 주세요
            </button>
          )}
        </section>

        <ChipSection title="만남 태그">
          <ToggleGroup
            type="single"
            value={categoryChipId ? String(categoryChipId) : undefined}
            onValueChange={(v) => setCategoryChipId(v ? Number(v) : null)}
            className="flex flex-wrap justify-start gap-2"
          >
            {categoryChips.map((chip) => (
              <ToggleGroupItem
                key={chip.id}
                value={String(chip.id)}
                className={cn(
                  tagChipBaseClass,
                  'border-border bg-card data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
                )}
              >
                {chip.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </ChipSection>

        <section>
          <p className="mb-2 text-xs font-extrabold text-muted-foreground">
            제목
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={40}
              className="border-0 bg-transparent text-xs shadow-none placeholder:text-xs focus-visible:ring-0 md:text-xs"
              placeholder="제목을 입력해주세요"
            />
            {categoryLabel ? (
              <Badge variant="secondary">{categoryLabel}</Badge>
            ) : null}
          </div>
        </section>

        <section>
          <p className="mb-2 text-xs font-extrabold text-muted-foreground">
            왜
          </p>
          <Textarea
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            maxLength={100}
            placeholder="왜 만났는지"
            className="min-h-16 resize-none text-xs placeholder:text-xs md:text-xs"
          />
        </section>

        <section>
          <p className="mb-2 text-xs font-extrabold text-muted-foreground">
            무엇을
          </p>
          <Textarea
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            maxLength={100}
            placeholder="무엇을 했는지"
            className="min-h-16 resize-none text-xs placeholder:text-xs md:text-xs"
          />
        </section>

        <section>
          <p className="mb-2 text-xs font-extrabold text-muted-foreground">
            언제
          </p>
          <div className="flex gap-2">
            <Input
              type="date"
              value={occurredDate}
              onChange={(e) => setOccurredDate(e.target.value)}
              className="flex-1 text-xs placeholder:text-xs md:text-xs"
            />
            <Input
              type="time"
              value={occurredTime}
              onChange={(e) => setOccurredTime(e.target.value)}
              className="w-[8.5rem] text-xs placeholder:text-xs md:text-xs"
            />
          </div>
        </section>

        <section>
          <p className="mb-2 text-xs font-extrabold text-muted-foreground">
            사진
          </p>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            className="hidden"
            onChange={(e) => {
              void handlePhotoPick(e.target.files?.[0] ?? null)
              e.target.value = ''
            }}
          />
          <div className="flex flex-wrap gap-2">
            {photoUrls.map((url) => {
              const src = mediaUrl(url)
              return (
                <div key={url} className="relative size-16">
                  {src ? (
                    <img
                      src={src}
                      alt=""
                      className="size-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-[10px] font-bold text-muted-foreground">
                      PHOTO
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setPhotoUrls((prev) => prev.filter((u) => u !== url))
                    }
                    className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-background"
                    aria-label="사진 삭제"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              )
            })}
            {photoUrls.length < 5 ? (
              <Button
                variant="outline"
                className="size-16 rounded-lg border-dashed text-2xl"
                type="button"
                disabled={uploadingPhoto}
                onClick={() => photoInputRef.current?.click()}
              >
                {uploadingPhoto ? '…' : '＋'}
              </Button>
            ) : null}
          </div>
        </section>

        {formError ? (
          <p className="text-center text-xs text-destructive">{formError}</p>
        ) : null}

        {savedLocally ? (
          <p className="text-center text-xs text-muted-foreground">
            서버에 저장하지 못했지만 기록 화면은 열어둘게요.
          </p>
        ) : null}
      </div>

      <PersonSelectModal
        open={personModalOpen}
        onOpenChange={setPersonModalOpen}
        persons={persons}
        selectedIds={selectedPersonIds}
        dismissible={personModalDismissible}
        onConfirm={(ids) => {
          setSelectedPersonIds(ids)
          setPersonSelectError(false)
          setFormError(null)
          setPersonModalDismissible(true)
        }}
      />
    </AppShell>
  )
}

function RecordHeader({
  title,
  onSave,
  saving,
}: {
  title: string
  onSave: () => void
  saving: boolean
}) {
  return (
    <header className="grid grid-cols-3 items-center px-5 py-1">
      <Link to="/" className="text-lg font-extrabold text-muted-foreground">
        ‹
      </Link>
      <h1 className="text-center text-base font-extrabold">{title}</h1>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="text-right text-[15px] font-extrabold disabled:opacity-50"
      >
        {saving ? '저장 중' : '저장'}
      </button>
    </header>
  )
}

function ChipSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <p className="mb-2 text-xs font-extrabold text-muted-foreground">
        {title}
      </p>
      {children}
    </section>
  )
}
