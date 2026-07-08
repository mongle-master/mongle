import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFunnel } from '@use-funnel/browser'
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Plus,
  Save,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
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
  EMOTION_MAX,
  NOTE_MAX,
  buildRecordFunnelPayload,
  getRecordDateOptions,
  getDefaultChipId,
  getEmotionSentenceStem,
  getNextRecordFunnelStep,
  resolvePrimaryRecordPerson,
  toggleLimitedId,
} from '@/lib/record-funnel'
import {
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

type RecordFunnelContextMap = {
  person: Record<string, never>
  emotion: Record<string, never>
  letter: Record<string, never>
  detail: Record<string, never>
}

function RecordPage() {
  const { personId: presetPersonId, eventId: editingEventId } =
    Route.useSearch()
  const isEditing = Number.isFinite(editingEventId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const hydratedEventId = useRef<number | null>(null)

  const [categoryChipId, setCategoryChipId] = useState<number | null>(null)
  const [selectedEmotionChipIds, setSelectedEmotionChipIds] = useState<
    number[]
  >([])
  const [note, setNote] = useState('')
  const [occurredDate, setOccurredDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  )
  const [occurredTime, setOccurredTime] = useState('')
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [savedLocally, setSavedLocally] = useState(false)

  const funnel = useFunnel<RecordFunnelContextMap>({
    id: `record-${editingEventId ?? presetPersonId ?? 'new'}`,
    initial: {
      step: isEditing ? 'detail' : 'person',
      context: {},
    },
  })

  const chipsQuery = useQuery({
    queryKey: queryKeys.chips,
    queryFn: () => safeApi(fetchChips, FALLBACK_CHIPS),
    initialData: FALLBACK_CHIPS,
  })
  const personsQuery = useQuery({
    queryKey: queryKeys.persons(),
    queryFn: (): Promise<PersonResponse[]> =>
      safeApi(() => fetchPersons(), FALLBACK_PERSONS),
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
  const emotionChips = useMemo(
    () => chips.filter((c) => c.type === 'EMOTION'),
    [chips],
  )

  const primaryPersonRef = useMemo(
    () =>
      resolvePrimaryRecordPerson({
        presetPersonId,
        persons,
        eventPersons: eventQuery.data?.persons ?? [],
      }),
    [eventQuery.data?.persons, persons, presetPersonId],
  )

  const primaryPerson = useMemo(() => {
    if (!primaryPersonRef) return null
    const fromDirectory = persons.find((p) => p.id === primaryPersonRef.id)
    if (fromDirectory) return fromDirectory

    return {
      id: primaryPersonRef.id,
      name: primaryPersonRef.name,
      birthday: null,
      firstMetDate: null,
      lastMetDate: null,
      profileImageUrl: null,
      relationType: null,
      relationTags: [],
      likes: [],
      cautions: [],
      favorite: false,
      gender: null,
      createdAt: null,
    } satisfies PersonResponse
  }, [persons, primaryPersonRef])

  const selectedPersonIds = primaryPerson ? [primaryPerson.id] : []
  const resolvedCategoryChipId =
    categoryChipId ?? getDefaultChipId(categoryChips)
  const currentStep = funnel.step
  const nextStep = getNextRecordFunnelStep(currentStep)

  useEffect(() => {
    if (categoryChipId !== null) return
    const defaultCategoryChipId = getDefaultChipId(categoryChips)
    if (defaultCategoryChipId !== null) setCategoryChipId(defaultCategoryChipId)
  }, [categoryChipId, categoryChips])

  useEffect(() => {
    if (!isEditing || !eventQuery.data) return
    if (hydratedEventId.current === editingEventId) return
    const event = eventQuery.data
    hydratedEventId.current = editingEventId ?? null
    setNote(event.memo ?? '')
    setOccurredDate(event.occurredDate)
    setOccurredTime(formatOccurredTimeForInput(event.occurredTime))
    setCategoryChipId(event.category?.id ?? null)
    setSelectedEmotionChipIds(event.emotions.map((emotion) => emotion.id))
    setPhotoUrls(event.photoUrls)
  }, [editingEventId, eventQuery.data, isEditing])

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
      navigateAfterSave(primaryPerson?.id)
    },
  })

  const buildPayload = (): EventRequest =>
    buildRecordFunnelPayload({
      personIds: selectedPersonIds,
      occurredDate,
      categoryChipId: resolvedCategoryChipId,
      categoryChips,
      emotionChipIds: selectedEmotionChipIds,
      note,
      occurredTime,
      photoUrls,
    })

  const handleSave = () => {
    const validationError = validateRecordForm({
      personIds: selectedPersonIds,
      title: '',
      memo: note.trim(),
      photoUrls,
      occurredDate,
    })
    if (validationError) {
      setFormError(validationError)
      return
    }

    setSavedLocally(false)
    setFormError(null)
    saveMutation.mutate(buildPayload())
  }

  const handleNext = () => {
    if (!nextStep) return
    if (currentStep === 'person' && !primaryPerson) {
      setFormError('함께한 사람을 먼저 추가해 주세요.')
      return
    }
    setFormError(null)
    void funnel.history.push(nextStep, {})
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

  const toggleEmotion = (id: number) => {
    setSelectedEmotionChipIds((prev) => toggleLimitedId(prev, id, EMOTION_MAX))
    setFormError(null)
  }

  const isLoading =
    personsQuery.isPending || (isEditing && eventQuery.isPending)

  if (isLoading) {
    return (
      <RecordFrame
        headerTitle="기록"
        onFinish={handleSave}
        onNext={handleNext}
        nextDisabled
        finishDisabled
        showNext={false}
        saving={false}
      >
        <p className="py-24 text-center text-sm text-muted-foreground">
          불러오는 중…
        </p>
      </RecordFrame>
    )
  }

  if (!isEditing && persons.length === 0) {
    return (
      <RecordFrame
        headerTitle="기록"
        onFinish={handleSave}
        onNext={handleNext}
        nextDisabled
        finishDisabled
        showNext={false}
        saving={false}
      >
        <div className="flex min-h-[60dvh] flex-col items-center justify-center px-5 text-center">
          <p className="text-2xl font-extrabold tracking-tight">
            먼저 사람을 추가해 주세요
          </p>
          <p className="mt-2 text-sm font-bold text-muted-foreground">
            기록은 한 사람에게 남겨져요.
          </p>
          <Link
            to="/people/new"
            className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-full border border-foreground bg-background px-6 text-base font-extrabold"
          >
            <Plus className="size-5" />
            사람 추가
          </Link>
        </div>
      </RecordFrame>
    )
  }

  if (isEditing && !eventQuery.data) {
    return (
      <RecordFrame
        headerTitle="기록"
        onFinish={handleSave}
        onNext={handleNext}
        nextDisabled
        finishDisabled
        showNext={false}
        saving={false}
      >
        <p className="py-24 text-center text-sm text-muted-foreground">
          기록을 찾을 수 없어요.
        </p>
      </RecordFrame>
    )
  }

  return (
    <RecordFrame
      headerTitle={primaryPerson ? `${primaryPerson.name}님` : '기록'}
      onFinish={handleSave}
      onNext={handleNext}
      nextDisabled={currentStep === 'person' && !primaryPerson}
      finishDisabled={!primaryPerson}
      showNext={Boolean(nextStep)}
      saving={saveMutation.isPending}
      error={formError}
      savedLocally={savedLocally}
    >
      <funnel.Render
        person={() => <PersonStep person={primaryPerson} />}
        emotion={() => (
          <EmotionStep
            chips={emotionChips}
            selectedIds={selectedEmotionChipIds}
            onToggle={toggleEmotion}
          />
        )}
        letter={() => (
          <LetterStep
            note={note}
            onChange={setNote}
            photoUrls={photoUrls}
            uploadingPhoto={uploadingPhoto}
            photoInputRef={photoInputRef}
            onPhotoPick={handlePhotoPick}
            onPhotoRemove={(url) =>
              setPhotoUrls((prev) => prev.filter((u) => u !== url))
            }
          />
        )}
        detail={() => (
          <DetailStep
            categoryChips={categoryChips}
            categoryChipId={resolvedCategoryChipId}
            onCategoryChange={setCategoryChipId}
            occurredDate={occurredDate}
            onOccurredDateChange={setOccurredDate}
            occurredTime={occurredTime}
            onOccurredTimeChange={setOccurredTime}
          />
        )}
      />
    </RecordFrame>
  )
}

function RecordFrame({
  headerTitle,
  children,
  onFinish,
  onNext,
  nextDisabled,
  finishDisabled,
  showNext,
  saving,
  error,
  savedLocally,
}: {
  headerTitle: string
  children: React.ReactNode
  onFinish: () => void
  onNext: () => void
  nextDisabled: boolean
  finishDisabled: boolean
  showNext: boolean
  saving: boolean
  error?: string | null
  savedLocally?: boolean
}) {
  return (
    <AppShell activePath="/record" withNav={false} className="px-0 pt-0 pb-0">
      <div className="flex min-h-dvh flex-col bg-[#fbfaf7]">
        <div className="grid grid-cols-[2.5rem_1fr_3.25rem] items-center px-5 pt-[max(1rem,env(safe-area-inset-top))]">
          <Link
            to="/"
            className="flex size-10 items-center justify-center rounded-full text-muted-foreground"
            aria-label="닫기"
          >
            <ChevronLeft className="size-6" />
          </Link>
          <p className="font-record-hand truncate text-center text-lg leading-[1.35] text-foreground">
            {headerTitle}
          </p>
          <button
            type="button"
            aria-label={saving ? '저장 중' : '저장'}
            disabled={saving || finishDisabled}
            onClick={onFinish}
            className="ml-auto flex size-10 items-center justify-center rounded-full text-foreground disabled:text-muted-foreground"
          >
            <Save className={cn('size-5', saving ? 'animate-pulse' : '')} />
          </button>
        </div>

        <div className={cn('flex-1 px-5 pt-8', showNext ? 'pb-28' : 'pb-8')}>
          {children}
        </div>

        <div className="fixed right-0 bottom-0 left-0 z-40 mx-auto max-w-md bg-[#fbfaf7]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          {error ? (
            <p className="px-5 pt-3 text-center text-base text-destructive">
              {error}
            </p>
          ) : null}
          {savedLocally ? (
            <p className="px-5 pt-3 text-center text-base text-muted-foreground">
              서버에 저장하지 못했지만 기록 화면은 열어둘게요.
            </p>
          ) : null}
          {showNext ? (
            <button
              type="button"
              className="relative h-14 w-full bg-foreground text-lg font-bold text-background disabled:bg-muted disabled:text-muted-foreground"
              disabled={saving || nextDisabled}
              onClick={onNext}
            >
              <span className="-translate-x-2 inline-block">이어서</span>
              <ChevronRight className="absolute top-1/2 right-5 size-5 -translate-y-1/2" />
            </button>
          ) : null}
        </div>
      </div>
    </AppShell>
  )
}

function PersonStep({ person }: { person: PersonResponse | null }) {
  if (!person) {
    return (
      <section className="flex min-h-[58dvh] flex-col items-center justify-center text-center">
        <p className="text-3xl font-extrabold tracking-tight">
          기록할 사람이 없어요
        </p>
        <p className="mt-3 text-sm font-bold text-muted-foreground">
          사람을 추가하면 바로 남길 수 있어요.
        </p>
      </section>
    )
  }

  const relationText =
    [person.relationType, person.relationTags[0]?.label, '함께한 사람'].find(
      Boolean,
    ) ?? '함께한 사람'

  return (
    <section className="flex min-h-[72dvh] flex-col items-center justify-center text-center">
      <div className="relative">
        <MonogramAvatar
          name={person.name}
          imageUrl={person.profileImageUrl}
          favorite={person.favorite}
          gender={person.gender}
          personId={person.id}
          useDefaultImage={false}
          className="size-[min(76vw,20rem)] border-2 shadow-sm"
          fallbackClassName="text-[7rem]"
          favoriteClassName="-top-3 -right-2 text-4xl"
        />
      </div>
      <p className="mt-8 max-w-[18rem] text-lg leading-tight text-muted-foreground">
        {relationText}
      </p>
    </section>
  )
}

function EmotionStep({
  chips,
  selectedIds,
  onToggle,
}: {
  chips: Array<{ id: number; label: string }>
  selectedIds: number[]
  onToggle: (id: number) => void
}) {
  const selectedStems = chips
    .filter((chip) => selectedIds.includes(chip.id))
    .map((chip) => getEmotionSentenceStem(chip.label))
  const sentenceValue =
    selectedStems.length > 0
      ? selectedStems.join(', ')
      : '\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0'

  return (
    <section>
      <h1 className="whitespace-nowrap text-[2rem] font-medium leading-[1.2] text-foreground">
        오늘은{' '}
        <span className="inline-block min-w-24 border-b-2 border-foreground px-1 text-center">
          {sentenceValue}
        </span>
        다.
      </h1>
      {chips.length > 0 ? (
        <div className="mt-10 flex flex-wrap gap-3">
          {chips.map((chip, index) => {
            const selected = selectedIds.includes(chip.id)
            const colorClass = EMOTION_CHIP_COLOR_CLASSES[index % 4]
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => onToggle(chip.id)}
                className={cn(
                  'font-record-hand inline-flex min-h-12 items-center rounded-full px-5 text-xl leading-none shadow-sm transition-transform active:scale-[0.99]',
                  colorClass,
                  selected ? 'ring-2 ring-foreground' : '',
                )}
                aria-pressed={selected}
              >
                <span className="relative z-10">
                  {getEmotionSentenceStem(chip.label)}
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="mt-10 text-xl text-muted-foreground">
          감정 칩을 불러오는 중이에요.
        </p>
      )}
    </section>
  )
}

const EMOTION_CHIP_COLOR_CLASSES = [
  'bg-[#ffe28a] text-[#1f1b10]',
  'bg-[#bfe8b8] text-[#132015]',
  'bg-[#bfd6ff] text-[#111b2a]',
  'bg-[#e8c4ff] text-[#22152a]',
]

function LetterStep({
  note,
  onChange,
  photoUrls,
  uploadingPhoto,
  photoInputRef,
  onPhotoPick,
  onPhotoRemove,
}: {
  note: string
  onChange: (value: string) => void
  photoUrls: string[]
  uploadingPhoto: boolean
  photoInputRef: React.RefObject<HTMLInputElement | null>
  onPhotoPick: (file: File | null) => void
  onPhotoRemove: (url: string) => void
}) {
  return (
    <section>
      <PaperField
        value={note}
        onChange={onChange}
        placeholder="[오늘 있었던 일]"
        minHeightClassName="min-h-[17rem]"
      />
      <p className="mt-2 text-right text-xs font-bold text-muted-foreground">
        {note.length}/{NOTE_MAX}
      </p>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={(e) => {
          onPhotoPick(e.target.files?.[0] ?? null)
          e.target.value = ''
        }}
      />
      <div className="mt-6">
        {photoUrls.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-3">
            {photoUrls.map((url) => {
              const src = mediaUrl(url)
              return (
                <div key={url} className="relative size-24">
                  {src ? (
                    <img
                      src={src}
                      alt=""
                      className="size-24 rounded-[1.25rem] object-cover"
                    />
                  ) : (
                    <div className="flex size-24 items-center justify-center rounded-[1.25rem] bg-muted text-[10px] font-bold text-muted-foreground">
                      PHOTO
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => onPhotoRemove(url)}
                    className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full bg-foreground text-background"
                    aria-label="사진 삭제"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        ) : null}
        {photoUrls.length < 5 ? (
          <button
            type="button"
            disabled={uploadingPhoto}
            onClick={() => photoInputRef.current?.click()}
            className="flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-[1.25rem] border border-dashed border-border bg-background text-lg font-medium disabled:opacity-50"
            aria-label="사진 추가"
          >
            {uploadingPhoto ? (
              '…'
            ) : (
              <>
                <ImagePlus className="size-12 stroke-[1.5]" />
                <span>사진 추가</span>
              </>
            )}
          </button>
        ) : null}
      </div>
    </section>
  )
}

function DetailStep({
  categoryChips,
  categoryChipId,
  onCategoryChange,
  occurredDate,
  onOccurredDateChange,
  occurredTime,
  onOccurredTimeChange,
}: {
  categoryChips: Array<{ id: number; label: string }>
  categoryChipId: number | null
  onCategoryChange: (id: number | null) => void
  occurredDate: string
  onOccurredDateChange: (value: string) => void
  occurredTime: string
  onOccurredTimeChange: (value: string) => void
}) {
  return (
    <section>
      <div className="flex flex-col gap-10">
        <section>
          <div className="mb-3">
            <SectionLabel>종류</SectionLabel>
          </div>
          <ToggleGroup
            type="single"
            value={categoryChipId ? String(categoryChipId) : undefined}
            onValueChange={(v) => onCategoryChange(v ? Number(v) : null)}
            className="grid grid-cols-2 gap-3"
          >
            {categoryChips.map((chip) => (
              <ToggleGroupItem
                key={chip.id}
                value={String(chip.id)}
                className={cn(
                  tagChipBaseClass,
                  'min-h-14 justify-center rounded-[1rem] border-border bg-background px-4 text-lg font-normal data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background',
                )}
              >
                {chip.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </section>

        <section>
          <SectionLabel className="mb-4">언제</SectionLabel>
          <RecordDatePicker
            value={occurredDate}
            onChange={onOccurredDateChange}
          />
          <TimeWheelPicker
            value={occurredTime}
            onChange={onOccurredTimeChange}
          />
        </section>
      </div>
    </section>
  )
}

function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h2
      className={cn(
        'text-2xl font-normal leading-none text-foreground',
        className,
      )}
    >
      {children}
    </h2>
  )
}

function RecordDatePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const dateOptions = useMemo(() => getRecordDateOptions(), [])
  return (
    <div className="grid grid-cols-5 gap-2">
      {dateOptions.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'flex min-h-24 flex-col items-center justify-center rounded-[1.4rem] bg-background px-2 shadow-sm transition-colors',
              selected ? 'bg-foreground text-background' : 'text-foreground',
            )}
            aria-pressed={selected}
          >
            <span className="text-lg leading-none">{option.label}</span>
            <span className="mt-2 text-3xl leading-none">{option.day}</span>
          </button>
        )
      })}
    </div>
  )
}

function TimeWheelPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [hour, minute] = splitRecordTime(value)
  const setHour = (nextHour: string) => {
    onChange(`${nextHour}:${minute ?? '00'}`)
  }
  const setMinute = (nextMinute: string) => {
    onChange(`${hour ?? '12'}:${nextMinute}`)
  }

  return (
    <div className="mt-5 rounded-[1.4rem] bg-background px-5 py-4 shadow-sm">
      <div className="grid grid-cols-2 gap-3">
        <WheelColumn
          label="시"
          options={TIME_WHEEL_HOURS}
          selected={hour}
          onSelect={setHour}
        />
        <WheelColumn
          label="분"
          options={TIME_WHEEL_MINUTES}
          selected={minute}
          onSelect={setMinute}
        />
      </div>
    </div>
  )
}

function WheelColumn({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string
  options: string[]
  selected: string | null
  onSelect: (value: string) => void
}) {
  return (
    <div>
      <p className="mb-2 text-center text-xl text-muted-foreground">{label}</p>
      <div className="max-h-40 snap-y overflow-y-auto rounded-[1.1rem] bg-[#fbfaf7] py-2">
        {options.map((option) => {
          const active = option === selected
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={cn(
                'block h-12 w-full snap-center text-center transition-colors',
                active
                  ? 'text-[2rem] font-semibold leading-none text-foreground'
                  : 'text-xl text-muted-foreground',
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const TIME_WHEEL_HOURS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, '0'),
)
const TIME_WHEEL_MINUTES = Array.from({ length: 12 }, (_, index) =>
  String(index * 5).padStart(2, '0'),
)

function splitRecordTime(value: string): [string | null, string | null] {
  const [hour, minute] = value.split(':')
  return [hour || null, minute || null]
}

function PaperField({
  value,
  onChange,
  placeholder,
  minHeightClassName,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  minHeightClassName: string
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.35rem] border border-foreground/10 bg-background px-5 py-4 shadow-sm">
      <div
        className="pointer-events-none absolute inset-x-5 top-4 bottom-4 opacity-70"
        style={{
          backgroundImage:
            'repeating-linear-gradient(178deg, transparent 0, transparent 27px, rgba(0, 0, 0, 0.08) 28px)',
        }}
      />
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={NOTE_MAX}
        placeholder={placeholder}
        className={cn(
          'font-record-hand relative z-10 resize-none border-0 bg-transparent px-0 py-0 text-[1.125rem] leading-7 shadow-none placeholder:text-[1.125rem] placeholder:text-foreground/35 focus-visible:ring-0',
          minHeightClassName,
        )}
      />
    </div>
  )
}
