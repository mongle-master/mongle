import { ChipBadge } from '@/components/ui/chip-badge'
import { Card, CardContent } from '@/components/ui/card'
import { PersonChip } from '@/components/person/person-chip'
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
        <span className="absolute right-1 bottom-1 rounded-full bg-foreground/80 px-1.5 py-0.5 text-micro font-semibold text-background">
          +{photoUrls.length - 1}
        </span>
      ) : null}
    </div>
  )
}

export function TimelineEventCard({
  item,
  onSelect,
}: {
  item: TimelineEventCardItem
  onSelect: (eventId: number) => void
}) {
  const persons = item.persons ?? []
  const photoUrls = item.photoUrls ?? []
  const memo = item.memo?.trim() ?? ''

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className="block min-w-0 flex-1 text-left"
    >
      <Card className="relative overflow-hidden py-0 shadow-e3 transition-all hover:-translate-y-0.5 hover:bg-muted/20 hover:shadow-e4">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <h3
              data-amp-mask
              className="min-w-0 flex-1 text-title-sm leading-snug font-medium tracking-tight"
            >
              {item.title}
            </h3>
            {item.category ? (
              <ChipBadge
                data-amp-mask
                chip={item.category}
                className="shrink-0 font-semibold"
              />
            ) : null}
          </div>
          <div className="mt-2 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              {persons.length > 0 ? (
                <PersonChip
                  name={persons[0].name}
                  imageUrl={persons[0].profileImageUrl}
                  personId={persons[0].id}
                  favorite={persons[0].favorite}
                  label={linkedPersonsLabel(persons)}
                />
              ) : null}
              {memo ? (
                <p
                  data-amp-mask
                  className="mt-2 line-clamp-2 text-label leading-relaxed text-muted-foreground"
                >
                  {memo}
                </p>
              ) : null}
              {item.emotions && item.emotions.length > 0 ? (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {item.emotions.map((emotion) => (
                    <ChipBadge
                      key={emotion.id}
                      data-amp-mask
                      chip={emotion}
                      size="sm"
                    />
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
