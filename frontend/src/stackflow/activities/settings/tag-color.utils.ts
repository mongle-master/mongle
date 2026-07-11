import { normalizeChipColor } from '@/components/ui/tag-chip'

export function isLightTagColor(color: string) {
  const hex = normalizeChipColor(color).slice(1)
  const red = Number.parseInt(hex.slice(0, 2), 16)
  const green = Number.parseInt(hex.slice(2, 4), 16)
  const blue = Number.parseInt(hex.slice(4, 6), 16)
  return (red * 299 + green * 587 + blue * 114) / 1000 > 150
}
