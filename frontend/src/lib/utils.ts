import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// styles.css @theme 의 커스텀 font-size 토큰. 기본 tailwind-merge 는 값이 없는 text-*
// 를 색상으로 보고, cn() 에서 text-foreground 같은 색상과 함께 쓰면 폰트 크기 토큰을
// 충돌로 지워 버린다(→ 상속 크기로 부풂). font-size 그룹에 명시 등록해 병합에서 살린다.
// styles.css 의 --text-* 목록과 동기화해야 한다.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: { 'font-size': [{ text: ['caption', 'label', 'body'] }] },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
