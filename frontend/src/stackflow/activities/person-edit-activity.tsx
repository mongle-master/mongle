import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFlow } from '@stackflow/react'
import type { ActivityComponentType } from '@stackflow/react'
import { useState } from 'react'
import { ActivityShell } from '@/stackflow/components/activity-shell'
import { FormPageHeader } from '@/components/layout/form-page-header'
import { PersonEditForm } from '@/components/person/person-edit-form'
import { personToFormValues } from '@/components/person/person-form'
import { Button } from '@/components/ui/button'
import { ConfirmPopup } from '@/components/ui/confirm-popup'
import { personMutation } from '@/apis/mutations'
import { chipQuery, homeQuery, personQuery } from '@/apis/queries'
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

  const personDetailQuery = useQuery(personQuery.byId(id))

  const chipsQuery = useQuery(chipQuery.all())

  const person = personDetailQuery.data
  const relationTags =
    chipsQuery.data?.filter((c) => c.type === 'RELATION_TAG') ?? []

  const updateMutation = useMutation({
    ...personMutation.update(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: personQuery.byId(id).queryKey,
      })
      await queryClient.invalidateQueries({ queryKey: personQuery.allKey })
      await queryClient.invalidateQueries({ queryKey: homeQuery.allKey })
      pop()
    },
  })

  const deleteMutation = useMutation({
    ...personMutation.remove(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: personQuery.allKey })
      await queryClient.invalidateQueries({ queryKey: homeQuery.allKey })
      // 아래에 깔린 프로필도 삭제된 인물이므로 두 단계를 걷어낸다
      pop(2)
    },
  })

  const handleDelete = () => {
    setDeleteOpen(true)
  }

  // 폼 마운트가 무거워 enter 전환 중에는 로딩 셸만 둔다 (use-enter-done.ts)
  if (!Number.isFinite(id) || !enterDone || personDetailQuery.isPending) {
    return (
      <ActivityShell layout="fixed">
        <p className="py-20 text-center text-sm text-muted-foreground">
          {Number.isFinite(id) ? '불러오는 중…' : '잘못된 경로예요.'}
        </p>
      </ActivityShell>
    )
  }

  if (!person || personDetailQuery.isError) {
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
        className="px-5"
      />

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]">
        <div className="px-5 pt-4">
          <PersonEditForm
            key={person.id}
            formId={PERSON_FORM_ID}
            initialValues={initialValues}
            relationTags={relationTags}
            pending={updateMutation.isPending || deleteMutation.isPending}
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

      <div className="shrink-0 border-t border-border/70 bg-background px-5 pt-3 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        <Button
          type="submit"
          form={PERSON_FORM_ID}
          size="lg"
          className="h-12 w-full text-base font-extrabold"
          disabled={updateMutation.isPending || deleteMutation.isPending}
        >
          {updateMutation.isPending ? '저장 중…' : '변경사항 저장'}
        </Button>
      </div>

      <ConfirmPopup
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="인물을 삭제할까요?"
        description="삭제하면 되돌릴 수 없어요. 함께 새긴 기록도 모두 사라져요."
        error={
          deleteMutation.isError
            ? '인물을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.'
            : undefined
        }
        confirmLabel="삭제"
        destructive
        pending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(id)}
      />
    </ActivityShell>
  )
}
