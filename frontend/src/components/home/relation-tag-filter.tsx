import type { ChipRef } from '@/apis/generated/mongle-api.schemas'
import { coloredTagStyle } from '@/lib/relation-tag-colors'
import { cn } from '@/lib/utils'

// 홈 궤도의 관계태그 필터. 여러 태그를 고르면 OR로 흐려 보기 — 시안 A의
// "숨기지 않고 흐리기" 정책이라 서버 필터 대신 클라이언트 흐림으로 쓴다.
export function RelationTagFilter({
  tags,
  selectedIds,
  onToggle,
  onClear,
}: {
  tags: ChipRef[]
  selectedIds: number[]
  onToggle: (tagId: number) => void
  onClear: () => void
}) {
  const noneSelected = selectedIds.length === 0

  return (
    <div
      className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label="관계태그 필터"
    >
      <button
        type="button"
        onClick={onClear}
        aria-pressed={noneSelected}
        className={cn(
          'inline-flex h-8 shrink-0 items-center rounded-full border px-3.5 text-label font-medium transition-colors',
          noneSelected
            ? 'border-foreground bg-foreground text-background'
            : 'border-border bg-card text-foreground',
        )}
      >
        전체
      </button>
      {tags.map((tag) => {
        const selected = selectedIds.includes(tag.id)
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onToggle(tag.id)}
            aria-pressed={selected}
            className={cn(
              'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-label font-medium transition-colors',
              !selected && 'border-border bg-card text-foreground',
            )}
            style={selected ? coloredTagStyle(tag.color) : undefined}
          >
            <span
              className="size-1.5 rounded-full"
              style={{
                backgroundColor: selected
                  ? 'currentColor'
                  : (tag.color ?? 'currentColor'),
              }}
            />
            {tag.label}
          </button>
        )
      })}
    </div>
  )
}
