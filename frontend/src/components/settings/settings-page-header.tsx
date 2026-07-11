import { ChevronLeft } from 'lucide-react'

export function SettingsPageHeader({
  title,
  onBack,
}: {
  title: string
  onBack: () => void
}) {
  return (
    <header className="shrink-0 pb-5">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="뒤로 가기"
      >
        <ChevronLeft className="size-6" />
      </button>
      <h1 className="text-[22px] font-black leading-tight tracking-tight text-foreground">
        {title}
      </h1>
    </header>
  )
}
