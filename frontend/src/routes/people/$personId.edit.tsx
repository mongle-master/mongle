import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { FormPageHeader } from '@/components/layout/form-page-header'
import { PersonForm, personToFormValues } from '@/components/person/person-form'
import { ConfirmPopup } from '@/components/ui/confirm-popup'
import { fetchChips } from '@/lib/api/chips'
import { deletePerson, fetchPerson, updatePerson } from '@/lib/api/persons'
import { formatPersonName } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

const PERSON_FORM_ID = 'person-form'

export const Route = createFileRoute('/people/$personId/edit')({
  component: EditPersonPage,
})

function EditPersonPage() {
  const { personId } = Route.useParams()
  const id = Number(personId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const personQuery = useQuery({
    queryKey: queryKeys.person(id),
    queryFn: () => fetchPerson(id),
    enabled: Number.isFinite(id),
  })

  const chipsQuery = useQuery({
    queryKey: queryKeys.chips,
    queryFn: () => fetchChips(),
  })

  const person = personQuery.data
  const relationTags =
    chipsQuery.data?.filter((c) => c.type === 'RELATION_TAG') ?? []

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

  const handleDelete = () => {
    setDeleteOpen(true)
  }

  const handleSave = () => {
    ;(
      document.getElementById(PERSON_FORM_ID) as HTMLFormElement | null
    )?.requestSubmit()
  }

  if (!Number.isFinite(id) || personQuery.isPending) {
    return (
      <AppShell activePath="/people" layout="fixed">
        <p className="py-20 text-center text-sm text-muted-foreground">
          {personQuery.isPending ? '불러오는 중…' : '잘못된 경로예요.'}
        </p>
      </AppShell>
    )
  }

  if (!person || personQuery.isError) {
    return (
      <AppShell activePath="/people" layout="fixed">
        <p className="py-20 text-center text-sm text-destructive">
          사람 정보를 불러오지 못했어요.
        </p>
      </AppShell>
    )
  }

  const initialValues = personToFormValues({
    ...person,
    relationTagChipIds: person.relationTags.map((t) => t.id),
    firstMetDate: person.firstMetDate ?? undefined,
    lastMetDate: person.lastMetDate ?? undefined,
  })

  return (
    <AppShell activePath="/people" layout="fixed" className="px-0">
      <FormPageHeader
        back={{ to: '/people/$personId', params: { personId } }}
        title="프로필 수정"
        onSave={handleSave}
        saving={updateMutation.isPending || deleteMutation.isPending}
        className="px-5"
      />

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto pb-24 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]">
        <div className="px-5 pb-8">
          <PersonForm
            key={person.id}
            formId={PERSON_FORM_ID}
            hideSubmitButton
            initialValues={initialValues}
            relationTags={relationTags}
            submitLabel="저장하기"
            pending={updateMutation.isPending || deleteMutation.isPending}
            greetingTitle="프로필을 수정해요"
            greetingSubtitle={`${formatPersonName(person)}님의 정보를 바꿔요`}
            onSubmit={(request) => updateMutation.mutate(request)}
            onDelete={handleDelete}
          />

          {updateMutation.isError ? (
            <p className="mt-4 text-center text-xs text-destructive">
              저장에 실패했어요. 잠시 후 다시 시도해 주세요.
            </p>
          ) : null}
        </div>
      </div>

      <ConfirmPopup
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="인물을 삭제할까요?"
        description="삭제하면 되돌릴 수 없어요. 함께 새긴 기록도 모두 사라져요."
        confirmLabel="삭제"
        destructive
        pending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </AppShell>
  )
}
