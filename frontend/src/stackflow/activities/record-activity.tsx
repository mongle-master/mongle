import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFlow } from '@stackflow/react'
import type { ActivityComponentType } from '@stackflow/react'
import { useFunnel } from '@use-funnel/browser'
import { Check, ChevronLeft, ImagePlus, Plus, Save, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { DateStrip, TimeWheel } from '@/components/record/date-time-wheel'
import { AppScreen } from '@/stackflow/components/app-screen'
import { fetchChips } from '@/lib/api/chips'
import { createEvent, fetchEvent, updateEvent } from '@/lib/api/events'
import { uploadImage } from '@/lib/api/images'
import { fetchPersons } from '@/lib/api/persons'
import type { EventRequest, PersonResponse } from '@/lib/api/types'
import { optimizedImageUrl } from '@/lib/image-url'
import { queryKeys } from '@/lib/query-keys'
import {
  formatOccurredTimeForApi,
  formatOccurredTimeForInput,
  validateRecordForm,
} from '@/lib/record-validation'
import { cn } from '@/lib/utils'

const MEMO_MAX = 200 // 백엔드 memo 상한과 일치
const EMOTION_MAX = 5 // 백엔드 ValidationLimits.EMOTION_PER_EVENT_MAX와 일치

// 감정 칩(명사)을 "오늘은 ___다" 문장에 맞는 과거 서술형으로 바꾼다.
// 한국어 활용은 규칙화가 어려워(es-hangul도 조사만 지원) 알려진 값만 매핑한다.
// 백엔드 ChipSeeder 의 감정 시드 라벨은 전부 여기 있어야 한다 — 빠지면 "반가움다"처럼 깨진다.
const EMOTION_PAST: Record<string, string> = {
  반가움: '반가웠',
  뭉클: '뭉클했',
  편안: '편안했',
  즐거움: '즐거웠',
  고마움: '고마웠',
  설렘: '설렜',
  든든: '든든했',
  서운: '서운했',
  아쉬움: '아쉬웠',
  속상: '속상했',
  그냥: '그냥 그랬',
  // 이하는 과거 시드·개인 칩에서 올 수 있는 라벨.
  기쁨: '기뻤',
  감사: '감사했',
  행복: '행복했',
  뿌듯: '뿌듯했',
  슬픔: '슬펐',
  우울: '우울했',
  불안: '불안했',
  신남: '신났',
  피곤: '피곤했',
}
// 매핑에 없는 라벨(사용자 개인 칩 등)에 '다'를 붙이면 "반가움다"처럼 깨지므로 원형 그대로 둔다.
const emotionWord = (label: string) => {
  const past = EMOTION_PAST[label]
  return past ? `${past}다` : label
}

// 감정은 칩(테두리) 대신 색상 있는 글자만. 리터럴이라 Tailwind JIT가 스캔한다.
const EMOTION_TEXT = [
  'text-rose-500',
  'text-amber-500',
  'text-sky-500',
  'text-violet-500',
  'text-emerald-500',
  'text-orange-500',
]

const bigChipBase =
  'inline-flex h-11 items-center justify-center rounded-full border px-5 text-[15px] whitespace-nowrap transition-colors'
// 선택 채움은 순검정 대신 살짝 연한 잉크(눈부심 완화).
const neutralChipClass = cn(
  bigChipBase,
  'border-border bg-card text-foreground/80 data-[state=on]:border-transparent data-[state=on]:bg-foreground/85 data-[state=on]:text-background',
)

// 편지지: 흑백 톤 + 손그림 느낌 옅은 괘선(SVG). 줄 높이 28px에 맞춘다.
const letterLineSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' width='90' height='28'><path d='M0 25 Q 22 21 45 25 T 90 25' fill='none' stroke='rgba(0,0,0,0.07)' stroke-width='1'/></svg>"
const letterPaperStyle: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(letterLineSvg)}")`,
  backgroundRepeat: 'repeat',
  backgroundSize: '90px 28px',
  backgroundPositionY: '3px',
}

const pad = (n: number) => String(n).padStart(2, '0')
function todayStr() {
  return new Date().toISOString().slice(0, 10)
}
function nowTimeStr() {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(Math.floor(d.getMinutes() / 5) * 5)}`
}

function parseId(value: string | undefined): number | undefined {
  if (value === undefined) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

type RecordSteps = {
  person: Record<string, never>
  emotion: Record<string, never>
  what: Record<string, never>
  detail: Record<string, never>
}

export const RecordActivity: ActivityComponentType<'Record'> = ({ params }) => {
  const presetPersonId = parseId(params.personId)
  const editingEventId = parseId(params.eventId)
  const isEditing = editingEventId !== undefined
  const { push, pop, replace } = useFlow()
  const queryClient = useQueryClient()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const hydratedEventId = useRef<number | null>(null)

  const [selectedPersonIds, setSelectedPersonIds] = useState<number[]>(() =>
    presetPersonId ? [presetPersonId] : [],
  )
  const [categoryChipId, setCategoryChipId] = useState<number | null>(null)
  const [emotionChipIds, setEmotionChipIds] = useState<number[]>([])
  const [weatherChipId, setWeatherChipId] = useState<number | null>(null)
  const [what, setWhat] = useState('')
  const [occurredDate, setOccurredDate] = useState(todayStr)
  const [occurredTime, setOccurredTime] = useState(nowTimeStr)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [savedLocally, setSavedLocally] = useState(false)

  const chipsQuery = useQuery({
    queryKey: queryKeys.chips,
    queryFn: () => fetchChips(),
  })
  const personsQuery = useQuery({
    queryKey: queryKeys.persons(),
    queryFn: (): Promise<PersonResponse[]> => fetchPersons(),
  })
  const eventQuery = useQuery({
    queryKey: queryKeys.event(editingEventId ?? 0),
    queryFn: () => fetchEvent(editingEventId!),
    enabled: isEditing,
  })

  const persons = personsQuery.data ?? []
  const chips = chipsQuery.data ?? []

  const categoryChips = useMemo(
    () => chips.filter((c) => c.type === 'CATEGORY'),
    [chips],
  )
  const emotionChips = useMemo(
    () => chips.filter((c) => c.type === 'EMOTION'),
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
  let personLabel = ''
  if (primaryPerson) {
    personLabel =
      selectedPersons.length === 1
        ? `${primaryPerson.name}님`
        : `${primaryPerson.name}님 외 ${selectedPersons.length - 1}명`
  }

  const categoryLabel =
    categoryChips.find((c) => c.id === categoryChipId)?.label ??
    categoryChips.at(0)?.label ??
    ''

  // 제목 인풋은 없앴다. 본문 첫 줄을 잘라 제목으로(엔터 = 첫 줄까지).
  const derivedTitle = what.split('\n')[0].slice(0, 40).trim()
  const fallbackTitle = useMemo(() => {
    if (selectedPersons.length === 0) return ''
    const who =
      selectedPersons.length === 1
        ? selectedPersons[0].name
        : `${selectedPersons[0].name} 외 ${selectedPersons.length - 1}명`
    return categoryLabel ? `${who} · ${categoryLabel}` : who
  }, [selectedPersons, categoryLabel])

  useEffect(() => {
    if (!isEditing || !eventQuery.data) return
    if (hydratedEventId.current === editingEventId) return
    const event = eventQuery.data
    hydratedEventId.current = editingEventId
    setSelectedPersonIds(event.persons.map((p) => p.id))
    setWhat(event.memo ?? '')
    setOccurredDate(event.occurredDate)
    setOccurredTime(formatOccurredTimeForInput(event.occurredTime))
    setCategoryChipId(event.category?.id ?? null)
    setEmotionChipIds(event.emotions.map((e) => e.id))
    setWeatherChipId(event.weather?.id ?? null)
    setPhotoUrls(event.photoUrls)
  }, [editingEventId, eventQuery.data, isEditing])

  const navigateAfterSave = (personId?: number) => {
    if (isEditing) {
      pop()
      return
    }
    if (personId) {
      replace('Person', { personId: String(personId), view: 'timeline' })
      return
    }
    pop()
  }

  const saveMutation = useMutation({
    mutationFn: (body: EventRequest) =>
      isEditing ? updateEvent(editingEventId, body) : createEvent(body),
    onSuccess: async (event) => {
      await queryClient.invalidateQueries({ queryKey: ['home'] })
      await queryClient.invalidateQueries({ queryKey: ['persons'] })
      // 인물 타임라인 상단 요약(함께한 기록·마지막 만남)은 ['person', id]의
      // stats에서 나온다. 목록(person-timeline)만 무효화하면 요약이 stale.
      await queryClient.invalidateQueries({ queryKey: ['person'] })
      await queryClient.invalidateQueries({ queryKey: ['my-timeline'] })
      await queryClient.invalidateQueries({ queryKey: ['person-timeline'] })
      if (isEditing) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.event(editingEventId),
        })
      }
      navigateAfterSave(event.persons[0]?.id)
    },
    onError: () => {
      setSavedLocally(true)
      navigateAfterSave(selectedPersonIds[0])
    },
  })

  const buildPayload = (): EventRequest => ({
    title: derivedTitle || fallbackTitle || null,
    memo: what.trim() || null,
    occurredDate,
    occurredTime: formatOccurredTimeForApi(occurredTime),
    categoryChipId: categoryChipId ?? categoryChips.at(0)?.id ?? null,
    weatherChipId,
    emotionChipIds,
    personIds: selectedPersonIds,
    photoUrls,
  })

  const handleSave = () => {
    const validationError = validateRecordForm({
      personIds: selectedPersonIds,
      title: derivedTitle,
      memo: what.trim(),
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

  const togglePerson = (id: number) => {
    setSelectedPersonIds((prev) =>
      prev.includes(id)
        ? prev.filter((personId) => personId !== id)
        : [...prev, id],
    )
  }

  const toggleEmotion = (id: number) => {
    setEmotionChipIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((emotionId) => emotionId !== id)
      }
      if (prev.length >= EMOTION_MAX) return prev
      return [...prev, id]
    })
  }

  const handlePhotoPick = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const room = 5 - photoUrls.length
    if (room <= 0) {
      setFormError('사진은 최대 5장까지 넣을 수 있어요.')
      return
    }
    const picked = Array.from(files).slice(0, room)
    setUploadingPhoto(true)
    try {
      for (const file of picked) {
        const { url } = await uploadImage(file)
        setPhotoUrls((prev) => [...prev, url])
      }
    } catch {
      setFormError('사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const startStep: keyof RecordSteps =
    presetPersonId || isEditing ? 'emotion' : 'person'
  const funnel = useFunnel<RecordSteps>({
    id: 'record',
    initial: { step: startStep, context: {} },
  })

  // 선택한 사람은 메모리 상태라 새로고침하면 사라진다. 사람 없이 뒤 단계
  // URL(record.step=emotion 등)로 들어오면 빈 화면이 되므로 사람 단계로 되돌린다.
  useEffect(() => {
    if (isEditing || presetPersonId) return
    if (funnel.step !== 'person' && selectedPersonIds.length === 0) {
      void funnel.history.replace('person', {})
    }
  }, [funnel, isEditing, presetPersonId, selectedPersonIds.length])

  const isLoading =
    personsQuery.isPending || (isEditing && eventQuery.isPending)

  if (isLoading) {
    return (
      <BareShell>
        <p className="px-5 py-20 text-center text-sm text-muted-foreground">
          불러오는 중…
        </p>
      </BareShell>
    )
  }

  if (!isEditing && persons.length === 0) {
    return (
      <BareShell>
        <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
          <p className="text-sm text-muted-foreground">
            먼저 함께한 사람을 추가해 주세요.
          </p>
          <button
            type="button"
            onClick={() => push('PersonNew', {})}
            className="mt-5 inline-flex items-center gap-1 rounded-full border border-foreground bg-card px-4 py-2.5 text-sm font-extrabold"
          >
            <Plus className="size-4" />
            사람 추가
          </button>
        </div>
      </BareShell>
    )
  }

  if (isEditing && !eventQuery.data) {
    return (
      <BareShell>
        <p className="px-5 py-20 text-center text-sm text-muted-foreground">
          기록을 찾을 수 없어요.
        </p>
      </BareShell>
    )
  }

  const saving = saveMutation.isPending
  const selectedEmotionWords = emotionChipIds.flatMap((id) => {
    const emotion = emotionChips.find((chip) => chip.id === id)
    return emotion ? [emotionWord(emotion.label)] : []
  })

  return (
    <funnel.Render
      person={({ history }) => (
        <StepFrame
          onBack={() => pop()}
          footer={
            <NextBar
              onNext={() => history.push('emotion', {})}
              disabled={selectedPersonIds.length === 0}
            />
          }
        >
          <h2 className="text-2xl font-bold">누구와의 기록이에요?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            함께한 사람을 모두 골라주세요. {selectedPersonIds.length}명 선택
          </p>
          <ul className="mt-5 flex flex-col">
            {[...persons]
              .sort((a, b) => Number(b.favorite) - Number(a.favorite))
              .map((person) => {
                const selected = selectedPersonIds.includes(person.id)
                return (
                  <li key={person.id}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => togglePerson(person.id)}
                      className="flex w-full items-center gap-3 border-b border-border/70 py-2.5 text-left"
                    >
                      <MonogramAvatar
                        name={person.name}
                        imageUrl={person.profileImageUrl}
                        favorite={person.favorite}
                        className="size-12"
                      />
                      <span className="flex-1 text-lg">{person.name}</span>
                      <span
                        className={cn(
                          'flex size-6 items-center justify-center rounded-full border',
                          selected
                            ? 'border-foreground/85 bg-foreground/85 text-background'
                            : 'border-border text-transparent',
                        )}
                      >
                        <Check className="size-4" />
                      </span>
                    </button>
                  </li>
                )
              })}
          </ul>
        </StepFrame>
      )}
      emotion={({ history }) => (
        <StepFrame
          centerLabel={personLabel}
          onBack={() => (startStep === 'person' ? history.back() : pop())}
          onDone={handleSave}
          doneSaving={saving}
          footer={<NextBar onNext={() => history.push('what', {})} />}
        >
          <div className="flex justify-center">
            <MonogramAvatar
              name={primaryPerson?.name ?? ''}
              imageUrl={primaryPerson?.profileImageUrl}
              // size-[62vw]는 뷰포트 기준이라 데스크톱에서 폭 상한(max-w)만 걸면
              // 높이가 그대로 남아 화면을 채우는 세로 알약이 된다 — 양축 모두 상한.
              className="size-[62vw] max-h-72 max-w-72"
            />
          </div>

          <div className="mt-8 text-center">
            <p className="font-hand text-2xl text-foreground/70">오늘은</p>
            <p className="font-hand mt-2 min-h-11 text-3xl text-foreground/85">
              {selectedEmotionWords.length > 0
                ? selectedEmotionWords.join(' · ')
                : '\u00A0'}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              최대 {EMOTION_MAX}개 · {emotionChipIds.length}개 선택
            </p>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 font-hand">
            {emotionChips.map((chip, i) => {
              const on = emotionChipIds.includes(chip.id)
              return (
                <button
                  key={chip.id}
                  type="button"
                  aria-pressed={on}
                  disabled={!on && emotionChipIds.length >= EMOTION_MAX}
                  onClick={() => toggleEmotion(chip.id)}
                  className={cn(
                    'text-3xl transition disabled:opacity-20',
                    EMOTION_TEXT[i % EMOTION_TEXT.length],
                    on
                      ? 'underline decoration-2 underline-offset-8 opacity-100'
                      : 'opacity-40',
                  )}
                >
                  {emotionWord(chip.label)}
                </button>
              )
            })}
          </div>
        </StepFrame>
      )}
      what={({ history }) => (
        <StepFrame
          centerLabel={personLabel}
          onBack={() => history.back()}
          onDone={handleSave}
          doneSaving={saving}
          footer={<NextBar onNext={() => history.push('detail', {})} />}
        >
          {/* 사진 추가를 편지지보다 위에 둔다. */}
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
          {photoUrls.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {photoUrls.map((url) => {
                const src = optimizedImageUrl(url, 256)
                return (
                  <div key={url} className="relative size-20">
                    {src ? (
                      <img
                        src={src}
                        alt=""
                        className="size-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex size-20 items-center justify-center rounded-xl bg-muted text-[10px] font-bold text-muted-foreground">
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
            </div>
          ) : null}
          {photoUrls.length < 5 ? (
            <button
              type="button"
              disabled={uploadingPhoto}
              onClick={() => photoInputRef.current?.click()}
              className="mb-3 flex h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card text-muted-foreground disabled:opacity-50"
            >
              <ImagePlus className="size-9" strokeWidth={1.6} />
              <span className="text-sm">
                {uploadingPhoto ? '올리는 중…' : '사진 추가'}
              </span>
            </button>
          ) : null}

          <div className="relative rounded-2xl border border-border bg-card p-4">
            <Textarea
              value={what}
              onChange={(e) => setWhat(e.target.value)}
              maxLength={MEMO_MAX}
              autoFocus
              enterKeyHint="done"
              autoCapitalize="sentences"
              placeholder="오늘 있었던 일"
              style={letterPaperStyle}
              className="font-hand min-h-[148px] resize-none border-0 bg-transparent p-0 text-lg leading-7 tracking-tight shadow-none focus-visible:ring-0 md:text-lg"
            />
            <span className="pointer-events-none absolute right-3 bottom-2 text-[11px] tabular-nums text-muted-foreground/70">
              {what.length}/{MEMO_MAX}
            </span>
          </div>
        </StepFrame>
      )}
      detail={({ history }) => (
        <StepFrame
          centerLabel={personLabel}
          onBack={() => history.back()}
          onDone={handleSave}
          doneSaving={saving}
        >
          <div className="flex flex-col gap-7">
            <Field label="종류">
              <ToggleGroup
                type="single"
                value={categoryChipId ? String(categoryChipId) : undefined}
                onValueChange={(v) => setCategoryChipId(v ? Number(v) : null)}
                className="flex flex-wrap justify-start gap-2.5"
              >
                {categoryChips.map((chip) => (
                  <ToggleGroupItem
                    key={chip.id}
                    value={String(chip.id)}
                    className={neutralChipClass}
                  >
                    {chip.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>

            <Field label="언제">
              <DateStrip value={occurredDate} onChange={setOccurredDate} />
              <div className="mt-4">
                <TimeWheel value={occurredTime} onChange={setOccurredTime} />
              </div>
            </Field>

            {formError ? (
              <p className="text-center text-sm text-destructive">
                {formError}
              </p>
            ) : null}
            {savedLocally ? (
              <p className="text-center text-sm text-muted-foreground">
                서버에 저장하지 못했지만 기록 화면은 열어둘게요.
              </p>
            ) : null}
          </div>
        </StepFrame>
      )}
    />
  )
}

// 몰입형 껍데기: 앱 헤더/하단 탭바 없이 전체화면.
// AppScreen 래핑은 필수 — 없으면 push 되어도 아래 activity(탭 화면)를 덮지 못해
// "+ 눌러도 아무 일 없음"이 된다. fullScreen 모달 present는 stackflow/README 계약.
// AppScreen 컨테이너(absolute inset)에 갇히므로 dvh 대신 h-full 기준.
function RecordScreen({ children }: { children: React.ReactNode }) {
  return (
    <AppScreen CUPERTINO_ONLY_modalPresentationStyle="fullScreen">
      <div className="mx-auto flex h-full max-w-md flex-col overflow-y-auto bg-background">
        {children}
      </div>
    </AppScreen>
  )
}

function BareShell({ children }: { children: React.ReactNode }) {
  return <RecordScreen>{children}</RecordScreen>
}

function StepFrame({
  centerLabel,
  onBack,
  onDone,
  doneSaving,
  footer,
  children,
}: {
  centerLabel?: string
  onBack: () => void
  onDone?: () => void
  doneSaving?: boolean
  footer?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <RecordScreen>
      <header className="flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로"
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground"
        >
          <ChevronLeft className="size-6" />
        </button>
        <span className="text-base font-bold">{centerLabel}</span>
        {onDone ? (
          <button
            type="button"
            onClick={onDone}
            disabled={doneSaving}
            aria-label="저장"
            className="flex size-9 items-center justify-center rounded-full text-foreground/70 disabled:opacity-50"
          >
            <Save className="size-6" />
          </button>
        ) : (
          <span className="size-9" />
        )}
      </header>
      <main className="flex flex-1 flex-col px-5 pt-4 pb-6">{children}</main>
      {footer}
    </RecordScreen>
  )
}

// 다음 단계로. 하단을 여백 없이 채운다.
function NextBar({
  onNext,
  disabled = false,
}: {
  onNext: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onNext}
      disabled={disabled}
      className="sticky bottom-0 w-full bg-foreground/85 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-lg font-bold text-background disabled:opacity-30"
    >
      이어서
    </button>
  )
}

// label을 키우고 볼드는 뺀다.
function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <section>
      <p className="mb-2.5 text-lg text-muted-foreground">{label}</p>
      {children}
    </section>
  )
}
