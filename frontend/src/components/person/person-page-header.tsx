import { useFlow } from '@stackflow/react'
import { ChevronLeft } from 'lucide-react'
import { PersonTabNav } from '@/components/person/person-tab-nav'
import type { PersonView } from '@/stackflow/stackflow.config'

export function PersonPageHeader({
  active,
  onSelectView,
}: {
  active: PersonView
  onSelectView: (view: PersonView) => void
}) {
  const { pop } = useFlow()

  return (
    <header className="shrink-0 pb-4">
      <button
        type="button"
        onClick={() => pop()}
        className="mb-4 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="뒤로 가기"
      >
        <ChevronLeft className="size-6" />
      </button>
      <PersonTabNav active={active} onSelect={onSelectView} />
    </header>
  )
}
