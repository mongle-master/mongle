/* 감정 5가족 — orb 파스텔의 유일한 의미 사용처 (design.md 도메인 확장).
   색 추가는 여기서만. 즉흥 팔레트 금지. */
export type Emotion = 'calm' | 'warm' | 'muse' | 'clear' | 'dear'

export const EMOTIONS: readonly Emotion[] = ['calm', 'warm', 'muse', 'clear', 'dear']

export const EMOTION_LABELS: Record<Emotion, string> = {
  calm: '고요',
  warm: '따뜻',
  muse: '사색',
  clear: '맑음',
  dear: '소중',
}
