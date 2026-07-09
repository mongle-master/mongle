import { Link } from '@tanstack/react-router'
import { ListGroupInset } from '@/components/ui/list-group'
import { cn } from '@/lib/utils'

export function PersonTabNav({
  personId,
  active,
}: {
  personId: string
  active: 'profile' | 'timeline'
}) {
  const inactiveClass =
    'bg-muted text-muted-foreground hover:text-foreground dark:bg-muted/60'
  const activeClass = 'bg-foreground text-background shadow-sm'

  return (
    <ListGroupInset className="flex gap-1 bg-muted/40 p-1 dark:bg-muted/25">
      <Link
        to="/people/$personId"
        params={{ personId }}
        className={cn(
          'flex flex-1 items-center justify-center rounded-lg py-2.5 text-[13px] font-extrabold transition-colors',
          active === 'profile' ? activeClass : inactiveClass,
        )}
      >
        프로필
      </Link>
      <Link
        to="/people/$personId/timeline"
        params={{ personId }}
        className={cn(
          'flex flex-1 items-center justify-center rounded-lg py-2.5 text-[13px] font-extrabold transition-colors',
          active === 'timeline' ? activeClass : inactiveClass,
        )}
      >
        타임라인
      </Link>
    </ListGroupInset>
  )
}
