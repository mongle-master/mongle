// 감정 칩은 테두리 칩 대신 색상 있는 글자만 입힌다. 의미론적 감정(기쁨=노랑…)이
// 아니라 칩 목록 순서대로 도는 장식 팔레트라 인덱스로 찍는다.
// 클래스 리터럴을 통째로 상수에 둬야 Tailwind JIT가 스캔해 CSS를 생성한다.
// record-activity 안에만 두면 다른 화면에서 감정 색을 쓸 때 복붙해야 하므로
// 공유 상수로 뽑는다.
export const EMOTION_TEXT_COLORS = [
  'text-rose-500',
  'text-amber-500',
  'text-sky-500',
  'text-violet-500',
  'text-emerald-500',
  'text-orange-500',
] as const

export const emotionTextColor = (index: number) =>
  EMOTION_TEXT_COLORS[index % EMOTION_TEXT_COLORS.length]
