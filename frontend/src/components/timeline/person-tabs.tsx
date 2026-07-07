import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

export function PersonTabs({
  personId,
  active,
}: {
  personId: string
  active: 'timeline' | 'profile'
}) {
  return (
    <div className="mb-4 flex gap-2 px-5">
      <TabLink
        to="/people/$personId/timeline"
        params={{ personId }}
        active={active === 'timeline'}
      >
        타임라인
      </TabLink>
      <TabLink
        to="/people/$personId"
        params={{ personId }}
        active={active === 'profile'}
      >
        프로필
      </TabLink>
    </div>
  )
}

function TabLink({
  to,
  params,
  active,
  children,
}: {
  to: string
  params: { personId: string }
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      params={params}
      className={cn(
        'rounded-full px-4 py-1.5 text-sm font-extrabold',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground',
      )}
    >
      {children}
    </Link>
  )
}
