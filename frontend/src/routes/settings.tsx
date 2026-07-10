import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Moon, Pencil, Plus, Sun, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { HomePeriodToggle } from '@/components/home/period-toggle'
import { AppShell } from '@/components/layout/app-shell'
import { MongleLogo } from '@/components/brand/mongle-logo'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { ConfirmPopup } from '@/components/ui/confirm-popup'
import { Input } from '@/components/ui/input'
import {
  ListGroup,
  ListGroupInset,
  ListGroupItem,
  ListGroupLabel,
} from '@/components/ui/list-group'
import {
  RELATION_TAG_COLOR_PALETTE,
  coloredTagStyle,
  normalizeChipColor,
  tagChipClass,
} from '@/components/ui/tag-chip'
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
  {
    type: 'CATEGORY' as const,
    label: '만남',
  },
  {
    type: 'RELATION_TAG' as const,
    label: '관계',
  },
] satisfies ReadonlyArray<{
  type: ChipType
  label: string
}>

function SettingsPage() {
  return (
    <AppShell activePath="/settings" layout="fixed">
      <header className="shrink-0 pb-4">
        <MongleLogo className="mb-5 text-foreground" />
        <h1 className="text-[22px] font-black leading-tight tracking-tight text-foreground">
          설정
        </h1>
      </header>

      <div className="min-h-0 min-w-0 flex-1 space-y-6 overflow-y-auto pb-24 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]">
        <HomePeriodSettingSection />
        <TagManagementSection />
        <ThemeSettingSection />
        <AppInfoSection />
      </div>
    </AppShell>
  )
}

function ThemeSettingSection() {
  const { theme, setTheme } = useTheme()

  return (
    <section>
      <ListGroupLabel>화면</ListGroupLabel>
      <ListGroup>
        <ListGroupItem withDivider={false}>
          <p className="mb-3 text-[13px] font-extrabold text-foreground">
            화면 모드
          </p>
          <ListGroupInset className="flex gap-1 p-1">
            <ThemeOption
              active={theme === 'light'}
              icon={Sun}
              label="라이트"
              onClick={() => setTheme('light')}
            />
            <ThemeOption
              active={theme === 'dark'}
              icon={Moon}
              label="다크"
              onClick={() => setTheme('dark')}
            />
          </ListGroupInset>
        </ListGroupItem>
      </ListGroup>
    </section>
  )
}

function ThemeOption({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: typeof Sun
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-[13px] font-extrabold transition-colors',
        active
          ? 'bg-foreground text-background shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}

function HomePeriodSettingSection() {
  const [period, setPeriod] = useState<HomePeriod>(() => getDefaultHomePeriod())

  const handleChange = (next: HomePeriod) => {
    setPeriod(next)
    setDefaultHomePeriod(next)
  }

  return (
    <section>
      <ListGroupLabel>홈 표시</ListGroupLabel>
      <ListGroup>
        <ListGroupItem withDivider={false}>
          <p className="mb-1 text-[13px] font-extrabold text-foreground">
            기본으로 보여줄 기간
          </p>
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            관계도에 처음 보이는 사람 범위를 정해요
          </p>
          <HomePeriodToggle value={period} onChange={handleChange} />
        </ListGroupItem>
      </ListGroup>
    </section>
  )
}

function AppInfoSection() {
  return (
    <section>
      <ListGroupLabel>정보</ListGroupLabel>
      <ListGroup>
        <ListGroupItem withDivider={false}>
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-extrabold text-foreground">
              Mongle
            </span>
            <span className="text-xs font-bold text-muted-foreground">MVP</span>
          </div>
        </ListGroupItem>
      </ListGroup>
    </section>
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
      <ListGroupLabel>태그 관리</ListGroupLabel>
      <ListGroup>
        {TAG_GROUPS.map((group, index) => (
          <TagTypePanel
            key={group.type}
            type={group.type}
            label={group.label}
            chips={chips.filter((c: ChipResponse) => c.type === group.type)}
            withDivider={index < TAG_GROUPS.length - 1}
            onChanged={() =>
              queryClient.invalidateQueries({ queryKey: queryKeys.chips })
            }
          />
        ))}
      </ListGroup>
    </section>
  )
}

function TagTypePanel({
  type,
  label,
  chips,
  withDivider,
  onChanged,
}: {
  type: ChipType
  label: string
  chips: ChipResponse[]
  withDivider: boolean
  onChanged: () => void
}) {
  const supportsColor = type === 'RELATION_TAG'
  const [draft, setDraft] = useState('')
  const [draftColor, setDraftColor] = useState<string>(
    () => RELATION_TAG_COLOR_PALETTE[0],
  )
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editColor, setEditColor] = useState<string>(
    () => RELATION_TAG_COLOR_PALETTE[0],
  )
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number
    label: string
  } | null>(null)

  const createMutation = useMutation({
    mutationFn: ({
      chipLabel,
      color,
    }: {
      chipLabel: string
      color?: string | null
    }) => createChip(type, chipLabel, color),
    onSuccess: () => {
      setDraft('')
      setDraftColor(
        RELATION_TAG_COLOR_PALETTE[
          chips.length % RELATION_TAG_COLOR_PALETTE.length
        ],
      )
      onChanged()
    },
  })

  const renameMutation = useMutation({
    mutationFn: ({
      id,
      chipLabel,
      color,
    }: {
      id: number
      chipLabel: string
      color?: string | null
    }) => renameChip(id, chipLabel, color),
    onSuccess: () => {
      setEditingId(null)
      setEditLabel('')
      setEditColor(RELATION_TAG_COLOR_PALETTE[0])
      onChanged()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteChip,
    onSuccess: () => {
      setDeleteTarget(null)
      onChanged()
    },
  })

  const cancelEdit = () => {
    setEditingId(null)
    setEditLabel('')
    setEditColor(RELATION_TAG_COLOR_PALETTE[0])
  }

  const startEdit = (chip: ChipResponse) => {
    setEditingId(chip.id)
    setEditLabel(chip.label)
    setEditColor(normalizeChipColor(supportsColor ? chip.color : null))
  }

  const saveEdit = (chipId: number) => {
    const trimmed = editLabel.trim()
    if (!trimmed || renameMutation.isPending) return
    renameMutation.mutate({
      id: chipId,
      chipLabel: trimmed,
      color: supportsColor ? editColor : null,
    })
  }

  const handleDelete = (chipId: number, chipLabel: string) => {
    setDeleteTarget({ id: chipId, label: chipLabel })
  }

  return (
    <ListGroupItem withDivider={withDivider}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-extrabold text-foreground">{label}</p>
        </div>
        <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
          {chips.length}개
        </span>
      </div>

      {chips.length > 0 ? (
        <ul className="mb-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <li key={chip.id} className="max-w-full">
              {editingId === chip.id ? (
                <div className="flex max-w-full flex-col gap-2 rounded-2xl border border-primary/30 bg-background p-2">
                  <div className="flex h-9 max-w-full items-center gap-1 rounded-full px-1 pl-3">
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
                  {supportsColor ? (
                    <RelationTagColorPicker
                      value={editColor}
                      onChange={setEditColor}
                    />
                  ) : null}
                </div>
              ) : (
                <div
                  className={tagChipClass(false, {
                    inactiveClassName:
                      'h-9 max-w-full border-border/60 bg-background px-3 pr-1.5 text-foreground',
                    className: 'inline-flex items-center gap-0.5',
                  })}
                  style={
                    supportsColor && chip.color
                      ? coloredTagStyle(chip.color)
                      : undefined
                  }
                >
                  <span className="min-w-0 truncate">{chip.label}</span>
                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() => startEdit(chip)}
                      className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="태그 수정"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(chip.id, chip.label)}
                      disabled={deleteMutation.isPending}
                      className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:text-destructive"
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
      ) : (
        <p className="mb-3 text-xs font-medium text-muted-foreground">
          아직 등록된 태그가 없어요.
        </p>
      )}

      <ListGroupInset className="flex items-center gap-2">
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
              createMutation.mutate({
                chipLabel: draft.trim(),
                color: supportsColor ? draftColor : null,
              })
            }
          }}
          className="h-9 border-0 bg-transparent text-[14px] shadow-none focus-visible:ring-0"
        />
        <Button
          variant="outline"
          size="sm"
          disabled={!draft.trim() || createMutation.isPending}
          onClick={() =>
            createMutation.mutate({
              chipLabel: draft.trim(),
              color: supportsColor ? draftColor : null,
            })
          }
          className="h-9 shrink-0 rounded-full border-border/60 bg-background px-3 font-extrabold"
        >
          <Plus className="size-3.5" />
          추가
        </Button>
      </ListGroupInset>
      {supportsColor ? (
        <RelationTagColorPicker value={draftColor} onChange={setDraftColor} />
      ) : null}

      <ConfirmPopup
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="태그를 삭제할까요?"
        description={
          deleteTarget
            ? `'${deleteTarget.label}' 태그를 지우면 관련된 태그 정보도 함께 삭제돼요.`
            : ''
        }
        confirmLabel="삭제"
        destructive
        pending={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
        }}
      />
    </ListGroupItem>
  )
}

function RelationTagColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const normalized = normalizeChipColor(value)

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {RELATION_TAG_COLOR_PALETTE.map((color) => {
        const active = normalized === color
        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              'size-7 rounded-full border border-background shadow-sm ring-offset-2 ring-offset-background transition-all',
              active ? 'ring-2 ring-foreground' : 'ring-1 ring-border/70',
            )}
            style={{ backgroundColor: color }}
            aria-label={`${color} 선택`}
          />
        )
      })}
      <label className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background">
        <span
          className="size-5 rounded-full"
          style={{ backgroundColor: normalized }}
        />
        <input
          type="color"
          value={normalized}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          aria-label="커스텀 색상 선택"
        />
      </label>
    </div>
  )
}
