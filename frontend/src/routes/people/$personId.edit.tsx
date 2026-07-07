import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/app-shell'
import { PersonForm, personToFormValues } from '@/components/person/person-form'
import { createChip, fetchChips } from '@/lib/api/chips'
import { deletePerson, fetchPerson, updatePerson } from '@/lib/api/persons'
import { safeApi } from '@/lib/api/safe'
import { FALLBACK_CHIPS, fallbackPersonDetail } from '@/lib/fallback-data'
import { queryKeys } from '@/lib/query-keys'

export const Route = createFileRoute('/people/$personId/edit')({
  component: EditPersonPage,
})

function EditPersonPage() {
  const { personId } = Route.useParams()
  const id = Number(personId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const personQuery = useQuery({
    queryKey: queryKeys.person(id),
    queryFn: () => safeApi(() => fetchPerson(id), fallbackPersonDetail(id)),
    enabled: Number.isFinite(id),
    initialData: fallbackPersonDetail(id),
  })

  const chipsQuery = useQuery({
    queryKey: queryKeys.chips,
    queryFn: () => safeApi(fetchChips, FALLBACK_CHIPS),
    initialData: FALLBACK_CHIPS,
  })

  const person = personQuery.data
  const relationTags = chipsQuery.data.filter((c) => c.type === 'RELATION_TAG')

  const updateMutation = useMutation({
    mutationFn: (body: Parameters<typeof updatePerson>[1]) =>
      updatePerson(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.person(id) })
      await queryClient.invalidateQueries({ queryKey: ['persons'] })
      await queryClient.invalidateQueries({ queryKey: ['home'] })
      void navigate({
        to: '/people/$personId',
        params: { personId },
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deletePerson(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['persons'] })
      await queryClient.invalidateQueries({ queryKey: ['home'] })
      void navigate({ to: '/people' })
    },
  })

  const createTagMutation = useMutation({
    mutationFn: (label: string) => createChip('RELATION_TAG', label),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.chips }),
  })

  const handleDelete = () => {
    const ok = window.confirm(
      '삭제하면 되돌릴 수 없어요. 함께 새긴 기록도 모두 사라져요. 삭제할까요?',
    )
    if (ok) deleteMutation.mutate()
  }

  const initialValues = personToFormValues({
    ...person,
    relationTagChipIds: person.relationTags.map((t) => t.id),
    firstMetDate: person.firstMetDate ?? undefined,
    lastMetDate: person.lastMetDate ?? undefined,
  })

  return (
    <AppShell activePath="/people">
      <Link
        to="/people/$personId"
        params={{ personId }}
        className="mb-4 inline-block text-sm font-bold text-muted-foreground"
      >
        ‹ 프로필
      </Link>

      <h1 className="text-[22px] font-extrabold tracking-tight">프로필 수정</h1>
      <p className="mt-1 mb-6 text-xs text-muted-foreground">
        {person.name}님의 정보를 수정해요
      </p>

      <PersonForm
        key={person.id}
        initialValues={initialValues}
        relationTags={relationTags}
        submitLabel="저장하기"
        pending={updateMutation.isPending || deleteMutation.isPending}
        onCreateRelationTag={async (label) => {
          try {
            const chip = await createTagMutation.mutateAsync(label)
            return chip.id
          } catch {
            return null
          }
        }}
        onSubmit={(request) => updateMutation.mutate(request)}
        onDelete={handleDelete}
      />

      {updateMutation.isError ? (
        <p className="mt-4 text-sm text-destructive">
          저장에 실패했어요. 잠시 후 다시 시도해 주세요.
        </p>
      ) : null}
    </AppShell>
  )
}
