import { useActivity } from '@stackflow/react'

// push 직후 본문 마운트가 무거우면 enter 슬라이드가 통째로 사라진다:
// core는 push 시점부터 transitionDuration 타이머로 enter-done을 확정하고,
// basic-ui는 마운트 후 두 프레임 뒤에야 시작 위치(화면 밖)를 적용하므로
// (react-ui-core useLazy), 마운트 지연이 그 창을 넘기면 시작 프레임 없이
// enter-done(전환 0ms)이 되어 화면이 즉시 표시된다.
// 무거운 본문은 이 값이 true가 된 뒤 마운트해 전환 프레임을 보장한다.
// 전환 중에는 각 activity의 기존 로딩 셸을 그대로 보여준다.
export function useEnterDone() {
  const { transitionState } = useActivity()
  return transitionState !== 'enter-active'
}
