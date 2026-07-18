import * as React from 'react'

import { cn } from '@/lib/utils'

// 화면 제목(h1)의 타이포를 한 곳에 못박는다. 파일마다 font-black/extrabold,
// leading-tight 유무가 갈리던 복붙 드리프트를 제거한다. className은 여백 등
// 레이아웃 전용이며, 타이포는 이 컴포넌트가 계약으로 고정한다(variant 축 없음).
function PageTitle({ className, ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      data-slot="page-title"
      className={cn(
        'text-[22px] font-black leading-tight tracking-tight text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { PageTitle }
