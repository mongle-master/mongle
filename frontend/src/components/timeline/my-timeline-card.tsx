import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import type { TimelineCard } from '@/lib/api/types'
import { formatWhen } from '@/lib/format'

export function formatLinkedPersons(persons: TimelineCard['persons']) {
  if (persons.length === 0) return null
  if (persons.length === 1) return persons[0]
  return persons[0]
}

export function linkedPersonsLabel(persons: TimelineCard['persons']) {
  if (persons.length === 0) return ''
  if (persons.length === 1) return persons[0].name
  return `${persons[0].name} 외 ${persons.length - 1}명`
}

export function MyTimelineCard({ card }: { card: TimelineCard }) {
  const when = formatWhen(card.occurredDate, card.occurredTime)

  return (
    <Link
      to="/record"
      search={{ eventId: card.id, personId: undefined }}
      className="block flex-1"
    >
      <Card className="relative shadow-sm transition-colors hover:bg-muted/30">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15.5px] font-extrabold">
              {card.title}
            </h3>
            {card.category ? (
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                {card.category.label}
              </Badge>
            ) : null}
          </div>
          {card.persons.length > 0 ? (
            <div className="mt-1.5 inline-flex items-center gap-1.5">
              <MonogramAvatar
                name={card.persons[0].name}
                imageUrl={card.persons[0].profileImageUrl}
                favorite={card.persons[0].favorite}
                className="size-6"
              />
              <span className="text-xs font-bold text-muted-foreground">
                {linkedPersonsLabel(card.persons)}
              </span>
            </div>
          ) : null}
          <p className="mt-1.5 text-[11.5px]">
            <span className="text-muted-foreground">언제 </span>
            {when}
          </p>
          {card.why ? (
            <p className="mt-1 text-[11.5px]">
              <span className="text-muted-foreground">왜 만났는지 </span>
              {card.why}
            </p>
          ) : null}
          {card.what ? (
            <p className="mt-1 text-[11.5px]">
              <span className="text-muted-foreground">무엇을 했는지 </span>
              {card.what}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}
