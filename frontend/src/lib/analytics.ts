import * as amplitude from '@amplitude/unified'

const apiKey = import.meta.env.VITE_AMPLITUDE_API_KEY

let initializationPromise: Promise<void> | null = null

export function initializeAnalytics() {
  if (!apiKey) return Promise.resolve()

  initializationPromise ??= amplitude
    .initAll(apiKey, {
      analytics: {
        autocapture: false,
      },
      sessionReplay: {
        sampleRate: 1,
      },
    })
    .catch((error: unknown) => {
      console.error('Amplitude initialization failed.', error)
    })

  return initializationPromise
}

export async function setAnalyticsUserId(userId: string) {
  if (!apiKey) return

  await initializeAnalytics()
  amplitude.setUserId(userId)
}

export function resetAnalytics() {
  if (!apiKey) return

  amplitude.reset()
}
