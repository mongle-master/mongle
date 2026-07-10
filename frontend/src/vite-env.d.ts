interface ImportMetaEnv {
  /** 'true'일 때만 더미 데이터 모드(src/lib/dummy-mode.ts). 기본은 실 API. */
  readonly FE_DUMMY_DATA?: string
  readonly VITE_API_URL?: string
  readonly VITE_MEDIA_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
