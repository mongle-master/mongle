import { Link } from '@tanstack/react-router'
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
        className="mb-4 inline-flex text-[13px] font-extrabold text-muted-foreground"
      >
        ‹ 사람 목록
      </Link>
      <PersonTabNav personId={personId} active={active} />
    </header>
  )
}
