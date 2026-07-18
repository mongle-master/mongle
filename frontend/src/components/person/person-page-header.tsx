import { useFlow } from '@stackflow/react'
import { BackButton } from '@/components/layout/back-button'
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
      <BackButton onClick={() => pop()} className="mb-4" />
      <PersonTabNav active={active} onSelect={onSelectView} />
    </header>
  )
}
