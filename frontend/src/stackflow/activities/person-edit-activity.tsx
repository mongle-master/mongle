import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFlow } from '@stackflow/react'
import type { ActivityComponentType } from '@stackflow/react'
import { useState } from 'react'
import { ActivityShell } from '@/stackflow/components/activity-shell'
import { FormPageHeader } from '@/components/layout/form-page-header'
import { PersonForm, personToFormValues } from '@/components/person/person-form'
import { ConfirmPopup } from '@/components/ui/confirm-popup'
import { fetchChips } from '@/lib/api/chips'
import { deletePerson, fetchPerson, updatePerson } from '@/lib/api/persons'
import { formatPersonName } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { useEnterDone } from '@/stackflow/use-enter-done'

const PERSON_FORM_ID = 'person-form'

export const PersonEditActivity: ActivityComponentType<'PersonEdit'> = ({
  params,
}) => {
  const { personId } = params
  const id = Number(personId)
  const { pop } = useFlow()
  const enterDone = useEnterDone()
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
      pop()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deletePerson(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['persons'] })
      await queryClient.invalidateQueries({ queryKey: ['home'] })
      // 아래에 깔린 프로필도 삭제된 인물이므로 두 단계를 걷어낸다
      pop(2)
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

  // 폼 마운트가 무거워 enter 전환 중에는 로딩 셸만 둔다 (use-enter-done.ts)
  if (!Number.isFinite(id) || !enterDone || personQuery.isPending) {
    return (
      <ActivityShell layout="fixed">
        <p className="py-20 text-center text-sm text-muted-foreground">
          {Number.isFinite(id) ? '불러오는 중…' : '잘못된 경로예요.'}
        </p>
      </ActivityShell>
    )
  }

  if (!person || personQuery.isError) {
    return (
      <ActivityShell layout="fixed">
        <p className="py-20 text-center text-sm text-destructive">
          사람 정보를 불러오지 못했어요.
        </p>
      </ActivityShell>
    )
  }

  const initialValues = personToFormValues({
    ...person,
    relationTagChipIds: person.relationTags.map((t) => t.id),
    firstMetDate: person.firstMetDate ?? undefined,
    lastMetDate: person.lastMetDate ?? undefined,
  })

  return (
    <ActivityShell layout="fixed" className="px-0">
      <FormPageHeader
        onBack={() => pop()}
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
    </ActivityShell>
  )
}
