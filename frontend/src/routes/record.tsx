import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { fetchChips } from '@/lib/api/chips'
import { createEvent } from '@/lib/api/events'
import { fetchPersons } from '@/lib/api/persons'
import { safeApi } from '@/lib/api/safe'
import { FALLBACK_CHIPS, FALLBACK_PERSONS } from '@/lib/fallback-data'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/record')({
  component: RecordPage,
})

function RecordPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [selectedPersonIds, setSelectedPersonIds] = useState<number[]>([])
  const [categoryChipId, setCategoryChipId] = useState<number | null>(null)
  const [weatherChipId, setWeatherChipId] = useState<number | null>(null)
  const [emotionChipIds, setEmotionChipIds] = useState<number[]>([])
  const [title, setTitle] = useState('')
  const [why, setWhy] = useState('')
  const [what, setWhat] = useState('')
  const [occurredDate, setOccurredDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  )
  const [savedLocally, setSavedLocally] = useState(false)

  const chipsQuery = useQuery({
    queryKey: queryKeys.chips,
    queryFn: () => safeApi(fetchChips, FALLBACK_CHIPS),
    initialData: FALLBACK_CHIPS,
  })
  const personsQuery = useQuery({
    queryKey: queryKeys.persons(),
    queryFn: () => safeApi(() => fetchPersons(), FALLBACK_PERSONS),
    initialData: FALLBACK_PERSONS,
  })

  const persons = personsQuery.data
  const chips = chipsQuery.data

  const chipsByType = useMemo(
    () => ({
      category: chips.filter((c) => c.type === 'CATEGORY'),
      weather: chips.filter((c) => c.type === 'WEATHER'),
      emotion: chips.filter((c) => c.type === 'EMOTION'),
    }),
    [chips],
  )

  const primaryPerson =
    persons.find((p) => selectedPersonIds.includes(p.id)) ?? persons[0]

  const categoryLabel =
    chipsByType.category.find((c) => c.id === categoryChipId)?.label ??
    chipsByType.category[0].label

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: async (event) => {
      await queryClient.invalidateQueries({ queryKey: ['home'] })
      await queryClient.invalidateQueries({ queryKey: ['persons'] })
      const personId = event.persons[0]?.id
      if (personId) {
        void navigate({
          to: '/people/$personId/timeline',
          params: { personId: String(personId) },
        })
      } else {
        void navigate({ to: '/' })
      }
    },
    onError: () => {
      setSavedLocally(true)
      const personId = selectedPersonIds[0] ?? primaryPerson.id
      setTimeout(() => {
        void navigate({
          to: '/people/$personId/timeline',
          params: { personId: String(personId) },
        })
      }, 600)
    },
  })

  const togglePerson = (id: number) => {
    setSelectedPersonIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  const toggleEmotion = (id: number) => {
    setEmotionChipIds((prev) =>
      prev.includes(id)
        ? prev.filter((e) => e !== id)
        : [...prev, id].slice(0, 5),
    )
  }

  const handleSave = () => {
    setSavedLocally(false)
    const personIds =
      selectedPersonIds.length > 0 ? selectedPersonIds : [primaryPerson.id]

    createMutation.mutate({
      title: title.trim() || null,
      why: why.trim() || null,
      what: what.trim() || null,
      occurredDate,
      categoryChipId: categoryChipId ?? chipsByType.category[0].id,
      weatherChipId,
      emotionChipIds,
      personIds,
    })
  }

  return (
    <AppShell activePath="/record" className="px-0">
      <header className="grid grid-cols-3 items-center px-5 py-1">
        <Link to="/" className="text-lg font-extrabold text-muted-foreground">
          ‹
        </Link>
        <h1 className="text-center text-base font-extrabold">새 기록</h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={createMutation.isPending}
          className="text-right text-[15px] font-extrabold disabled:opacity-50"
        >
          {createMutation.isPending ? '저장 중' : '저장'}
        </button>
      </header>

      <div className="flex flex-col gap-5 px-5">
        <section>
          <MonogramAvatar
            name={primaryPerson.name}
            imageUrl={primaryPerson.profileImageUrl}
            className="size-9"
          />
          <h2 className="mt-2 text-xl font-extrabold">
            오늘{' '}
            <span className="underline underline-offset-4">
              {primaryPerson.name}
            </span>
            랑 어땠어요?
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            감정만 골라도 돼요. 세 줄이면 충분해요.
          </p>
        </section>

        <section>
          <p className="mb-2 text-xs font-extrabold text-muted-foreground">
            오늘의 감정
          </p>
          <div className="flex flex-wrap gap-2">
            {chipsByType.emotion.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => toggleEmotion(chip.id)}
                className={cn(
                  'rounded-full border px-3.5 py-2 text-[13px] font-bold',
                  emotionChipIds.includes(chip.id)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground',
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="mb-2 text-xs font-extrabold text-muted-foreground">
            제목
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              placeholder="있었던 일을 짧게 적어도 좋아요"
            />
            <Badge variant="secondary">{categoryLabel} ▾</Badge>
          </div>
        </section>

        <section>
          <p className="mb-2 text-xs font-extrabold text-muted-foreground">
            날씨
          </p>
          <ToggleGroup
            type="single"
            value={weatherChipId ? String(weatherChipId) : undefined}
            onValueChange={(v) => setWeatherChipId(v ? Number(v) : null)}
            className="flex flex-wrap justify-start gap-2"
          >
            {chipsByType.weather.map((chip) => (
              <ToggleGroupItem
                key={chip.id}
                value={String(chip.id)}
                className="rounded-full border px-3.5 py-2 text-[13px] font-bold data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {chip.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </section>

        <section>
          <p className="mb-2 text-xs font-extrabold text-muted-foreground">
            카테고리
          </p>
          <ToggleGroup
            type="single"
            value={categoryChipId ? String(categoryChipId) : undefined}
            onValueChange={(v) => setCategoryChipId(v ? Number(v) : null)}
            className="flex flex-wrap justify-start gap-2"
          >
            {chipsByType.category.map((chip) => (
              <ToggleGroupItem
                key={chip.id}
                value={String(chip.id)}
                className="rounded-full border px-3.5 py-2 text-[13px] font-bold data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {chip.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </section>

        <section>
          <p className="mb-2 text-xs font-extrabold text-muted-foreground">
            함께한 사람
          </p>
          <div className="flex flex-wrap gap-2">
            {persons.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePerson(p.id)}
                className={cn(
                  'rounded-full border px-3.5 py-2 text-[13px] font-bold',
                  (selectedPersonIds.length
                    ? selectedPersonIds
                    : [primaryPerson.id]
                  ).includes(p.id)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground',
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="mb-2 text-xs font-extrabold text-muted-foreground">
            왜 / 무엇을
          </p>
          <Textarea
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="왜 만났는지 (선택)"
            className="mb-2 min-h-16 resize-none"
          />
          <Textarea
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            placeholder="무엇을 했는지 (선택)"
            className="min-h-16 resize-none"
          />
        </section>

        <section>
          <p className="mb-2 text-xs font-extrabold text-muted-foreground">
            날짜
          </p>
          <Input
            type="date"
            value={occurredDate}
            onChange={(e) => setOccurredDate(e.target.value)}
          />
        </section>

        <section>
          <p className="mb-2 text-xs font-extrabold text-muted-foreground">
            사진
          </p>
          <div className="flex gap-2">
            <div className="flex size-16 items-center justify-center rounded-xl border border-dashed border-border bg-muted text-[10px] font-bold text-muted-foreground">
              PHOTO
            </div>
            <Button
              variant="outline"
              className="size-16 rounded-xl border-dashed text-2xl"
              type="button"
            >
              ＋
            </Button>
          </div>
        </section>

        {savedLocally ? (
          <p className="text-center text-xs text-muted-foreground">
            서버에 저장하지 못했지만 기록 화면은 열어둘게요.
          </p>
        ) : null}
      </div>
    </AppShell>
  )
}
