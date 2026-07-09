import { useSyncExternalStore } from 'react'

let fallbackActive = false
const listeners = new Set<() => void>()

function emitFallbackChange() {
  listeners.forEach((listener) => listener())
}

export function markApiFallbackUsed() {
  if (fallbackActive) return
  fallbackActive = true
  emitFallbackChange()
}

export function useApiFallbackStatus() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => fallbackActive,
    () => false,
  )
}
