import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { useAppRouter } from '@/hooks/use-app-router'
import { cn } from '@/lib/utils'

/**
 * <Link> 대체 — 웹에선 <a> 시맨틱(SEO·미들클릭·접근성)을 살리고, 앱에선 탭/스택으로 자동 분기.
 * to는 도메인 없는 상대 경로 문자열(예: '/people/1', '/record?eventId=5').
 * 타입 라우팅(params/search)이 필요하면 호출부에서 문자열로 만들어 넘긴다.
 */
export function AppLink({
  to,
  className,
  children,
  ...rest
}: {
  to: string
  className?: string
  children: ReactNode
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'>) {
  const { push } = useAppRouter()
  return (
    <a
      href={to}
      className={cn('cursor-pointer', className)}
      onClick={(e) => {
        e.preventDefault()
        push(to)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
