import { BackButton } from '@/components/layout/back-button'
import { PageTitle } from '@/components/ui/page-title'

export function SettingsPageHeader({
  title,
  onBack,
}: {
  title: string
  onBack: () => void
}) {
  return (
    <header className="shrink-0 pb-5">
      <BackButton onClick={onBack} className="mb-4" />
      <PageTitle>{title}</PageTitle>
    </header>
  )
}
