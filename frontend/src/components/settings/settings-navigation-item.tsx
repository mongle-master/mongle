import { ChevronRight } from 'lucide-react'
import { ListGroupItem } from '@/components/ui/list-group-item'

export function SettingsNavigationItem({
  label,
  onClick,
  withDivider = true,
}: {
  label: string
  onClick: () => void
  withDivider?: boolean
}) {
  return (
    <ListGroupItem className="p-0" withDivider={withDivider}>
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-muted/70"
      >
        <span className="text-body font-extrabold text-foreground">
          {label}
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      </button>
    </ListGroupItem>
  )
}
