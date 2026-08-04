import * as React from 'react'

import { cn } from '@/lib/utils'

// 화면 제목(h1)의 타이포를 한 곳에 못박는다. 파일마다 굵기·자간,
// leading-tight 유무가 갈리던 복붙 드리프트를 제거한다. className은 여백 등
// 레이아웃 전용이며, 타이포는 이 컴포넌트가 계약으로 고정한다(variant 축 없음).
// 결 타이포 계약: weight 600 상한 + 자간 -0.02em(시안 A의 패널/앱 헤딩 타이포).
function PageTitle({ className, ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      data-slot="page-title"
      className={cn(
        'text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { PageTitle }
