import { SlidersHorizontal } from 'lucide-react'
import type { ChipResponse, PersonResponse } from '@/apis/generated/models'
import {
  TimelineCategoryFilters,
  TimelineFilterReset,
  TimelinePersonFilters,
} from '@/components/timeline/timeline-filters'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

export function TimelineFilterDrawer({
  categoryChips,
  persons,
  selectedCategoryIds,
  selectedPersonIds,
  activeFilterCount,
  hasFilter,
  onToggleCategory,
  onTogglePerson,
  onReset,
}: {
  categoryChips: ChipResponse[]
  persons: PersonResponse[]
  selectedCategoryIds: number[]
  selectedPersonIds: number[]
  activeFilterCount: number
  hasFilter: boolean
  onToggleCategory: (chipId: number) => void
  onTogglePerson: (personId: number) => void
  onReset: () => void
}) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="rounded-full px-3 text-xs font-extrabold"
        >
          {hasFilter ? (
            <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[10px] leading-none text-background">
              {activeFilterCount}
            </span>
          ) : (
            <SlidersHorizontal className="size-3.5" aria-hidden />
          )}
          필터 설정
        </Button>
      </DrawerTrigger>

      <DrawerContent
        aria-describedby={undefined}
        className="mx-auto w-full max-w-md overflow-hidden border-x border-border bg-background shadow-2xl data-[vaul-drawer-direction=bottom]:rounded-t-[5rem]"
      >
        <DrawerHeader className="px-5 pt-5 text-left">
          <DrawerTitle className="text-lg font-extrabold tracking-tight">
            필터 설정
          </DrawerTitle>
        </DrawerHeader>

        <div className="min-h-0 overflow-y-auto px-5 py-2">
          <TimelineCategoryFilters
            chips={categoryChips}
            selectedIds={selectedCategoryIds}
            onToggle={onToggleCategory}
          />

          <TimelinePersonFilters
            persons={persons}
            selectedIds={selectedPersonIds}
            onToggle={onTogglePerson}
          />

          <TimelineFilterReset visible={hasFilter} onReset={onReset} />
        </div>

        <DrawerFooter className="px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <DrawerClose asChild>
            <Button className="h-11 rounded-full font-extrabold">완료</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
