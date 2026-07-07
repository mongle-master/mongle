import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/app-shell'
import { PersonForm, personToFormValues } from '@/components/person/person-form'
import { createChip, fetchChips } from '@/lib/api/chips'
import { createPerson } from '@/lib/api/persons'
import { safeApi } from '@/lib/api/safe'
import { FALLBACK_CHIPS } from '@/lib/fallback-data'
import { queryKeys } from '@/lib/query-keys'

export const Route = createFileRoute('/people/new')({
  component: NewPersonPage,
})

function NewPersonPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const chipsQuery = useQuery({
    queryKey: queryKeys.chips,
    queryFn: () => safeApi(fetchChips, FALLBACK_CHIPS),
    initialData: FALLBACK_CHIPS,
  })

  const relationTags = chipsQuery.data.filter((c) => c.type === 'RELATION_TAG')

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
  })

  const createTagMutation = useMutation({
    mutationFn: (label: string) => createChip('RELATION_TAG', label),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.chips }),
  })

  return (
    <AppShell activePath="/people">
      <Link
        to="/people"
        className="mb-4 inline-block text-sm font-bold text-muted-foreground"
      >
        ‹ 사람
      </Link>

      <h1 className="text-[22px] font-extrabold tracking-tight">사람 추가</h1>
      <p className="mt-1 mb-6 text-xs text-muted-foreground">
        함께한 사람의 기본 정보를 남겨요
      </p>

      <PersonForm
        initialValues={personToFormValues()}
        relationTags={relationTags}
        avatarPicker="circle"
        showLastMetDate={false}
        submitLabel="등록하기"
        pending={createMutation.isPending}
        onCreateRelationTag={async (label) => {
          try {
            const chip = await createTagMutation.mutateAsync(label)
            return chip.id
          } catch {
            return null
          }
        }}
        onSubmit={(request) => {
          createMutation.mutate(request, {
            onError: () => {
              // validation handled in form; API errors surface via mutation state
            },
          })
        }}
      />

      {createMutation.isError ? (
        <p className="mt-4 text-sm text-destructive">
          저장에 실패했어요. 잠시 후 다시 시도해 주세요.
        </p>
      ) : null}
    </AppShell>
  )
}
