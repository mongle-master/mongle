import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { PersonTabNav } from '@/components/person/person-tab-nav'

export function PersonPageHeader({
  personId,
  active,
}: {
  personId: string
  active: 'profile' | 'timeline'
}) {
  return (
    <header className="shrink-0 pb-4">
      <Link
        to="/people"
        className="mb-4 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="사람 목록으로 돌아가기"
      >
        <ChevronLeft className="size-6" />
      </Link>
      <PersonTabNav personId={personId} active={active} />
    </header>
  )
}
