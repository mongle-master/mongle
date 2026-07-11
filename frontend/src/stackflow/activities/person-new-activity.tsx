import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFlow } from '@stackflow/react'
import type { ActivityComponentType } from '@stackflow/react'
import { ActivityShell } from '@/stackflow/components/activity-shell'
import { FormPageHeader } from '@/components/layout/form-page-header'
import { PersonForm, personToFormValues } from '@/components/person/person-form'
import { fetchChips } from '@/lib/api/chips'
import { createPerson } from '@/lib/api/persons'
import { queryKeys } from '@/lib/query-keys'

const PERSON_FORM_ID = 'person-form'

export const PersonNewActivity: ActivityComponentType<'PersonNew'> = () => {
  const { pop, replace } = useFlow()
  const queryClient = useQueryClient()

  const chipsQuery = useQuery({
    queryKey: queryKeys.chips,
    queryFn: () => fetchChips(),
  })

  const relationTags =
    chipsQuery.data?.filter((c) => c.type === 'RELATION_TAG') ?? []

  const createMutation = useMutation({
    mutationFn: createPerson,
    onSuccess: async (person) => {
      await queryClient.invalidateQueries({ queryKey: ['persons'] })
      await queryClient.invalidateQueries({ queryKey: ['home'] })
      // 등록 화면을 새 인물 프로필로 갈아끼워, 뒤로가기 시 폼이 다시 나오지 않게 한다
      replace('Person', { personId: String(person.id) })
    },
  })

  const handleSave = () => {
    ;(
      document.getElementById(PERSON_FORM_ID) as HTMLFormElement | null
    )?.requestSubmit()
  }

  return (
    <ActivityShell layout="fixed" className="px-0">
      <FormPageHeader
        onBack={() => pop()}
        title="사람 추가"
        onSave={handleSave}
        saving={createMutation.isPending}
        saveLabel="등록"
        className="px-5"
      />

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto pb-24 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]">
        <div className="px-5 pb-8">
          <PersonForm
            formId={PERSON_FORM_ID}
            hideSubmitButton
            initialValues={personToFormValues()}
            relationTags={relationTags}
            showLastMetDate={false}
            requireFirstMetYear
            submitLabel="등록하기"
            pending={createMutation.isPending}
            greetingTitle="새로운 인물을 남겨볼까요?"
            greetingSubtitle="함께한 사람의 기본 정보를 남겨요"
            onSubmit={(request) => {
              createMutation.mutate(request, {
                onError: () => {
                  // validation handled in form; API errors surface via mutation state
                },
              })
            }}
          />

          {createMutation.isError ? (
            <p className="mt-4 text-center text-xs text-destructive">
              저장에 실패했어요. 잠시 후 다시 시도해 주세요.
            </p>
          ) : null}
        </div>
      </div>
    </ActivityShell>
  )
}
