import { BackButton } from '@/components/layout/back-button'
import { PersonTabNav } from '@/components/person/person-tab-nav'
import type { PersonView } from '@/stackflow/stackflow.config'

export function PersonPageHeader({
  active,
  onSelectView,
  onBack,
}: {
  active: PersonView
  onSelectView: (view: PersonView) => void
  onBack: () => void
}) {
  return (
    <header className="shrink-0 pb-4">
      <BackButton onClick={onBack} className="mb-4" />
      <PersonTabNav active={active} onSelect={onSelectView} />
    </header>
  )
}
