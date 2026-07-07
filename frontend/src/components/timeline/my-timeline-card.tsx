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
    <Card className="shadow-sm">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[15px] font-extrabold">
                {card.title}
              </h3>
              {card.category ? (
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {card.category.label}
                </Badge>
              ) : null}
            </div>
            {card.persons.length > 0 ? (
              <Link
                to="/people/$personId"
                params={{ personId: String(card.persons[0].id) }}
                className="mt-1.5 inline-flex items-center gap-1.5"
              >
                <MonogramAvatar
                  name={card.persons[0].name}
                  imageUrl={card.persons[0].profileImageUrl}
                  favorite={card.persons[0].favorite}
                  className="size-6"
                />
                <span className="text-xs font-bold text-muted-foreground">
                  {linkedPersonsLabel(card.persons)}
                </span>
              </Link>
            ) : null}
          </div>
          <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
            {card.occurredDate.slice(8, 10)}일
          </span>
        </div>
        <p className="mt-2 text-[11.5px]">
          <span className="text-muted-foreground">언제 </span>
          {when}
        </p>
        {card.why ? (
          <p className="mt-1 line-clamp-2 text-[11.5px]">
            <span className="text-muted-foreground">왜 </span>
            {card.why}
          </p>
        ) : null}
        {card.what ? (
          <p className="mt-1 line-clamp-2 text-[11.5px]">
            <span className="text-muted-foreground">무엇을 </span>
            {card.what}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
