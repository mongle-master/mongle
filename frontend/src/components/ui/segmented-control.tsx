import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

// 동일 폭 세그먼트 전제의 슬라이딩 인디케이터 탭.
// 활성 스타일(bg-foreground + 반전 텍스트)을 통째로 복제한 오버레이를
// clip-path로 활성 세그먼트만 보이게 잘라 이동시킨다 — 인디케이터가
// 미끄러질 때 텍스트 색이 어중간하게 섞이지 않고 iOS처럼 마스킹된다.
// 컨테이너 배경/패딩은 호출부(ListGroupInset 등)가 책임진다.
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  className,
}: {
  value: T
  onValueChange: (value: T) => void
  options: readonly { value: T; label: string }[]
  className?: string
}) {
  const count = options.length
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const clipPath = `inset(0 ${((count - 1 - activeIndex) / count) * 100}% 0 ${(activeIndex / count) * 100}% round var(--radius-lg))`

  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      // radix single 그룹은 활성 항목 재클릭 시 ''로 해제하려 든다 — 세그먼트 탭은 항상 하나가 선택돼야 한다.
      onValueChange={(next) => {
        if (next) onValueChange(next as T)
      }}
      className={cn('relative flex w-full', className)}
    >
      {options.map((option) => (
        <ToggleGroupPrimitive.Item
          key={option.value}
          value={option.value}
          className="flex flex-1 items-center justify-center rounded-lg py-2.5 text-[13px] font-extrabold text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {option.label}
        </ToggleGroupPrimitive.Item>
      ))}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex bg-foreground text-background shadow-sm transition-[clip-path] duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
        style={{ clipPath }}
      >
        {options.map((option) => (
          <span
            key={option.value}
            className="flex flex-1 items-center justify-center py-2.5 text-[13px] font-extrabold"
          >
            {option.label}
          </span>
        ))}
      </div>
    </ToggleGroupPrimitive.Root>
  )
}
