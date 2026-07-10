import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PersonSelectModal } from '@/components/record/person-select-modal'
import { OccurredDateTimeField } from '@/components/record/occurred-date-time-field'
import { AppShell } from '@/components/layout/app-shell'
import { FormPageHeader } from '@/components/layout/form-page-header'
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
import {
  formatPersonName,
  formatAutoEventTitle,
  todayLocalIso,
} from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import {
  formatOccurredTimeForApi,
  formatOccurredTimeForInput,
  validateRecordForm,
} from '@/lib/record-validation'
import { cn } from '@/lib/utils'
import {
  parseRecordReturnTo,
  parseRecordSearchId,
  parseEventDetailReturnTo,
  eventDetailSearch,
} from '@/lib/record-navigation'

export const Route = createFileRoute('/record')({
  validateSearch: (search: Record<string, unknown>) => ({
    personId: parseRecordSearchId(search.personId),
    eventId: parseRecordSearchId(search.eventId),
    returnTo: parseRecordReturnTo(search.returnTo),
    returnPersonId: parseRecordSearchId(search.returnPersonId),
    detailReturnTo: parseEventDetailReturnTo(search.detailReturnTo),
    detailReturnPersonId: parseRecordSearchId(search.detailReturnPersonId),
  }),
  component: RecordPage,
})

function RecordPage() {
  const {
    personId: presetPersonId,
    eventId: editingEventId,
    returnTo,
    returnPersonId,
    detailReturnTo,
    detailReturnPersonId,
  } = Route.useSearch()
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
  const [memo, setMemo] = useState('')
  const [occurredDate, setOccurredDate] = useState(() => todayLocalIso())
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
    // initialData면 staleTime 동안 폴백 이름(유진 등)이 고정돼 맵 API 이름과 어긋난다.
    placeholderData: FALLBACK_PERSONS,
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

  const persons = personsQuery.data ?? []
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
  const firstSelectedPersonName = primaryPerson
    ? formatPersonName(primaryPerson)
    : ''

  const effectiveCategoryChipId =
    categoryChipId ?? categoryChips.at(0)?.id ?? null

  const categoryLabel =
    categoryChips.find((c) => c.id === effectiveCategoryChipId)?.label ?? ''

  const titlePlaceholder = useMemo(() => {
    const personsForTitle =
      selectedPersons.length > 0
        ? selectedPersons
        : (eventQuery.data?.persons ?? [])

    const labelForTitle =
      categoryLabel ||
      eventQuery.data?.category?.label ||
      categoryChips.at(0)?.label ||
      ''

    return (
      formatAutoEventTitle(personsForTitle, labelForTitle) ??
      '제목을 입력해주세요'
    )
  }, [
    categoryChips,
    categoryLabel,
    eventQuery.data?.category?.label,
    eventQuery.data?.persons,
    selectedPersons,
  ])
  const greeting = useMemo(() => {
    if (isEditing) {
      return {
        title: '기록을 수정해요',
        subtitle: '바뀐 내용을 저장하면 타임라인에 반영돼요.',
      }
    }
    // if (selectedPersons.length === 0) {
    //   return {
    //     title: '오늘 누구와 함께였어요?',
    //     // subtitle: '함께한 사람을 먼저 선택해 주세요.',
    //   }
    // }
    // if (selectedPersons.length === 1) {
    //   return {
    //     title: (
    //       <>
    //         오늘
    //         <span className="underline underline-offset-4">
    //           {selectedPersons[0].name}
    //         </span>
    //         랑 어땠어요?
    //       </>
    //     ),
    //     subtitle: '세 줄이면 충분해요.',
    //   }
    // }
    return {
      title: '오늘의 몽글, 남겨볼까요?',
      // subtitle: `${selectedPersons[0].name} 외 ${selectedPersons.length - 1}명과 함께한 순간이에요.`,
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
    setMemo(event.memo ?? '')
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

  const navigateAfterSave = (fallbackPersonId?: number) => {
    if (returnTo === 'event-detail' && isEditing && editingEventId) {
      void navigate({
        to: '/events/$eventId',
        params: { eventId: String(editingEventId) },
        search: eventDetailSearch({
          returnTo: detailReturnTo,
          returnPersonId: detailReturnPersonId,
        }),
      })
      return
    }
    if (returnTo === 'timeline') {
      void navigate({ to: '/timeline' })
      return
    }
    if (returnTo === 'person-timeline' && returnPersonId) {
      void navigate({
        to: '/people/$personId/timeline',
        params: { personId: String(returnPersonId) },
      })
      return
    }
    if (returnTo === 'person-profile' && returnPersonId) {
      void navigate({
        to: '/people/$personId',
        params: { personId: String(returnPersonId) },
      })
      return
    }
    if (returnTo === 'home') {
      void navigate({ to: '/' })
      return
    }
    const personId = fallbackPersonId ?? presetPersonId
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
    memo: memo.trim() || null,
    occurredDate,
    occurredTime: formatOccurredTimeForApi(occurredTime),
    categoryChipId: effectiveCategoryChipId,
    weatherChipId: null,
    emotionChipIds: [],
    personIds: selectedPersonIds,
    photoUrls,
  })

  const handleSave = () => {
    const validationError = validateRecordForm({
      personIds: selectedPersonIds,
      title: title.trim(),
      memo: memo.trim(),
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

  const handlePhotoPick = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const remaining = 5 - photoUrls.length
    if (remaining <= 0) {
      setFormError('사진은 최대 5장까지 넣을 수 있어요.')
      return
    }

    const picked = Array.from(files).slice(0, remaining)
    if (files.length > remaining) {
      setFormError('사진은 최대 5장까지 넣을 수 있어요.')
    } else {
      setFormError(null)
    }

    setUploadingPhoto(true)
    try {
      const uploaded = await Promise.all(
        picked.map((file) => uploadImage(file).then((result) => result.url)),
      )
      setPhotoUrls((prev) => [...prev, ...uploaded].slice(0, 5))
    } catch {
      setFormError('사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const pageTitle = isEditing ? '몽글 수정' : '새 몽글'
  const isLoading = isEditing && eventQuery.isPending
  const recordBack =
    isEditing && returnTo === 'event-detail' && editingEventId
      ? {
          to: '/events/$eventId' as const,
          params: { eventId: String(editingEventId) },
          search: eventDetailSearch({
            returnTo: detailReturnTo,
            returnPersonId: detailReturnPersonId,
          }),
        }
      : returnTo === 'timeline'
        ? { to: '/timeline' as const }
        : returnTo === 'person-timeline' && returnPersonId
          ? {
              to: '/people/$personId/timeline' as const,
              params: { personId: String(returnPersonId) },
            }
          : returnTo === 'person-profile' && returnPersonId
            ? {
                to: '/people/$personId' as const,
                params: { personId: String(returnPersonId) },
              }
            : returnTo === 'home'
              ? { to: '/' as const }
              : presetPersonId
                ? {
                    to: '/people/$personId/timeline' as const,
                    params: { personId: String(presetPersonId) },
                  }
                : { to: '/timeline' as const }
  const recordHeader = (
    <FormPageHeader
      back={recordBack}
      title={pageTitle}
      onSave={handleSave}
      saving={saveMutation.isPending}
      disabled={selectedPersonIds.length === 0}
      className="px-5"
    />
  )
  const scrollBodyClass =
    'min-h-0 min-w-0 flex-1 overflow-y-auto pb-24 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]'
  const scrollBodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollBodyRef.current?.scrollTo({ top: 0 })
  }, [])

  if (isLoading) {
    return (
      <AppShell activePath="/record" layout="fixed" className="px-0">
        {recordHeader}
        <p className="px-5 py-20 text-center text-sm text-muted-foreground">
          불러오는 중…
        </p>
      </AppShell>
    )
  }

  if (!isEditing && persons.length === 0) {
    return (
      <AppShell activePath="/record" layout="fixed" className="px-0">
        {recordHeader}
        <div className="flex flex-col items-center px-5 py-20 text-center">
          <p className="text-sm text-muted-foreground">
            먼저 함께한 사람을 추가해 주세요.
          </p>
          <Link
            to="/people/new"
            className="mt-5 inline-flex items-center gap-1 rounded-full bg-primary/12 px-4 py-2.5 text-sm font-extrabold text-primary hover:bg-primary/18"
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
      <AppShell activePath="/record" layout="fixed" className="px-0">
        {recordHeader}
        <p className="px-5 py-20 text-center text-sm text-muted-foreground">
          기록을 찾을 수 없어요.
        </p>
      </AppShell>
    )
  }

  return (
    <AppShell activePath="/record" layout="fixed" className="px-0">
      {recordHeader}

      <div ref={scrollBodyRef} className={scrollBodyClass}>
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
                gender={'gender' in primaryPerson ? primaryPerson.gender : null}
                personId={primaryPerson.id}
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
            </div>

            <button
              type="button"
              onClick={() => openPersonModal(selectedPersons.length > 0)}
              className={cn(
                'flex min-h-[3.75rem] w-full items-center gap-2 rounded-lg border p-3 text-left',
                personSelectError
                  ? 'border-destructive/40 bg-destructive/10'
                  : 'border-border bg-card',
              )}
            >
              {selectedPersons.length > 0 ? (
                <>
                  <div className="flex -space-x-2">
                    {selectedPersons.slice(0, 3).map((person) => (
                      <MonogramAvatar
                        key={person.id}
                        name={person.name}
                        imageUrl={person.profileImageUrl}
                        gender={'gender' in person ? person.gender : null}
                        personId={person.id}
                        className="size-9 ring-2 ring-card"
                      />
                    ))}
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm font-extrabold">
                    {selectedPersons.length === 1
                      ? firstSelectedPersonName
                      : `${firstSelectedPersonName} 외 ${selectedPersons.length - 1}명`}
                  </p>
                </>
              ) : (
                <p
                  className={cn(
                    'min-w-0 flex-1 text-sm font-extrabold',
                    personSelectError
                      ? 'text-destructive'
                      : 'text-muted-foreground',
                  )}
                >
                  선택된 사람이 없습니다
                </p>
              )}
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          </section>

          <ChipSection title="만남 태그">
            <ToggleGroup
              type="single"
              value={
                effectiveCategoryChipId
                  ? String(effectiveCategoryChipId)
                  : undefined
              }
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
                placeholder={titlePlaceholder}
              />
              {categoryLabel ? (
                <Badge variant="secondary">{categoryLabel}</Badge>
              ) : null}
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-extrabold text-muted-foreground">
              메모
            </p>
            <Textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              maxLength={200}
              placeholder="오늘 함께한 이야기를 적어주세요 (최대 200자)"
              className="min-h-24 resize-none text-xs placeholder:text-xs md:text-xs"
            />
          </section>

          <section>
            <p className="mb-2 text-xs font-extrabold text-muted-foreground">
              언제
            </p>
            <OccurredDateTimeField
              date={occurredDate}
              time={occurredTime}
              onDateChange={setOccurredDate}
              onTimeChange={setOccurredTime}
            />
          </section>

          <section>
            <p className="mb-2 text-xs font-extrabold text-muted-foreground">
              사진 ({photoUrls.length}/5)
            </p>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              multiple
              className="hidden"
              onChange={(e) => {
                void handlePhotoPick(e.target.files)
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
