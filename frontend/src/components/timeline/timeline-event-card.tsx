import { useFlow } from '@stackflow/react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import type {
  ChipRef,
  EventResponse,
  TimelineCard,
  TimelinePerson,
} from '@/apis/generated/mongle-api.schemas'
import { formatPersonName } from '@/lib/format'
import { optimizedImageUrl } from '@/lib/image-url'

export type TimelineEventCardItem = {
  id: number
  title: string
  memo?: string | null
  occurredDate: string
  occurredTime?: string | null
  category?: ChipRef | null
  photoUrls?: string[]
  persons?: TimelinePerson[]
  emotions?: ChipRef[]
}

export function linkedPersonsLabel(persons: TimelinePerson[]) {
  if (persons.length === 0) return ''
  const firstName = formatPersonName(persons[0])
  if (persons.length === 1) return firstName
  return `${firstName} 외 ${persons.length - 1}명`
}

export function fromTimelineCard(card: TimelineCard): TimelineEventCardItem {
  return {
    id: card.id,
    title: card.title,
    memo: card.memo,
    occurredDate: card.occurredDate,
    occurredTime: card.occurredTime,
    category: card.category,
    photoUrls: card.photoUrls,
    persons: card.persons,
  }
}

export function fromEventResponse(event: EventResponse): TimelineEventCardItem {
  return {
    id: event.id,
    title: event.title,
    memo: event.memo,
    occurredDate: event.occurredDate,
    occurredTime: event.occurredTime,
    category: event.category,
    photoUrls: event.photoUrls,
    emotions: event.emotions,
    persons: event.persons.map((person) => ({
      id: person.id,
      name: person.name,
      profileImageUrl: undefined,
      favorite: false,
    })),
  }
}

function TimelinePhotoPreview({ photoUrls }: { photoUrls: string[] }) {
  const firstPhoto = photoUrls[0]
  const src = optimizedImageUrl(firstPhoto, 256)
  if (!src) return null

  return (
    <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-muted shadow-inner">
      <img
        src={src}
        alt="기록 사진"
        className="size-full object-cover"
        loading="lazy"
      />
      {photoUrls.length > 1 ? (
        <span className="absolute right-1 bottom-1 rounded-full bg-foreground/80 px-1.5 py-0.5 text-[10px] font-extrabold text-background">
          +{photoUrls.length - 1}
        </span>
      ) : null}
    </div>
  )
}

export function TimelineEventCard({ item }: { item: TimelineEventCardItem }) {
  const { push } = useFlow()
  const persons = item.persons ?? []
  const photoUrls = item.photoUrls ?? []
  const memo = item.memo?.trim() ?? ''

  return (
    <button
      type="button"
      onClick={() => push('EventDetail', { eventId: String(item.id) })}
      className="block min-w-0 flex-1 text-left"
    >
      <Card className="relative overflow-hidden py-0 shadow-[0_10px_30px_rgba(0,0,0,0.045)] transition-all hover:-translate-y-0.5 hover:bg-muted/20 hover:shadow-[0_14px_36px_rgba(0,0,0,0.07)]">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            {/* data-amp-mask: 제목·메모·이름·칩 라벨은 사용자 생성 텍스트 (analytics.ts 계약) */}
            <h3
              data-amp-mask
              className="min-w-0 flex-1 text-[17px] leading-snug font-extrabold tracking-tight"
            >
              {item.title}
            </h3>
            {item.category ? (
              <Badge
                data-amp-mask
                variant="secondary"
                className="h-7 shrink-0 rounded-full px-3 font-extrabold"
              >
                {item.category.label}
              </Badge>
            ) : null}
          </div>
          <div className="mt-2 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              {persons.length > 0 ? (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/70 py-1 pr-2 pl-1">
                  <MonogramAvatar
                    name={persons[0].name}
                    imageUrl={persons[0].profileImageUrl}
                    personId={persons[0].id}
                    favorite={persons[0].favorite}
                    className="size-6"
                  />
                  <span
                    data-amp-mask
                    className="text-xs font-extrabold text-foreground"
                  >
                    {linkedPersonsLabel(persons)}
                  </span>
                </div>
              ) : null}
              {memo ? (
                <p
                  data-amp-mask
                  className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground"
                >
                  {memo}
                </p>
              ) : null}
              {item.emotions && item.emotions.length > 0 ? (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {item.emotions.map((emotion) => (
                    <Badge key={emotion.id} data-amp-mask variant="outline">
                      {emotion.label}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
            {photoUrls.length > 0 ? (
              <TimelinePhotoPreview photoUrls={photoUrls} />
            ) : null}
          </div>
        </CardContent>
      </Card>
    </button>
  )
}
