import { ListGroupInset } from '@/components/ui/list-group'
import { cn } from '@/lib/utils'
import type { PersonView } from '@/stackflow/stackflow.config'

// 프로필↔타임라인은 화면 push가 아니라 Person activity 안의 step 전환이다.
// (토글할 때마다 히스토리가 쌓이던 구 라우트 구조를 대체)
export function PersonTabNav({
  active,
  onSelect,
}: {
  active: PersonView
  onSelect: (view: PersonView) => void
}) {
  const inactiveClass =
    'bg-muted text-muted-foreground hover:text-foreground dark:bg-muted/60'
  const activeClass = 'bg-foreground text-background shadow-sm'

  return (
    <ListGroupInset className="flex gap-1 bg-muted/40 p-1 dark:bg-muted/25">
      {(
        [
          ['profile', '프로필'],
          ['timeline', '타임라인'],
        ] as const
      ).map(([view, label]) => (
        <button
          key={view}
          type="button"
          onClick={() => onSelect(view)}
          className={cn(
            'flex flex-1 items-center justify-center rounded-lg py-2.5 text-[13px] font-extrabold transition-colors',
            active === view ? activeClass : inactiveClass,
          )}
        >
          {label}
        </button>
      ))}
    </ListGroupInset>
  )
}
