import type { CSSProperties } from 'react'

// 관계 태그 도메인 팔레트·색상 유틸. UI 부품 레이어(components/ui)가 아니라
// lib에 두어 도메인 지식과 표현 레이어를 분리한다. 전부 export하는 이유:
// relation-force-map이 HEX_COLOR_PATTERN·hexToRgba·기본색 정책을 재발명하고
// 있어(색 불일치의 원인) 추후 이 파일을 단일 출처로 흡수시키기 위함이다.

export const RELATION_TAG_COLOR_OPTIONS = [
  { label: '로즈', value: '#E85D75' },
  { label: '코랄', value: '#F43F5E' },
  { label: '오렌지', value: '#F97316' },
  { label: '앰버', value: '#D97706' },
  { label: '라임', value: '#65A30D' },
  { label: '그린', value: '#22A06B' },
  { label: '민트', value: '#14B8A6' },
  { label: '스카이', value: '#0EA5E9' },
  { label: '블루', value: '#2563EB' },
  { label: '인디고', value: '#4F46E5' },
  { label: '바이올렛', value: '#8B5CF6' },
  { label: '퍼플', value: '#A855F7' },
  { label: '핑크', value: '#DB2777' },
  { label: '마젠타', value: '#C026D3' },
  { label: '슬레이트', value: '#475569' },
  { label: '스톤', value: '#78716C' },
] as const

export const RELATION_TAG_COLOR_PALETTE = [
  ...RELATION_TAG_COLOR_OPTIONS.map((option) => option.value),
] as const

// 색이 지정되지 않은 태그의 기본색(팔레트 첫 색 '로즈'). relation-force-map은
// 별도의 4색 해시를 쓰고 있어 같은 태그가 화면에 따라 다른 색으로 보일 수 있다.
export const DEFAULT_TAG_COLOR = RELATION_TAG_COLOR_PALETTE[0]

export const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i

export function hexToRgba(hex: string, alpha: number) {
  const normalized = HEX_COLOR_PATTERN.test(hex) ? hex : DEFAULT_TAG_COLOR
  const value = normalized.slice(1)
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function normalizeChipColor(color?: string | null) {
  if (!color) return DEFAULT_TAG_COLOR
  return HEX_COLOR_PATTERN.test(color) ? color.toUpperCase() : DEFAULT_TAG_COLOR
}

// 태그 색으로 칩을 칠하는 인라인 스타일. active면 채움, 아니면 옅은 배경.
export function coloredTagStyle(
  color?: string | null,
  active = false,
): CSSProperties {
  const normalized = normalizeChipColor(color)
  return {
    backgroundColor: active ? normalized : hexToRgba(normalized, 0.12),
    borderColor: active ? normalized : hexToRgba(normalized, 0.38),
    color: active ? '#FFFFFF' : normalized,
  }
}

// 결(Gyeol) 디자인 시스템 권장 칩 시드 팔레트. Airtable의 따뜻한 시그니처 표면을
// 텍스트 대비가 안전한 중간~어두운 톤으로 추린 것으로, 새 칩(감정·관계태그)의 기본색
// 제안·시각 레퍼런스용이다. 피커에 연결하지 않는다 — 칩 색은 백엔드에 저장되는 데이터라
// 선택지를 바꾸면 기존 데이터와 어긋날 수 있다(RELATION_TAG_COLOR_OPTIONS 는 그대로 유지).
export const GYEOL_CHIP_PALETTE = [
  '#AA2D00', // coral · 사랑
  '#D96A3D', // coral-soft
  '#D9A441', // mustard · 감사
  '#B45309', // amber · 힘듦
  '#3F7A44', // forest · 평온
  '#14B8A6', // mint
  '#1B61C9', // blue · 슬픔
  '#475569', // slate
] as const
