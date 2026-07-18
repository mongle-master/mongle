import { BackButton } from '@/components/layout/back-button'

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
      <h1 className="text-[22px] font-black leading-tight tracking-tight text-foreground">
        {title}
      </h1>
    </header>
  )
}
