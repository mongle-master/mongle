import { cn } from '@/lib/utils'

// push 전환 동안 pending 화면이 빈 배경(라이트 테마 = 흰 화면)으로 슬라이드되어
// 보이지 않도록, 실제 레이아웃의 자리를 흉내 내는 shimmer 플레이스홀더 조각.
// 화면별 스켈레톤을 감싸는 쪽에서 role="status" aria-label="불러오는 중"을 달고,
// 조각 자체는 보조기기에 노출하지 않는다.
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('relative overflow-hidden rounded-md bg-muted', className)}
    >
      <div className="absolute inset-0 animate-skeleton-shimmer bg-gradient-to-r from-transparent via-foreground/8 to-transparent" />
    </div>
  )
}
