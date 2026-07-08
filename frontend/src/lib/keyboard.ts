import type { KeyboardEvent } from 'react'

export function isImeComposing(event: KeyboardEvent) {
  return event.nativeEvent.isComposing || event.keyCode === 229
}
