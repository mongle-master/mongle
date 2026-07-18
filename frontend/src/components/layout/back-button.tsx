import * as React from 'react'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Button의 ghost+icon-lg가 hover(bg-muted/text-foreground)와 size-9를 그대로 준다.
// 다만 Button 기본 모서리는 rounded-lg라 원형 뒤로가기 시각을 위해 rounded-full로 덮고,
// ghost에는 resting 글자색이 없어 text-muted-foreground를 더해 원본과 정지 상태를 맞춘다.
// aria-label은 기본값이며 spread가 뒤에 와서 호출부가 문맥(예: "이름 다시 정하기")에 맞게 덮을 수 있다.
// 여백(mb-4, -ml-2 등)은 호출부 className으로만 받는다 — 이 컴포넌트는 레이아웃 분기를 갖지 않는다.
export function BackButton({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      aria-label="뒤로 가기"
      className={cn('rounded-full text-muted-foreground', className)}
      {...props}
    >
      <ChevronLeft className="size-6" />
    </Button>
  )
}
