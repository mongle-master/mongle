import * as amplitude from '@amplitude/unified'

const apiKey = import.meta.env.VITE_AMPLITUDE_API_KEY

let initializationPromise: Promise<void> | null = null

export function initializeAnalytics() {
  if (!apiKey) return Promise.resolve()

  initializationPromise ??= amplitude
    .initAll(apiKey, {
      analytics: {
        autocapture: {
          attribution: false,
          pageViews: false,
          sessions: true,
          formInteractions: false,
          fileDownloads: false,
          elementInteractions: false,
          pageUrlEnrichment: false,
          networkTracking: false,
          webVitals: false,
          frustrationInteractions: false,
        },
        remoteConfig: {
          fetchRemoteConfig: false,
        },
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

export async function trackScreenView(screen: string) {
  if (!apiKey) return

  await initializeAnalytics()
  amplitude.track('screen_viewed', { screen })
}

export function resetAnalytics() {
  if (!apiKey) return

  amplitude.reset()
}
