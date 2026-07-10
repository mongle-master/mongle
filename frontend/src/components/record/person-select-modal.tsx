import { Link } from '@tanstack/react-router'
import { Check, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PersonResponse } from '@/lib/api/types'
import { formatPersonName } from '@/lib/format'
import { cn } from '@/lib/utils'

export function PersonSelectModal({
  open,
  onOpenChange,
  persons,
  selectedIds,
  onConfirm,
  dismissible = true,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  persons: PersonResponse[]
  selectedIds: number[]
  onConfirm: (ids: number[]) => void
  /** false면 선택 완료 전까지 닫기 불가 (하단 ＋ 진입 시) */
  dismissible?: boolean
}) {
  const [query, setQuery] = useState('')
  const [draftIds, setDraftIds] = useState<number[]>(selectedIds)

  useEffect(() => {
    if (open) {
      setDraftIds(selectedIds)
      setQuery('')
    }
  }, [open, selectedIds])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return persons
    return persons.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.relationType?.toLowerCase().includes(q) ||
        p.relationTags.some((t) => t.label.toLowerCase().includes(q)),
    )
  }, [persons, query])

  if (!open) return null

  const toggle = (id: number) => {
    setDraftIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  const handleConfirm = () => {
    if (draftIds.length === 0) return
    onConfirm(draftIds)
    onOpenChange(false)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="닫기"
        onClick={handleClose}
      />
      <div
        className="relative flex max-h-[min(78dvh,560px)] w-full max-w-md flex-col rounded-t-xl border border-border bg-background shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="person-select-title"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2
              id="person-select-title"
              className="text-base font-extrabold tracking-tight"
            >
              누구와 함께했나요?
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              한 명 이상 선택해 주세요
            </p>
          </div>
          {dismissible ? (
            <button
              type="button"
              onClick={handleClose}
              className="text-muted-foreground"
              aria-label="닫기"
            >
              <X className="size-5" />
            </button>
          ) : null}
        </div>

        <div className="px-5 pt-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름·관계 유형 검색"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {query.trim()
                ? `'${query.trim()}'에 해당하는 사람이 없어요.`
                : '등록된 사람이 없어요.'}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {filtered.map((person) => {
                const selected = draftIds.includes(person.id)
                const displayName = formatPersonName(person)
                return (
                  <li key={person.id}>
                    <button
                      type="button"
                      onClick={() => toggle(person.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                        selected
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card',
                      )}
                    >
                      <MonogramAvatar
                        name={person.name}
                        imageUrl={person.profileImageUrl}
                        gender={person.gender}
                        personId={person.id}
                        className="size-11 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-extrabold">{displayName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {[
                            person.relationType,
                            person.relationTags.map((t) => t.label).join(' · '),
                          ]
                            .filter(Boolean)
                            .join(' · ') || '관계 정보 없음'}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'flex size-6 shrink-0 items-center justify-center rounded-full border',
                          selected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background',
                        )}
                      >
                        {selected ? <Check className="size-3.5" /> : null}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-border px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Link
            to="/people/new"
            className="inline-flex items-center justify-center gap-1 rounded-full bg-primary/12 py-2.5 text-sm font-extrabold text-primary hover:bg-primary/18"
          >
            <Plus className="size-4" />
            사람 추가
          </Link>
          <Button
            type="button"
            className="h-11 w-full rounded-full text-sm font-extrabold"
            disabled={draftIds.length === 0}
            onClick={handleConfirm}
          >
            선택 완료
            {draftIds.length > 0 ? ` (${draftIds.length}명)` : ''}
          </Button>
        </div>
      </div>
    </div>
  )
}
