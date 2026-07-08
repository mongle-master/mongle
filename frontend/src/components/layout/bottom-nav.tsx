import { Link } from '@tanstack/react-router'
import { Clock, Home, Plus, Settings, Users } from 'lucide-react'
import type { MouseEvent } from 'react'
import { useAppRouter } from '@/hooks/use-app-router'
import { isInApp } from '@/lib/app-bridge'
import { cn } from '@/lib/utils'

type TabItem =
  | { kind: 'link'; to: string; label: string; icon: typeof Home }
  | { kind: 'fab'; to: '/record' }

const tabs: TabItem[] = [
  { kind: 'link', to: '/', label: '홈', icon: Home },
  { kind: 'link', to: '/timeline', label: '타임라인', icon: Clock },
  { kind: 'fab', to: '/record' },
  { kind: 'link', to: '/people', label: '사람', icon: Users },
  { kind: 'link', to: '/settings', label: '설정', icon: Settings },
]

export function BottomNav({ activePath }: { activePath: string }) {
  const { push } = useAppRouter()
  // 앱 안에서는 <Link> 기본 이동을 막고 브리지로 태운다(탭=홈 내 SPA / 스택→탭 복귀 자동 분기).
  // 브라우저에서는 개입하지 않아 <Link> 시맨틱(미들클릭·prefetch)이 그대로 유지된다.
  const handleAppNav = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isInApp()) return
    e.preventDefault()
    push(href)
  }
  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-border bg-background">
      <div className="mx-auto flex h-[4.75rem] max-w-md items-end justify-around px-2 pb-3">
        {tabs.map((tab) => {
          if (tab.kind === 'fab') {
            return (
              <Link
                key="record"
                to="/record"
                search={{ personId: undefined, eventId: undefined }}
                onClick={handleAppNav('/record')}
                className="-mt-5 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
              >
                <Plus className="size-6" />
              </Link>
            )
          }

          const isActive =
            activePath !== '/record' &&
            (tab.to === '/'
              ? activePath === '/'
              : activePath.startsWith(tab.to))

          const Icon = tab.icon
          return (
            <Link
              key={tab.to}
              to={tab.to}
              onClick={handleAppNav(tab.to)}
              className={cn(
                'flex flex-col items-center gap-1 text-[11px] font-bold',
                isActive ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              <Icon className="size-5" />
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
