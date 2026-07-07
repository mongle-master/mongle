import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fetchChips } from '@/lib/api/chips'
import { createPerson } from '@/lib/api/persons'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/people/new')({
  component: NewPersonPage,
})

function NewPersonPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [relationType, setRelationType] = useState('')
  const [relationTagChipIds, setRelationTagChipIds] = useState<number[]>([])
  const [favorite, setFavorite] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const chipsQuery = useQuery({
    queryKey: queryKeys.chips,
    queryFn: fetchChips,
  })
  const relationTags = (chipsQuery.data ?? []).filter(
    (c) => c.type === 'RELATION_TAG',
  )

  const createMutation = useMutation({
    mutationFn: createPerson,
    onSuccess: async (person) => {
      await queryClient.invalidateQueries({ queryKey: ['persons'] })
      await queryClient.invalidateQueries({ queryKey: ['home'] })
      void navigate({
        to: '/people/$personId',
        params: { personId: String(person.id) },
      })
    },
    onError: () => setError('사람을 등록하지 못했어요. 다시 시도해 주세요.'),
  })

  const toggleTag = (id: number) => {
    setRelationTagChipIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('이름을 입력해 주세요.')
      return
    }
    createMutation.mutate({
      name: name.trim(),
      relationType: relationType.trim() || null,
      relationTagChipIds,
      favorite,
    })
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-background px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-10">
      <button
        type="button"
        onClick={() => navigate({ to: '/' })}
        className="mb-4 flex items-center gap-1 text-sm font-bold text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        돌아가기
      </button>

      <h1 className="text-[22px] font-extrabold tracking-tight">사람 추가</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <div>
          <Label htmlFor="name">이름</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5"
            autoFocus
          />
        </div>

        <div>
          <Label htmlFor="relationType">관계 (선택)</Label>
          <Input
            id="relationType"
            value={relationType}
            onChange={(e) => setRelationType(e.target.value)}
            placeholder="예: 친구, 동료"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label className="mb-2 block">관계 태그</Label>
          <div className="flex flex-wrap gap-2">
            {relationTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm font-bold',
                  relationTagChipIds.includes(tag.id)
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-card',
                )}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-bold">
          <input
            type="checkbox"
            checked={favorite}
            onChange={(e) => setFavorite(e.target.checked)}
            className="size-4 rounded border-border"
          />
          즐겨찾기
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" size="lg" disabled={createMutation.isPending}>
          {createMutation.isPending ? '등록 중…' : '등록하기'}
        </Button>
      </form>
    </div>
  )
}
