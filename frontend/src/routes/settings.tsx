import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { HomePeriodToggle } from '@/components/home/period-toggle'
import { AppShell } from '@/components/layout/app-shell'
import { MongleLogo } from '@/components/brand/mongle-logo'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createChip, deleteChip, fetchChips, renameChip } from '@/lib/api/chips'
import { safeApi } from '@/lib/api/safe'
import type { ChipType } from '@/lib/api/types'
import { FALLBACK_CHIPS } from '@/lib/fallback-data'
import { getDefaultHomePeriod, setDefaultHomePeriod } from '@/lib/home-period'
import type { HomePeriod } from '@/lib/home-period'
import { queryKeys } from '@/lib/query-keys'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

const CHIP_TYPE_LABELS: Record<ChipType, string> = {
  CATEGORY: '카테고리',
  RELATION_TAG: '관계 태그',
}
const MANAGED_CHIP_TYPES = ['CATEGORY', 'RELATION_TAG'] as const

function isManagedChipType(type: string): type is ChipType {
  return (MANAGED_CHIP_TYPES as readonly string[]).includes(type)
}

function SettingsPage() {
  return (
    <AppShell activePath="/settings">
      <MongleLogo className="mb-2 text-foreground" />
      <h1 className="text-[22px] font-extrabold tracking-tight">설정</h1>
      <p className="mt-1 mb-6 text-xs text-muted-foreground">
        칩 관리와 앱 정보
      </p>

      <HomePeriodSettingSection />

      <ChipManagementSection />

      <Card className="mt-6 p-4">
        <p className="font-extrabold">앱 정보</p>
        <p className="mt-1 text-sm text-muted-foreground">Mongle MVP</p>
      </Card>
    </AppShell>
  )
}

function HomePeriodSettingSection() {
  const [period, setPeriod] = useState<HomePeriod>(() => getDefaultHomePeriod())

  const handleChange = (next: HomePeriod) => {
    setPeriod(next)
    setDefaultHomePeriod(next)
  }

  return (
    <Card className="mb-6 p-4">
      <p className="font-extrabold">홈 기본 기간</p>
      <p className="mt-1 mb-3 text-sm text-muted-foreground">
        홈 관계 지도에 처음 보여줄 기간을 정해요
      </p>
      <HomePeriodToggle value={period} onChange={handleChange} />
    </Card>
  )
}

function ChipManagementSection() {
  const queryClient = useQueryClient()
  const chipsQuery = useQuery({
    queryKey: queryKeys.chips,
    queryFn: () => safeApi(fetchChips, FALLBACK_CHIPS),
    initialData: FALLBACK_CHIPS,
  })

  const chips = chipsQuery.data.filter((chip) => isManagedChipType(chip.type))

  return (
    <section>
      <h2 className="mb-3 text-sm font-extrabold">칩 관리</h2>
      <div className="flex flex-col gap-4">
        {MANAGED_CHIP_TYPES.map((type) => (
          <ChipTypePanel
            key={type}
            type={type}
            label={CHIP_TYPE_LABELS[type]}
            chips={chips.filter((c) => c.type === type)}
            onChanged={() =>
              queryClient.invalidateQueries({ queryKey: queryKeys.chips })
            }
          />
        ))}
      </div>
    </section>
  )
}

function ChipTypePanel({
  type,
  label,
  chips,
  onChanged,
}: {
  type: ChipType
  label: string
  chips: typeof FALLBACK_CHIPS
  onChanged: () => void
}) {
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editLabel, setEditLabel] = useState('')

  const createMutation = useMutation({
    mutationFn: (chipLabel: string) => createChip(type, chipLabel),
    onSuccess: () => {
      setDraft('')
      onChanged()
    },
  })

  const renameMutation = useMutation({
    mutationFn: ({ id, chipLabel }: { id: number; chipLabel: string }) =>
      renameChip(id, chipLabel),
    onSuccess: () => {
      setEditingId(null)
      onChanged()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteChip,
    onSuccess: onChanged,
  })

  const handleDelete = (chipId: number, chipLabel: string) => {
    const ok = window.confirm(
      `'${chipLabel}'을 목록에서 지울까요? 이미 기록한 칩은 그대로 남아요.`,
    )
    if (ok) deleteMutation.mutate(chipId)
  }

  return (
    <Card className="p-4">
      <p className="mb-3 font-extrabold">{label}</p>
      <ul className="mb-3 flex flex-col gap-2">
        {chips.map((chip) => (
          <li
            key={chip.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
          >
            {editingId === chip.id ? (
              <div className="flex flex-1 gap-2">
                <Input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  maxLength={10}
                />
                <Button
                  size="sm"
                  onClick={() =>
                    renameMutation.mutate({ id: chip.id, chipLabel: editLabel })
                  }
                >
                  저장
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{chip.label}</span>
                </div>
                {chip.personal ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-xs font-bold text-muted-foreground"
                      onClick={() => {
                        setEditingId(chip.id)
                        setEditLabel(chip.label)
                      }}
                    >
                      이름 변경
                    </button>
                    <button
                      type="button"
                      className="text-xs font-bold text-destructive"
                      onClick={() => handleDelete(chip.id, chip.label)}
                    >
                      지우기
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="새 칩 이름 (10자 이내)"
          maxLength={10}
        />
        <Button
          variant="outline"
          disabled={!draft.trim() || createMutation.isPending}
          onClick={() => createMutation.mutate(draft.trim())}
        >
          ＋ 추가
        </Button>
      </div>
    </Card>
  )
}
