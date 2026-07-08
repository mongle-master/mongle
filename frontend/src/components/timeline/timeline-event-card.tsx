import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import type {
  ChipRef,
  EventResponse,
  TimelineCard,
  TimelinePerson,
} from '@/lib/api/types'
import { mediaUrl } from '@/lib/api/client'
import { formatWhen } from '@/lib/format'

export type TimelineEventCardItem = {
  id: number
  title: string
  why: string | null
  what: string | null
  occurredDate: string
  occurredTime: string | null
  category: ChipRef | null
  photoUrls?: string[]
  persons?: TimelinePerson[]
  emotions?: ChipRef[]
}

export function linkedPersonsLabel(persons: TimelinePerson[]) {
  if (persons.length === 0) return ''
  if (persons.length === 1) return persons[0].name
  return `${persons[0].name} 외 ${persons.length - 1}명`
}

export function fromTimelineCard(card: TimelineCard): TimelineEventCardItem {
  return {
    id: card.id,
    title: card.title,
    why: card.why,
    what: card.what,
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
    why: event.why,
    what: event.what,
    occurredDate: event.occurredDate,
    occurredTime: event.occurredTime,
    category: event.category,
    photoUrls: event.photoUrls,
    emotions: event.emotions,
    persons: event.persons.map((person) => ({
      id: person.id,
      name: person.name,
      profileImageUrl: null,
      favorite: false,
    })),
  }
}

function TimelinePhotoPreview({ photoUrls }: { photoUrls: string[] }) {
  const firstPhoto = photoUrls[0]
  const src = mediaUrl(firstPhoto)
  if (!src) return null

  return (
    <div className="relative mt-0.5 size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
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
  const when = formatWhen(item.occurredDate, item.occurredTime)
  const persons = item.persons ?? []
  const photoUrls = item.photoUrls ?? []

  return (
    <Link
      to="/record"
      search={{ eventId: item.id, personId: undefined }}
      className="block min-w-0 flex-1"
    >
      <Card className="relative py-0 shadow-sm transition-colors hover:bg-muted/30">
        <CardContent className="flex gap-3 p-[15px]">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[15.5px] font-extrabold">
                {item.title}
              </h3>
              {item.category ? (
                <Badge variant="secondary" className="shrink-0">
                  {item.category.label}
                </Badge>
              ) : null}
            </div>
            {persons.length > 0 ? (
              <div className="mt-1.5 inline-flex items-center gap-1.5">
                <MonogramAvatar
                  name={persons[0].name}
                  imageUrl={persons[0].profileImageUrl}
                  favorite={persons[0].favorite}
                  className="size-6"
                />
                <span className="text-xs font-bold text-muted-foreground">
                  {linkedPersonsLabel(persons)}
                </span>
              </div>
            ) : null}
            {item.emotions && item.emotions.length > 0 ? (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {item.emotions.map((emotion) => (
                  <Badge key={emotion.id} variant="outline">
                    {emotion.label}
                  </Badge>
                ))}
              </div>
            ) : null}
            <p className="mt-1.5 text-[11.5px]">
              <span className="text-muted-foreground">언제 </span>
              {when}
            </p>
            {item.why ? (
              <p className="mt-1 text-[11.5px]">
                <span className="text-muted-foreground">왜 만났는지 </span>
                {item.why}
              </p>
            ) : null}
            {item.what ? (
              <p className="mt-1 text-[11.5px]">
                <span className="text-muted-foreground">무엇을 했는지 </span>
                {item.what}
              </p>
            ) : null}
          </div>
          {photoUrls.length > 0 ? (
            <TimelinePhotoPreview photoUrls={photoUrls} />
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}
