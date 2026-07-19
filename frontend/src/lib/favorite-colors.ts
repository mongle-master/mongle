// 즐겨찾기(별) 역할의 앰버 색. 장식/감정 역할과 섞지 않는다(색은 같아도 의미가 달라
// 별도로 바뀔 수 있으므로 역할별로 상수를 분리한다).
// 각 값은 완결된 클래스 리터럴이라 Tailwind JIT가 스캔한다 — 사용처에서 다른 클래스와
// 합칠 때도 조각내지 말고 템플릿/cn으로 최종 문자열을 그대로 유지한다.
export const FAVORITE_STAR_TEXT = 'text-amber-500'
export const FAVORITE_TOGGLE_ACTIVE =
  'bg-amber-500/12 text-amber-600 dark:text-amber-400'
