import { useRef } from 'react'

// 한 activity 안의 step 전환(퍼널·탭)용 슬라이드 조각.
// stackflow 전환은 activity push/pop에만 붙으므로 step 전환은 여기로 직접 그린다.
// motion의 x 단축 prop은 메인 스레드(rAF)에서 돌아 로딩 중 프레임이 떨어진다.
// transform 문자열이어야 하드웨어 가속 경로를 탄다.
export const slideVariants = {
  enter: (direction: number) => ({
    transform: `translateX(${direction * 100}%)`,
  }),
  center: { transform: 'translateX(0%)' },
  exit: (direction: number) => ({
    transform: `translateX(${direction * -100}%)`,
  }),
}

export const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
}

export function stepTransition(reducedMotion: boolean | null) {
  return reducedMotion
    ? { duration: 0.15 }
    : { duration: 0.3, ease: [0.32, 0.72, 0, 1] as const }
}

// 이전 step과의 순서 비교로 슬라이드 방향을 정한다 (뒤 step으로 갈수록 왼쪽으로 밀림)
export function useStepSlideDirection<T>(current: T, order: readonly T[]) {
  const lastRef = useRef(current)
  const directionRef = useRef(1)
  if (lastRef.current !== current) {
    directionRef.current =
      order.indexOf(current) > order.indexOf(lastRef.current) ? 1 : -1
    lastRef.current = current
  }
  return directionRef.current
}
