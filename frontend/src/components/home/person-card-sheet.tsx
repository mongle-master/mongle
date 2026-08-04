import { Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { PersonNode } from '@/apis/generated/mongle-api.schemas'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { TagChip } from '@/components/ui/tag-chip'
import { defaultPersonImageUrl } from '@/lib/default-person-image'
import { daysSinceDate, formatPersonName, monogram } from '@/lib/format'
import { optimizedImageUrl } from '@/lib/image-url'
import {
  formatDaysSinceLastMeet,
  formatKnownDuration,
} from '@/lib/relation-orbit-layout'

// 궤도에서 노드를 탭하면 뜨는 관계 카드. 지도를 떠나지 않고 최근 관계 요약과
// 다음 행동(기록/프로필)을 준다 — 시안 A의 '미시' 축. 만남 리듬·감정 분포는
// 데이터 출처가 없어 꾸며내지 않는다(백엔드 집계 API가 생기면 추가).
export function PersonCardSheet({
  person,
  distant,
  onOpenChange,
  onRecord,
  onProfile,
}: {
  person: PersonNode | null
  distant: boolean
  onOpenChange: (open: boolean) => void
  onRecord: (personId: number) => void
  onProfile: (personId: number) => void
}) {
  // 닫히는 애니메이션 동안 person이 null로 바뀌어도 카드가 먼저 사라지지 않게
  // 마지막 인물 데이터를 붙잡아 둔다.
  const [lastPerson, setLastPerson] = useState<PersonNode | null>(person)
  useEffect(() => {
    if (person) setLastPerson(person)
  }, [person])
  const shown = person ?? lastPerson

  const displayName = shown ? formatPersonName(shown) : ''
  const knownDays = shown?.firstMetDate
    ? daysSinceDate(shown.firstMetDate)
    : null
  const knownDuration = formatKnownDuration(knownDays)
  const lastMeet = formatDaysSinceLastMeet(shown?.intimacy.daysSinceLastMeet)

  return (
    <Drawer open={person != null} onOpenChange={onOpenChange}>
      <DrawerContent aria-describedby={undefined}>
        {shown ? (
          <div className="px-5 pt-1 pb-5">
            <div className="flex items-center gap-3.5">
              <Avatar className="size-12 border border-border">
                <AvatarImage
                  src={
                    optimizedImageUrl(shown.profileImageUrl, 128) ??
                    defaultPersonImageUrl({
                      id: shown.id,
                      name: shown.name,
                      gender: shown.avatarGender ?? null,
                    })
                  }
                  alt={displayName}
                />
                <AvatarFallback>{monogram(shown.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <DrawerTitle className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.01em]">
                  <span data-amp-mask className="truncate">
                    {displayName}
                  </span>
                  {shown.relationTags.slice(0, 1).map((tag) => (
                    <TagChip
                      key={tag.id}
                      interactive={false}
                      size="sm"
                      color={tag.color}
                    >
                      {tag.label}
                    </TagChip>
                  ))}
                </DrawerTitle>
                <p className="mt-0.5 text-caption text-muted-foreground">
                  {shown.firstMetDate
                    ? `알고 지낸 ${knownDuration} · 함께한 기록 ${shown.recordCount}개`
                    : `함께한 기록 ${shown.recordCount}개`}
                </p>
              </div>
            </div>

            {distant ? (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-warm/20 bg-warm/7 px-3.5 py-3">
                <Moon className="mt-0.5 size-4.5 shrink-0 text-warm" />
                <div>
                  <p className="text-label font-semibold text-foreground">
                    조금 조용해진 관계예요
                  </p>
                  <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
                    가벼운 안부 대신, 오늘의 마음을 기록으로 남겨보는 건
                    어떨까요?
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-secondary px-3 py-2.5">
                <span className="block text-caption text-muted-foreground">
                  마지막 만남
                </span>
                <span className="mt-1 block text-sm font-semibold tracking-[-0.01em]">
                  {lastMeet}
                </span>
              </div>
              <div className="rounded-xl bg-secondary px-3 py-2.5">
                <span className="block text-caption text-muted-foreground">
                  함께한 기록
                </span>
                <span className="mt-1 block text-sm font-semibold tracking-[-0.01em]">
                  {shown.recordCount}개
                </span>
              </div>
              <div className="rounded-xl bg-secondary px-3 py-2.5">
                <span className="block text-caption text-muted-foreground">
                  알고 지낸 시간
                </span>
                <span className="mt-1 block text-sm font-semibold tracking-[-0.01em]">
                  {knownDuration}
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-2.5">
              <Button
                size="cta"
                className="flex-1"
                onClick={() => onRecord(shown.id)}
              >
                기록 남기기
              </Button>
              <Button
                size="cta"
                variant="outline-foreground"
                className="flex-1"
                onClick={() => onProfile(shown.id)}
              >
                프로필 보기
              </Button>
            </div>
          </div>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}
