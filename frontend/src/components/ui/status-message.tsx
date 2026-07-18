import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// 로딩·안내·에러 등 "화면에 한 줄로 뜨는 상태 문단"의 배치·타이포를 고정한다.
// 문구는 도메인(호출부)이 children으로 넣고, 여백은 화면 유형(inset)으로만 고른다.
// inset을 variant로 못박아, 파일마다 py-8/10/12/20을 임의로 고르던 드리프트를 제거한다.
const statusMessageVariants = cva('text-center text-sm', {
  variants: {
    // muted: 로딩·안내, error: 실패 문구
    tone: {
      muted: 'text-muted-foreground',
      error: 'text-destructive',
    },
    // screen: 화면/activity 셸 전체를 이 문단이 대신할 때, list: 탭·피드 리스트 하단
    inset: {
      screen: 'py-20',
      list: 'py-12',
    },
  },
  defaultVariants: {
    tone: 'muted',
    inset: 'list',
  },
})

function StatusMessage({
  className,
  tone,
  inset,
  ...props
}: React.ComponentProps<'p'> & VariantProps<typeof statusMessageVariants>) {
  return (
    <p
      data-slot="status-message"
      className={cn(statusMessageVariants({ tone, inset }), className)}
      {...props}
    />
  )
}

export { StatusMessage, statusMessageVariants }
