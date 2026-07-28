import * as React from 'react'

import { cn } from '@/lib/utils'

// 화면 제목(h1)의 타이포를 한 곳에 못박는다. 파일마다 font-black/extrabold,
// leading-tight 유무가 갈리던 복붙 드리프트를 제거한다. className은 여백 등
// 레이아웃 전용이며, 타이포는 이 컴포넌트가 계약으로 고정한다(variant 축 없음).
// 디자인 언어(Airtable 편집 보이스): 화면 헤드라인은 산스 디스플레이 weight 400.
// 강조는 굵기가 아니라 크기와 여백으로 준다(결 design.md).
function PageTitle({ className, ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      data-slot="page-title"
      className={cn(
        'font-display text-[22px] font-normal leading-tight tracking-tight text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { PageTitle }
