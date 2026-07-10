import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Moon, Pencil, Plus, Sun, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { HomePeriodToggle } from '@/components/home/period-toggle'
import { AppShell } from '@/components/layout/app-shell'
import { MongleLogo } from '@/components/brand/mongle-logo'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ListGroup,
  ListGroupFooter,
  ListGroupInset,
  ListGroupItem,
  ListGroupLabel,
} from '@/components/ui/list-group'
import { tagChipClass } from '@/components/ui/tag-chip'
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
    description: '기록 작성 시 선택하는 카테고리',
  },
  {
    type: 'RELATION_TAG' as const,
    label: '관계',
    description: '사람 프로필에 붙이는 관계 태그',
  },
] satisfies ReadonlyArray<{
  type: ChipType
  label: string
  description: string
}>

function SettingsPage() {
  return (
    <AppShell activePath="/settings" layout="fixed">
      <header className="shrink-0 pb-4">
        <MongleLogo className="mb-5 text-foreground" />
        <h1 className="text-[22px] font-black leading-tight tracking-tight text-foreground">
          설정
        </h1>
        <p className="mt-2 text-[15px] font-medium text-muted-foreground">
          태그 관리와 앱 환경을 바꿔요
        </p>
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
      <ListGroupFooter>라이트모드와 다크모드를 전환해요.</ListGroupFooter>
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
            description={group.description}
            chips={chips.filter((c: ChipResponse) => c.type === group.type)}
            withDivider={index < TAG_GROUPS.length - 1}
            onChanged={() =>
              queryClient.invalidateQueries({ queryKey: queryKeys.chips })
            }
          />
        ))}
      </ListGroup>
      <ListGroupFooter>
        만남 태그는 기록에, 관계 태그는 사람 프로필에 사용돼요.
      </ListGroupFooter>
    </section>
  )
}

function TagTypePanel({
  type,
  label,
  description,
  chips,
  withDivider,
  onChanged,
}: {
  type: ChipType
  label: string
  description: string
  chips: ChipResponse[]
  withDivider: boolean
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
    <ListGroupItem withDivider={withDivider}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-extrabold text-foreground">{label}</p>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
            {description}
          </p>
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
                <div className="flex h-9 max-w-full items-center gap-1 rounded-full border border-primary/30 bg-background px-2 pl-3">
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
                <div
                  className={tagChipClass(false, {
                    inactiveClassName:
                      'h-9 max-w-full border-border/60 bg-background px-3 pr-1.5 text-foreground',
                    className: 'inline-flex items-center gap-0.5',
                  })}
                >
                  <span className="min-w-0 truncate">{chip.label}</span>
                  <div className="flex shrink-0 items-center">
                    {chip.personal ? (
                      <button
                        type="button"
                        onClick={() => startEdit(chip)}
                        className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="이름 수정"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                    ) : null}
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
              createMutation.mutate(draft.trim())
            }
          }}
          className="h-9 border-0 bg-transparent text-[14px] shadow-none focus-visible:ring-0"
        />
        <Button
          variant="outline"
          size="sm"
          disabled={!draft.trim() || createMutation.isPending}
          onClick={() => createMutation.mutate(draft.trim())}
          className="h-9 shrink-0 rounded-full border-border/60 bg-background px-3 font-extrabold"
        >
          <Plus className="size-3.5" />
          추가
        </Button>
      </ListGroupInset>
    </ListGroupItem>
  )
}
