import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { EventResponse } from '@/lib/api/types'
import { formatWhen } from '@/lib/format'

export function PersonTimelineCard({ event }: { event: EventResponse }) {
  const when = formatWhen(event.occurredDate, event.occurredTime)

  return (
    <Link
      to="/record"
      search={{ eventId: event.id, personId: undefined }}
      className="block flex-1"
    >
      <Card className="relative shadow-sm transition-colors hover:bg-muted/30">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <h3 className="text-[15.5px] font-extrabold">{event.title}</h3>
            {event.category ? (
              <Badge variant="secondary" className="text-[10px]">
                {event.category.label}
              </Badge>
            ) : null}
          </div>
          {event.emotions.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {event.emotions.map((emotion) => (
                <Badge
                  key={emotion.id}
                  variant="outline"
                  className="text-[10px]"
                >
                  {emotion.label}
                </Badge>
              ))}
            </div>
          ) : null}
          <p className="mt-1.5 text-[11.5px]">
            <span className="text-muted-foreground">언제 </span>
            {when}
          </p>
          {event.why ? (
            <p className="mt-1 text-[11.5px]">
              <span className="text-muted-foreground">왜 만났는지 </span>
              {event.why}
            </p>
          ) : null}
          {event.what ? (
            <p className="mt-1 text-[11.5px]">
              <span className="text-muted-foreground">무엇을 했는지 </span>
              {event.what}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}
