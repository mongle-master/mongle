import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Check,
  Moon,
  Palette,
  Pencil,
  Plus,
  Sun,
  Trash2,
  X,
} from 'lucide-react'
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
  RELATION_TAG_COLOR_OPTIONS,
  RELATION_TAG_COLOR_PALETTE,
  coloredTagStyle,
  normalizeChipColor,
  tagChipClass,
} from '@/components/ui/tag-chip'
import { createChip, deleteChip, fetchChips, renameChip } from '@/lib/api/chips'
import type { ChipResponse, ChipType } from '@/lib/api/types'
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
    queryFn: (): Promise<ChipResponse[]> => fetchChips(),
  })

  const chips = (chipsQuery.data ?? []).filter((chip: ChipResponse) =>
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
            <li
              key={chip.id}
              className={editingId === chip.id ? 'w-full' : 'max-w-full'}
            >
              {editingId === chip.id ? (
                <div className="flex w-full max-w-full flex-col gap-3 rounded-xl border border-border bg-muted/35 p-3">
                  <div className="flex h-10 max-w-full items-center gap-1 rounded-lg border border-border bg-background px-2 pl-3">
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
                      className="h-7 min-w-0 border-0 bg-transparent px-0 text-[14px] font-extrabold shadow-none focus-visible:ring-0 md:text-[14px]"
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(chip.id)}
                      disabled={!editLabel.trim() || renameMutation.isPending}
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-primary hover:bg-primary/10 disabled:opacity-40"
                      aria-label="저장"
                    >
                      <Check className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="수정 취소"
                    >
                      <X className="size-4" />
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
                <TagRowChip
                  chip={chip}
                  supportsColor={supportsColor}
                  onEdit={() => startEdit(chip)}
                  onDelete={() => handleDelete(chip.id, chip.label)}
                  deletePending={deleteMutation.isPending}
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-3 text-xs font-medium text-muted-foreground">
          아직 등록된 태그가 없어요.
        </p>
      )}

      <ListGroupInset className="flex items-center gap-2 px-3">
        {supportsColor ? (
          <span
            className="size-6 shrink-0 rounded-full border border-background shadow-sm ring-1 ring-border"
            style={{ backgroundColor: normalizeChipColor(draftColor) }}
            aria-hidden
          />
        ) : null}
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
        <RelationTagColorPicker
          className="mt-2"
          value={draftColor}
          onChange={setDraftColor}
        />
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

function TagRowChip({
  chip,
  supportsColor,
  onEdit,
  onDelete,
  deletePending,
}: {
  chip: ChipResponse
  supportsColor: boolean
  onEdit: () => void
  onDelete: () => void
  deletePending: boolean
}) {
  const color = supportsColor ? normalizeChipColor(chip.color) : null

  return (
    <div
      className={tagChipClass(false, {
        inactiveClassName:
          'h-9 max-w-full border-border/60 bg-background px-2.5 pr-1.5 text-foreground',
        className: 'inline-flex items-center gap-1.5',
      })}
      style={color ? coloredTagStyle(color) : undefined}
    >
      {color ? (
        <span
          className="size-4 shrink-0 rounded-full border-2 border-background shadow-sm ring-1 ring-black/10"
          style={{ backgroundColor: color }}
          title={color}
          aria-label={`지정 색상 ${color}`}
        />
      ) : null}
      <span className="min-w-0 truncate">{chip.label}</span>
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          onClick={onEdit}
          className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="태그 수정"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={deletePending}
          className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:text-destructive"
          aria-label="삭제"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

function RelationTagColorPicker({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const normalized = normalizeChipColor(value)
  const selectedOption = RELATION_TAG_COLOR_OPTIONS.find(
    (option) => option.value === normalized,
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/35 px-3 text-left transition-colors hover:bg-muted/60',
          className,
        )}
        aria-label="색상 선택"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="size-7 shrink-0 rounded-full border border-background shadow-sm ring-1 ring-border"
            style={{ backgroundColor: normalized }}
            aria-hidden
          />
          <span className="min-w-0 truncate text-xs font-extrabold text-foreground">
            {selectedOption?.label ?? normalized}
          </span>
        </div>
        <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-[11px] font-extrabold text-muted-foreground">
          <Palette className="size-3.5" />
          변경
        </span>
      </button>

      <ColorPickerModal
        open={open}
        value={normalized}
        onOpenChange={setOpen}
        onChange={onChange}
      />
    </>
  )
}

function ColorPickerModal({
  open,
  value,
  onOpenChange,
  onChange,
}: {
  open: boolean
  value: string
  onOpenChange: (open: boolean) => void
  onChange: (value: string) => void
}) {
  if (!open) return null

  const normalized = normalizeChipColor(value)
  const selectedOption = RELATION_TAG_COLOR_OPTIONS.find(
    (option) => option.value === normalized,
  )

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-5">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="닫기"
        onClick={() => onOpenChange(false)}
      />
      <div
        className="relative w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="color-picker-title"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="닫기"
        >
          <X className="size-4" />
        </button>

        <div className="pr-9">
          <h2
            id="color-picker-title"
            className="text-base font-extrabold tracking-tight text-foreground"
          >
            태그 색상
          </h2>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-muted/35 px-3 py-2">
            <span
              className="size-7 shrink-0 rounded-full border border-background shadow-sm ring-1 ring-border"
              style={{ backgroundColor: normalized }}
              aria-hidden
            />
            <span className="text-sm font-extrabold text-foreground">
              {selectedOption?.label ?? normalized}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {RELATION_TAG_COLOR_OPTIONS.map((option) => {
            const active = normalized === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  onOpenChange(false)
                }}
                className={cn(
                  'flex h-14 items-center gap-2 rounded-xl border bg-background px-2.5 text-left transition-all',
                  active
                    ? 'border-foreground ring-2 ring-foreground/15'
                    : 'border-border hover:bg-muted',
                )}
                aria-pressed={active}
              >
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-full border border-background shadow-sm ring-1 ring-black/10"
                  style={{ backgroundColor: option.value }}
                >
                  {active ? (
                    <Check
                      className={cn(
                        'size-4 stroke-[3]',
                        isLightColor(option.value)
                          ? 'text-zinc-950'
                          : 'text-white',
                      )}
                    />
                  ) : null}
                </span>
                <span className="min-w-0 truncate text-xs font-extrabold text-foreground">
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function isLightColor(color: string) {
  const hex = normalizeChipColor(color).slice(1)
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}
