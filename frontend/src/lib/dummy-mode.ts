// 더미 데이터 모드 플래그. 'true' 문자열일 때만 켜진다 — 기본은 항상 실 API.
// 실 API와 더미가 섞이면 가짜 id가 백엔드로 제출돼 NOT_FOUND·기록 유실이 나므로
// (docs/mustpass/dummy-data-mode.md), 분기는 lib/api/* 진입점에서만 한다.
export const DUMMY_DATA_MODE = import.meta.env.FE_DUMMY_DATA === 'true'

/** 더미 모드에서 쓰기 시도 시 던진다. message는 폼 에러 UI에 그대로 노출된다. */
export class DummyModeError extends Error {
  constructor() {
    super('더미 데이터 모드에서는 저장되지 않아요.')
    this.name = 'DummyModeError'
  }
}
