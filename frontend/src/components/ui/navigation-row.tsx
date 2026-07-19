import { ChevronRight } from 'lucide-react'
import { ListGroupItem } from '@/components/ui/list-group-item'

// 오른쪽 chevron을 가진 라벨 행 버튼. label + onClick만 받고 라우팅/도메인은 호출부가 소유한다.
// tone='destructive'는 인물 삭제 등 되돌릴 수 없는 동작의 시각 경고(라벨·chevron을 destructive 색)로만 쓴다.
// 터치 앱이라 hover(포인터 기기)와 active(누름) 피드백을 함께 유지한다.
export function NavigationRow({
  label,
  onClick,
  tone = 'default',
  withDivider = true,
  disabled = false,
}: {
  label: string
  onClick: () => void
  tone?: 'default' | 'destructive'
  withDivider?: boolean
  disabled?: boolean
}) {
  const isDestructive = tone === 'destructive'

  return (
    <ListGroupItem className="p-0" withDivider={withDivider}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-muted/70 active:opacity-70 disabled:opacity-60"
      >
        <span
          className={
            isDestructive
              ? 'text-body font-extrabold text-destructive'
              : 'text-body font-extrabold text-foreground'
          }
        >
          {label}
        </span>
        <ChevronRight
          className={
            isDestructive
              ? 'size-5 shrink-0 text-destructive/70'
              : 'size-5 shrink-0 text-muted-foreground'
          }
        />
      </button>
    </ListGroupItem>
  )
}
