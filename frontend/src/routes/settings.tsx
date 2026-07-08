import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { HomePeriodToggle } from '@/components/home/period-toggle'
import { AppShell } from '@/components/layout/app-shell'
import { MongleLogo } from '@/components/brand/mongle-logo'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createChip, deleteChip, fetchChips, renameChip } from '@/lib/api/chips'
import { safeApi } from '@/lib/api/safe'
import type { ChipResponse, ChipType } from '@/lib/api/types'
import { FALLBACK_CHIPS } from '@/lib/fallback-data'
import { getDefaultHomePeriod, setDefaultHomePeriod } from '@/lib/home-period'
import type { HomePeriod } from '@/lib/home-period'
import { isImeComposing } from '@/lib/keyboard'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

const TAG_GROUPS = [
  { type: 'CATEGORY' as const, label: '만남' },
  { type: 'RELATION_TAG' as const, label: '관계' },
] satisfies ReadonlyArray<{ type: ChipType; label: string }>

function SettingsPage() {
  return (
    <AppShell activePath="/settings">
      <MongleLogo className="mb-2 text-foreground" />
      <h1 className="text-[22px] font-extrabold tracking-tight">설정</h1>
      <p className="mt-1 mb-6 text-xs text-muted-foreground">
        태그 관리와 앱 정보
      </p>

      <HomePeriodSettingSection />

      <TagManagementSection />

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
      <p className="font-extrabold">홈에서 기본으로 보여줄 기간</p>
      <HomePeriodToggle value={period} onChange={handleChange} />
    </Card>
  )
}

const MANAGED_TAG_TYPES = new Set<ChipType>(['CATEGORY', 'RELATION_TAG'])

function TagManagementSection() {
  const queryClient = useQueryClient()
  const chipsQuery = useQuery<ChipResponse[]>({
    queryKey: queryKeys.chips,
    queryFn: (): Promise<ChipResponse[]> => safeApi(fetchChips, FALLBACK_CHIPS),
    initialData: FALLBACK_CHIPS,
  })

  const chips = chipsQuery.data.filter((chip: ChipResponse) =>
    MANAGED_TAG_TYPES.has(chip.type),
  )

  return (
    <section>
      <h2 className="mb-3 text-sm font-extrabold">태그 관리</h2>
      <div className="flex flex-col gap-4">
        {TAG_GROUPS.map((group) => (
          <TagTypePanel
            key={group.type}
            type={group.type}
            label={group.label}
            chips={chips.filter((c: ChipResponse) => c.type === group.type)}
            onChanged={() =>
              queryClient.invalidateQueries({ queryKey: queryKeys.chips })
            }
          />
        ))}
      </div>
    </section>
  )
}

function TagTypePanel({
  type,
  label,
  chips,
  onChanged,
}: {
  type: ChipType
  label: string
  chips: ChipResponse[]
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
      setEditLabel('')
      onChanged()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteChip,
    onSuccess: onChanged,
  })

  const cancelEdit = () => {
    setEditingId(null)
    setEditLabel('')
  }

  const startEdit = (chip: ChipResponse) => {
    setEditingId(chip.id)
    setEditLabel(chip.label)
  }

  const saveEdit = (chipId: number) => {
    const trimmed = editLabel.trim()
    if (!trimmed || renameMutation.isPending) return
    renameMutation.mutate({ id: chipId, chipLabel: trimmed })
  }

  const handleDelete = (chipId: number, chipLabel: string) => {
    const ok = window.confirm(
      `'${chipLabel}' 태그를 지우면 관련된 태그 정보도 함께 삭제돼요.\n정말 지울까요?`,
    )
    if (ok) deleteMutation.mutate(chipId)
  }

  return (
    <Card className="border-border/80 bg-card/60 p-4 shadow-none">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-extrabold">{label}</p>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
          {chips.length}개
        </span>
      </div>
      <ul className="mb-4 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <li key={chip.id} className="max-w-full">
            {editingId === chip.id ? (
              <div className="flex h-9 max-w-full items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2 pl-3">
                <Input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (isImeComposing(e)) return
                    if (e.key === 'Enter') saveEdit(chip.id)
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  maxLength={10}
                  autoFocus
                  disabled={renameMutation.isPending}
                  className="h-6 min-w-20 max-w-28 border-0 bg-transparent px-0 text-[13px] font-extrabold shadow-none focus-visible:ring-0 md:text-[13px]"
                />
                <button
                  type="button"
                  onClick={() => saveEdit(chip.id)}
                  disabled={!editLabel.trim() || renameMutation.isPending}
                  className="flex size-6 shrink-0 items-center justify-center rounded-full text-primary hover:bg-primary/10 disabled:opacity-40"
                  aria-label="저장"
                >
                  <Check className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="수정 취소"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <div className="group/tag inline-flex h-9 max-w-full items-center gap-1 rounded-full border border-border/80 bg-background px-3 text-[13px] font-extrabold shadow-xs transition-colors hover:border-foreground/20 hover:bg-muted/40">
                <span className="min-w-0 truncate">{chip.label}</span>
                <div className="-mr-1 flex shrink-0 items-center gap-0.5">
                  {chip.personal ? (
                    <button
                      type="button"
                      onClick={() => startEdit(chip)}
                      className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
                      aria-label="이름 수정"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleDelete(chip.id, chip.label)}
                    disabled={deleteMutation.isPending}
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-background',
                      'hover:text-destructive',
                    )}
                    aria-label="삭제"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-background/70 p-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="새 태그 이름 (10자 이내)"
          maxLength={10}
          onKeyDown={(e) => {
            if (isImeComposing(e)) return
            if (
              e.key === 'Enter' &&
              draft.trim() &&
              !createMutation.isPending
            ) {
              createMutation.mutate(draft.trim())
            }
          }}
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        <Button
          variant="outline"
          size="sm"
          disabled={!draft.trim() || createMutation.isPending}
          onClick={() => createMutation.mutate(draft.trim())}
          className="rounded-full"
        >
          <Plus className="size-3.5" />
          추가
        </Button>
      </div>
    </Card>
  )
}
