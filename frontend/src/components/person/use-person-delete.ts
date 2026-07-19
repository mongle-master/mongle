import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useFlow } from '@stackflow/react'
import { useState } from 'react'
import { personMutation } from '@/apis/mutations'
import { homeQuery, personQuery } from '@/apis/queries'
import { featureEvents, trackFeature } from '@/lib/analytics'

// 인물 삭제 확인 팝업 상태 + 삭제 mutation을 묶는다.
// PersonProfile과 PersonEdit이 문구, 무효화, 트래킹까지 통째로 복붙하던 흐름이라 공통화한다.
// popCount: 삭제 성공 후 걷어낼 스택 깊이. PersonProfile은 1(자기 화면),
// PersonEdit은 2(수정 화면 + 아래 깔린 프로필까지 걷어냄).
export function usePersonDelete(
  personId: number,
  { popCount = 1 }: { popCount?: number } = {},
) {
  const { pop } = useFlow()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const mutation = useMutation({
    ...personMutation.remove(),
    onSuccess: async () => {
      void trackFeature(featureEvents.personDeleted)
      await queryClient.invalidateQueries({ queryKey: personQuery.allKey })
      await queryClient.invalidateQueries({ queryKey: homeQuery.allKey })
      pop(popCount)
    },
  })

  return {
    open,
    setOpen,
    pending: mutation.isPending,
    error: mutation.isError,
    confirm: () => mutation.mutate(personId),
  }
}
